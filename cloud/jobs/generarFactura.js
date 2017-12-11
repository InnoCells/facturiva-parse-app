require('dotenv').config();
const _ = require('lodash');
const sendGrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
const fs = require('fs');
const path = require('path');
const generateDOCX = require('../cloud/generateDOCX');
const generatePDF = require('../cloud/generatePDF');
const logger = require('../logger');
const InvoiceService = require('../services/InvoiceService');
const ImageUtils = require('../utils/imageUtils');
const merchantUtils = require('../utils/merchantUtils');
const dateUtils = require('../utils/dateUtils');
const InsertFacturaRequest = require('../services/DTO/InsertFacturaRequest');
const {
  TIPO_FACTURA_BORRADOR,
  TIPO_FACTURA_DEFINITIVA,
  TIPO_SOLICITUD_FACTURA
} = require('../utils/tipoFacturaEnum');

const {
  InsertFacturaEventRequest,
  FACTURA_EVENT_TYPE
} = require('../services/DTO/InsertFacturaEventRequest');

const {
  UpdateFacturaRequest,
  FACTURA_STATUS
} = require('../services/DTO/UpdateFacturaRequest');

const { UpdateTicketRequest } = require('../services/DTO/UpdateTicketRequest');
const TicketService = require('../services/ticketService');

async function generateModelForDocxInvoice(factura, facturaId) {
  const response = { model: null, errors: null };
  try {
    response.model = {
      facturaId: facturaId
    };
    // model.hasImage = factura.merchant.logo ? true : false;
    response.model.hasImage = false;
    if (response.model.hasImage) {
      response.model.imageData = await ImageUtils.getImageFromUrl(
        factura.merchant.logo
      );
      // model.image = await ImageUtils.getImageFromUrl(
      //   'https://facturivaparsedevstr.blob.core.windows.net/parse/e8f053b2e6f608299fe5d9cc7870939b_Mcdonalds_logo.png'
      // );
    }
    response.model.emisor = {
      nombre: factura.merchant.razonSocial,
      nifCif: factura.merchant.nifCif,
      calle: factura.merchant.direccion,
      direccionCompleta: `${factura.merchant.codigoPostal}, ${
        factura.merchant.localidad
      }, ${factura.merchant.provincia}`,
      tipo: merchantUtils.getMerchantType(factura.merchant.tipoMerchant)
    };
    response.model.destinatario = {
      nombre: factura.autonomo.userProfile.razonSocial,
      nifCif: factura.autonomo.userProfile.nifNie,
      calle: factura.autonomo.userProfile.domicilioSocial,
      direccionCompleta: `${factura.autonomo.userProfile.codigoPostal}, ${
        factura.autonomo.userProfile.poblacion
      }, ${factura.autonomo.userProfile.provincia}`
    };

    // const date = new Date();
    // date.setMonth(date.getMonth() - 1);
    response.model.periodoFacturacion = dateUtils.getMonthYearString(
      factura.mesFacturacion
    );
    response.model.fecha = dateUtils.getStringFromDate(new Date());
    response.model.tickets = [];

    let totalBaseImponible = 0;
    let totalTipoImpositivo = 0;
    let totalIvaIncluido = 0;

    _.each(factura.tickets, ticket => {
      const total = ticket.importe;
      const ivaPercent = ticket.porcentajeIVA;
      const tipoImpositivo = ivaPercent / 100 * total;
      const baseImponible = total - tipoImpositivo;

      totalBaseImponible += baseImponible;
      totalTipoImpositivo += tipoImpositivo;
      totalIvaIncluido += total;

      const ticketModel = {
        total: (Math.round(total * 1000) / 1000)
          .toFixed(2)
          .toLocaleString('es-ES'),
        ivaPercent: (Math.round(ivaPercent * 1000) / 1000)
          .toFixed(2)
          .toLocaleString('es-ES'),
        tipoImpositivo: (Math.round(tipoImpositivo * 1000) / 1000)
          .toFixed(2)
          .toLocaleString('es-ES'),
        baseImponible: (Math.round(baseImponible * 1000) / 1000)
          .toFixed(2)
          .toLocaleString('es-ES')
      };
      response.model.tickets.push(ticketModel);
    });

    response.model.totales = {
      baseImponible: (Math.round(totalBaseImponible * 1000) / 1000)
        .toFixed(2)
        .toLocaleString('es-ES'),
      tipoImpositivo: (Math.round(totalTipoImpositivo * 1000) / 1000)
        .toFixed(2)
        .toLocaleString('es-ES'),
      totalIvaIncluido: (Math.round(totalIvaIncluido * 1000) / 1000)
        .toFixed(2)
        .toLocaleString('es-ES')
    };
  } catch (error) {
    response.errors = `Error al crear modelo para DOCX: ${error.message}`;
  }
  return response;
}

