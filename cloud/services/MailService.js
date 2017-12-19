const logger = require('../logger');
const sendGrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
const _ = require('lodash');
const FacturaInfrastructureService = require('../API/FacturaInfrastructureService');
const StatusFacturaEnum = require('../utils/statusFacturaEnum');
const TipoFacturaEnum = require('../utils/tipoFacturaEnum');
const dateUtils = require('../utils/dateUtils');
const merchantUtils = require('../utils/merchantUtils');
const ImageUtils = require('../utils/imageUtils');
const pdfUtils = require('../utils/pdfUtils');
const {
  InsertFacturaEventRequest,
  FACTURA_EVENT_TYPE
} = require('../API/DTO/InsertFacturaEventRequest');
const FacturaEventInfrastructureService = require('../API/FacturaEventInfrastructureService');

async function generarEmailsFacturas() {
  try {
    const pendingFacturas = await FacturaInfrastructureService.getByStatus(
      StatusFacturaEnum.PENDING
    );
    for (let i = 0; i < pendingFacturas.length; i++) {
      const factura = pendingFacturas[i].getPlainObject;
      try {
        const mail = await getMail(factura);
        sendGrid.API(mail, (error, response) => {
          sendgridResponse(error, response, factura, mail);
        });
      } catch (error) {
        const request = new InsertFacturaEventRequest();
        request.facturaId = factura.id;
        request.info = `Error ${error.message}`;
        request.type = FACTURA_EVENT_TYPE.error;
        await FacturaEventInfrastructureService.InsertFacturaEvent(request);
        await FacturaInfrastructureService.setStatus(
          factura.id,
          StatusFacturaEnum.ERROR
        );
        continue;
      }
    }
  } catch (error) {
    logger.error(`Error on 'generarEmailsFacturas': ${error.message}`);
  }
}

async function sendgridResponse(error, response, factura, mail) {
  if (error) {
    const request = new InsertFacturaEventRequest();
    request.facturaId = factura.id;
    request.info = `Error al enviar email: ${JSON.stringify(error)}`;
    request.type = FACTURA_EVENT_TYPE.error;
    await FacturaEventInfrastructureService.InsertFacturaEvent(request);
    await FacturaInfrastructureService.setStatus(
      factura.id,
      StatusFacturaEnum.ERROR
    );
  } else {
    const request = new InsertFacturaEventRequest();
    request.facturaId = factura.id;
    request.info = `Se ha enviado un email a ${
      mail.body.personalizations[0].to[0].email
      }`;
    request.xMessageId = response.headers['x-message-id'];
    request.type = FACTURA_EVENT_TYPE.info;
    await FacturaEventInfrastructureService.InsertFacturaEvent(request);

    let status;
    if (factura.tipo === TipoFacturaEnum.FACTURA) {
      status = StatusFacturaEnum.FINALIZADA;
    } else {
      status = StatusFacturaEnum.WAITING_RESPONSE;
    }
    await FacturaInfrastructureService.setStatus(factura.id, status);
  }
}

async function getMail(factura) {
  try {
    const request = sendGrid.emptyRequest();
    request.body = {
      from: { email: 'info@facturiva.com', name: 'FacturIVA' }
    };
    request.method = 'POST';
    request.path = '/v3/mail/send';

    request.body.attachments = await getAttachments(factura);
    const destinatarios = await getDestinatarios(factura);
    const substitutions = generarMailModelSubstitutions(factura);

    if (destinatarios) {
      request.body.personalizations = [
        {
          to: [
            {
              email: destinatarios.email,
              name: destinatarios.nombre
            }
          ],
          substitutions: substitutions
        }
      ];
    }

    request.body.subject = getMailSubject(factura);
    request.body.template_id = getSendgridTemplate(factura);
    return request;
  } catch (error) {
    throw new Error(`Error en 'getMail': ${error.message}`);
  }
}

function getMailSubject(factura) {
  let subject = null;
  try {
    if (factura.merchant.efc3 === true) {
      subject = 'Factura';
    } else if (factura.merchant.efc3 === false) {
      subject = 'Solicitud de factura de los tickets';
    } else {
      subject = 'Factura borrador';
    }
  } catch (error) {
    throw new Error(`Error en 'getMailSubject': ${error.message}`);
  }
  return subject;
}

function getSendgridTemplate(factura) {
  try {
    if (factura.merchant.efc3 === true) {
      return process.env.FACTURA_TEMPLATEID;
    } else if (factura.merchant.efc3 === false) {
      return process.env.FACTURA_RECLAMACION_TEMPLATEID;
    } else {
      return process.env.FACTURA_BORRADOR_TEMPLATEID;
    }
  } catch (error) {
    throw new Error(`Error en 'getSendgridTemplate': ${error.message}`);
  }
}

function getDestinatarios(factura) {
  const response = { email: null, nombre: null };
  try {
    if (factura.merchant.efc3 === true) {
      response.email = factura.autonomo.email;
      response.nombre = `${factura.autonomo.nombre} ${
        factura.autonomo.apellidos
        }`;
    } else {
      if (
        !factura.merchant.invoiceMakers ||
        factura.merchant.invoiceMakers.length === 0
      ) {
        throw new Error(
          `El merchant ${factura.merchant.nombre} no tiene invoice Makers`
        );
      }
      response.email = factura.merchant.invoiceMakers[0].email;
      response.nombre = factura.merchant.invoiceMakers[0].nombre;
    }

    if (process.env.ENVIRONMENT === 'Development') {
      response.email = 'ernest@innocells.io';
      response.nombre = 'Ernest Roca';
    }
  } catch (error) {
    throw new Error(`Error en 'getDestinatarios': ${error.message}`);
  }
  return response;
}