async function getNextInvoiceId(merchantId, fechaFacturacion) {
  try {
    const anyoFacturacion = parseFloat(
      fechaFacturacion
        .getFullYear()
        .toString()
        .substr(-2)
    );
    const numeroFactura = await InvoiceService.getNextInvoiceIdByMerchantId(
      Parse,
      merchantId,
      anyoFacturacion
    );
    return numeroFactura;
  } catch (error) {
    logger.error(
      `Error on getNextInvoiceId: ${error.message} para el merchant: ${
        merchantId
      }`
    );
  }
  return null;
}

function getTipoFactura(merchant) {
  const response = { error: null, tipoFactura: null };
  try {
    if (!merchant) {
      response.error = 'Merchant is undefined';
      return response;
    }

    switch (merchant.efc3) {
      case 'S': {
        response.tipoFactura = TIPO_FACTURA_DEFINITIVA;
        break;
      }
      case 'N': {
        response.tipoFactura = TIPO_SOLICITUD_FACTURA;
        break;
      }
      default: {
        response.tipoFactura = TIPO_FACTURA_BORRADOR;
        break;
      }
    }
  } catch (error) {
    response.error = error.message;
  }
  return response;
}

async function createFacturaEvent(type, factura, info) {
  try {
    const request = new InsertFacturaEventRequest();
    request.type = type;
    request.factura = factura;
    request.info = info;
    await InvoiceService.insertInvoiceEvent(Parse, request);
  } catch (error) {
    logger.error(`Error al crear un evento: ${error.message}`);
  }
}

async function crearFactura(
  autonomo,
  merchant,
  tickets,
  mesFacturacion,
  numeroFactura
) {
  const response = { factura: null, created: false, error: null };
  try {
    const request = new InsertFacturaRequest();
    request.autonomo = autonomo;
    request.merchant = merchant;

    const tipoFacturaResponse = getTipoFactura(merchant);
    if (tipoFacturaResponse.error) {
      response.error = `Error al crear factura: ${tipoFacturaResponse.error}`;
      return response;
    }
    request.tipo = tipoFacturaResponse.tipoFactura;
    request.tickets = tickets;
    request.periodoFacturacion = mesFacturacion;
    request.numeroFactura = numeroFactura;
    const insertInvoiceResponse = await InvoiceService.insertInvoice(
      Parse,
      request
    );
    response.created = insertInvoiceResponse.created;
    response.factura = insertInvoiceResponse.factura;
    response.error = insertInvoiceResponse.errors;
  } catch (error) {
    response.created = false;
    response.factura = null;
    response.error = error.message;
  }
  return response;
}

async function getTicketsAttachments(factura) {
  const result = [];
  try {
    for (var i = 0; i < factura.tickets.length; i++) {
      if (factura.tickets[i].image) {
        const imageResult = await ImageUtils.getImageFromUrl(
          factura.tickets[i].image
        );
        result.push({
          filename: `ticket${i + 1}.jpg`,
          type: imageResult.imageType,
          disposition: 'attachment',
          content: imageResult.data
        });
      }
    }
  } catch (error) {
    throw new Error(`Error al obtener tickets: ${error.message}`);
  }
  return result;
}
async function changeFacturaStatus(idFactura, status) {
  try {
    const requestUpdateFactura = new UpdateFacturaRequest();
    requestUpdateFactura.idFactura = idFactura;
    requestUpdateFactura.status = status;
    return await InvoiceService.updateInvoice(Parse, requestUpdateFactura);
  } catch (error) {
    logger.error(`Error on update factura status: ${error.message}`);
  }
}

async function generarFacturaPDF(model, esBorrador) {
  let result = null;
  try {
    const docResponse = generateDOCX.createDocx(
      esBorrador ? 'factura-borrador-template.docx' : 'factura-template.docx',
      model
    );
    const response = await generatePDF.getPDF(docResponse.buffer);
    result = response.file;
  } catch (error) {
    throw new Error(`Error en 'generarFacturaPDF': ${error.message}`);
  }
  return result;
}

async function getAttachments(factura) {
  try {
    let attachments = [];
    if (factura.merchant.efc3 !== true) {
      attachments = await getTicketsAttachments(factura);
    }
    return attachments;
  } catch (error) {
    throw new Error(`Error al generar adjuntos: ${error.message}`);
  }
}

async function appendFileInInvoice(draftInvoice, invoiceId, file) {
  try {
    const requestUpdateFactura = new UpdateFacturaRequest();
    requestUpdateFactura.idFactura = invoiceId;
    requestUpdateFactura.file = file;

    const resultUpdateInvoice = await InvoiceService.updateInvoice(
      Parse,
      requestUpdateFactura
    );
    if (resultUpdateInvoice) {
      const requestUpdateTickets = new UpdateTicketRequest();
      requestUpdateTickets.facturaId = invoiceId;
      requestUpdateTickets.ticketIds = _.map(draftInvoice.tickets, 'id');
      const res = await TicketService.updateTickets(requestUpdateTickets);
    }
  } catch (error) {
    throw new Error(`Error al asociar el pdf a la factura: ${error.message}`);
  }
}

async function getFactura(draftInvoice, numeroFactura, invoiceId) {
  let response = null;
  try {
    const pdfModel = await generateModelForDocxInvoice(
      draftInvoice,
      numeroFactura
    );
    if (draftInvoice.merchant.efc3 === true) {
      const file = await generarFacturaPDF(pdfModel.model, false);
      await appendFileInInvoice(draftInvoice, invoiceId, file);
      response = {
        filename: 'Factura.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
        content: file.toString('base64')
      };
    } else if (draftInvoice.merchant.efc3 === false) {
      // TODO
    } else {
      const file = await generarFacturaPDF(pdfModel.model, true);
      await appendFileInInvoice(invoiceId, file);
      response = {
        filename: 'FacturaBorrador.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
        content: file.toString('base64')
      };
    }
  } catch (error) {
    throw new Error(`Error en 'getFactura': ${error.message}`);
  }
  return response;
}

function getDestinatarios(factura) {
  const response = { email: null, nombre: null };
  try {
    // if (factura.merchant.efc3 === true) {
    //   response.email = factura.autonomo.email;
    //   response.nombre = `${factura.autonomo.nombre} ${
    //     factura.autonomo.apellidos
    //   }`;
    // } else {
    //   if (factura.merchant.invoiceMakers.length() === 0) {
    //     throw new Error(
    //       `El merchant ${factura.merchant.name} no tiene invoice Makers`
    //     );
    //   }
    //   response.email = factura.merchant.invoiceMakers[0].email;
    //   response.nombre = factura.merchant.invoiceMakers[0].nombre;
    // }
    response.email = 'ernest@innocells.io';
    response.nombre = 'Ernest Roca';
  } catch (error) {
    throw new Error(`Error al obtener destinatarios: ${error.message}`);
  }
  return response;
}