function generarMailModelSubstitutions(factura) {
  try {
    const substitutions = {
      '*|MC_PREVIEW_TEXT|*': 'Este es el preview',
      '%MERCHANT_FULL_NAME%': factura.merchant.nombre,
      '%AUTONOMO_FULL_NAME%': `${factura.autonomo.nombre} ${
        factura.autonomo.apellidos
        }`,
      '%NUM_FACTURA%': factura.numeroFactura,
      '%FECHA_ACTUAL%': dateUtils.getStringFromDate(new Date()),
      '%MERCHANT_NAME%': factura.merchant.nombre,
      '%MERCHANT_NIF%': factura.merchant.nifCif,
      '%MERCHANT_CALLE%': factura.merchant.direccion,
      '%MERCHANT_DIRECCION_COMPLETA%': `${factura.merchant.codigoPostal}, ${
        factura.merchant.localidad
        }, ${factura.merchant.provincia}`,
      '%MERCHANT_TELEFONO%': factura.merchant.telefono,
      '%AUTONOMO_NAME%': `${factura.autonomo.nombre} ${
        factura.autonomo.apellidos
        }`,
      '%AUTONOMO_NIF%': factura.autonomo.userProfile.nifNie,
      '%AUTONOMO_CALLE%': factura.autonomo.userProfile.domicilioSocial,
      '%AUTONOMO_DIRECCION_COMPLETA%': `${
        factura.autonomo.userProfile.codigoPostal
        }, ${factura.autonomo.userProfile.poblacion}, ${
        factura.autonomo.userProfile.provincia
        }`,
      '%AUTONOMO_TELEFONO%': factura.autonomo.userProfile.telefono,
      '%PERIODO_FACTURACION%': dateUtils.getMonthYearString(
        factura.mesFacturacion
      ),
      '%TABLE_DETAIL%': getTableDetail(factura),
      '%LINK_VALIDA%': `${process.env.FACTURIVA_WEB_URL}/Validate/${factura.id}`
    };
    return substitutions;
  } catch (error) {
    throw new Error(`Error on 'generateMailModel': ${error.message}`);
  }
}

function getTableDetail(factura) {
  let table = `<table class="tableContent detail">
  <thead>
    <th>Tipo Servicio</th>
    <th>Base Imponible</th>
    <th>Tipo Impositivo</th>
    <th>IVA</th>
    <th>Total IVA Incluído</th>
  </thead>
  <tbody>
 `;
  try {
    let totalBaseImponible = 0,
      totalTipoImpositivo = 0,
      totalIvaIncluido = 0;

    const merchantType = merchantUtils.getMerchantType(
      factura.merchant.tipoMerchant
    );
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
      table += ` 
       <tr>
        <td>
          <span>${merchantType}</span>
        </td>
        <td>
          <span>${ticketModel.baseImponible}</span>
        </td>
        <td>
          <span>${ticketModel.ivaPercent}%</span>
        </td>
        <td>
          <span>${ticketModel.tipoImpositivo}</span>
        </td>
        <td>
          <span>${ticketModel.total}</span>
        </td>
      </tr>`;
    });

    table += `<tr>
      <td>
        <span>
          <strong>Totales</strong>
        </span>
      </td>
      <td>
        <span>${(Math.round(totalBaseImponible * 1000) / 1000)
        .toFixed(2)
        .toLocaleString('es-ES')}</span>
      </td>
      <td>
        <span>&nbsp;</span>
      </td>
      <td>
        <span>${(Math.round(totalTipoImpositivo * 1000) / 1000)
        .toFixed(2)
        .toLocaleString('es-ES')}</span>
      </td>
      <td>
        <strong>
          <span>${(Math.round(totalIvaIncluido * 1000) / 1000)
        .toFixed(2)
        .toLocaleString('es-ES')}</span>
        </strong>
      </td>
    </tr>`;

    table += `</tbody>
    </table>`;
    return table;
  } catch (error) {
    throw new Error(`Error en 'getTableDetail': ${error.message}`);
  }
}

async function getAttachments(factura) {
  try {
    let attachments = [];
    if (factura.merchant.efc3 !== true) {
      attachments = await getTicketsAttachments(factura);
    }

    const pdf = await getFacturaPDF(factura);
    if (pdf) {
      attachments.push(pdf);
    }
    return attachments;
  } catch (error) {
    throw new Error(`Error en 'getAttachments': ${error.message}`);
  }
}
async function getFacturaPDF(factura) {
  try {
    if (factura.tipo === TipoFacturaEnum.SOLICITUD) {
      return null;
    }

    if (factura.factura) {
      let facturaName;
      if (factura.tipo === TipoFacturaEnum.BORRADOR) {
        facturaName = 'FacturaBorrador.pdf';
      } else if (factura.tipo === TipoFacturaEnum.FACTURA) {
        facturaName = 'Factura.pdf';
      }
      const facturaFile = await pdfUtils.getPdfFromUrl(factura.factura);
      return {
        filename: facturaName,
        type: facturaFile.type,
        disposition: 'attachment',
        content: facturaFile.data
      };
    }
    return null;
  } catch (error) {
    throw new Error(`Error on 'getFacturaPDF': ${error.message}`);
  }
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
    throw new Error(`Error en 'getTicketsAttachments': ${error.message}`);
  }
  return result;
}

module.exports = {
  generarEmailsFacturas
};