function getMailSubject(factura) {
  let subject = null;
  try {
    if (factura.merchant.efc3 === true) {
      subject = 'Factura';
    } else if (factura.merchant.efc3 === false) {
      subject = 'Solicitar factura de los tickets';
    } else {
      subject = 'Factura borrador';
    }
  } catch (error) {
    throw new Error(`Error al generar Subject para el email: ${error.message}`);
  }
  return subject;
}

async function getMail(draftInvoice, numeroFactura, invoiceId) {
  try {
    const request = sendGrid.emptyRequest();
    request.body = {
      from: { email: 'info@facturiva.com', name: 'FacturIVA' }
    };
    request.method = 'POST';
    request.path = '/v3/mail/send';

    request.body.attachments = await getAttachments(draftInvoice);
    const facturaFile = await getFactura(
      draftInvoice,
      numeroFactura,
      invoiceId
    );
    if (facturaFile) {
      request.body.attachments.push(facturaFile);
    }

    const destinatarios = await getDestinatarios(draftInvoice);
    if (destinatarios) {
      request.body.personalizations = [
        {
          to: [
            {
              email: destinatarios.email,
              name: destinatarios.nombre
            }
          ]
        }
      ];
    }

    request.body.subject = getMailSubject(draftInvoice);
    request.body.template_id = '4f3febe7-7f55-4abd-acca-3f828172349a';
    return request;
  } catch (error) {
    throw new Error(`Error en 'getMail': ${error.message}`);
  }
}

Parse.Cloud.job('generarFacturas', async (request, status) => {
  try {
    const result = await InvoiceService.getPending(Parse);
    for (var i = 0; i < result.length; i++) {
      const numeroFactura = await getNextInvoiceId(
        result[i].merchant.id,
        result[i].mesFacturacion
      );

      if (!numeroFactura) {
        continue;
      }

      const facturaResponse = await crearFactura(
        result[i].autonomo,
        result[i].merchant,
        result[i].tickets,
        result[i].mesFacturacion,
        numeroFactura
      );

      if (!facturaResponse.created || !facturaResponse.factura) {
        logger.error(
          `Error al crear factura: ${facturaResponse.error} DRAFT INVOICE: ${
            result[i].id
          }`
        );
        continue;
      } else {
        const deleteDraftInvoiceResult = await InvoiceService.deleteDraftInvoice(
          Parse,
          result[i].id
        );
        if (!deleteDraftInvoiceResult.deleted) {
          logger.error(
            `No se ha podido eliminar el registro en DraftInvoice: ${
              deleteDraftInvoiceResult.error
            }`
          );
          continue;
        }
      }
      let mail = null;
      try {
        mail = await getMail(
          result[i],
          numeroFactura,
          facturaResponse.factura.id
        );
      } catch (error) {
        logger.error(`Error: ${error.message}`);
        createFacturaEvent(
          FACTURA_EVENT_TYPE.error,
          facturaResponse.factura,
          `Error al generar email: ${error.message}`
        );
        changeFacturaStatus(facturaResponse.factura.id, FACTURA_STATUS.error);
      }

      if (!mail) continue;

      sendGrid.API(mail, function(error, response) {
        if (error) {
          createFacturaEvent(
            FACTURA_EVENT_TYPE.error,
            facturaResponse.factura,
            `Error al enviar email: ${error.message}`
          );
          changeFacturaStatus(facturaResponse.factura.id, FACTURA_STATUS.error);
        } else {
          createFacturaEvent(
            FACTURA_EVENT_TYPE.info,
            facturaResponse.factura,
            `Se ha enviado un email a ${
              mail.body.personalizations[0].to[0].email
            }`
          );
          changeFacturaStatus(
            facturaResponse.factura.id,
            result[i].merchant.efc3 === true
              ? FACTURA_STATUS.confirmada
              : FACTURA_STATUS.pendiente
          );
        }
      });
    }
    status.success('Success');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    status.error(`Error: ${error.message}`);
  }
});
