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
const InsertDraftInvoiceRequest = require('../services/DTO/InsertDraftInvoiceRequest');

async function generateModelForDocxInvoice(factura, facturaId) {
  const model = {
    facturaId: facturaId
  };
  // model.hasImage = factura.merchant.logo ? true : false;
  model.hasImage = false;
  if (model.hasImage) {
    model.imageData = await ImageUtils.getImageFromUrl(factura.merchant.logo);
    // model.image = await ImageUtils.getImageFromUrl(
    //   'https://facturivaparsedevstr.blob.core.windows.net/parse/e8f053b2e6f608299fe5d9cc7870939b_Mcdonalds_logo.png'
    // );
  }
  model.emisor = {
    nombre: factura.merchant.razonSocial,
    nifCif: factura.merchant.nifCif,
    calle: factura.merchant.direccion,
    direccionCompleta: `${factura.merchant.codigoPostal}, ${
      factura.merchant.localidad
    }, ${factura.merchant.provincia}`,
    tipo: merchantUtils.getMerchantType(factura.merchant.tipoMerchant)
  };
  model.destinatario = {
    nombre: factura.autonomo.userProfile.razonSocial,
    nifCif: factura.autonomo.userProfile.nifNie,
    calle: factura.autonomo.userProfile.domicilioSocial,
    direccionCompleta: `${factura.autonomo.userProfile.codigoPostal}, ${
      factura.autonomo.userProfile.poblacion
    }, ${factura.autonomo.userProfile.provincia}`
  };

  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  model.periodoFacturacion = dateUtils.getMonthYearString(date);
  model.fecha = dateUtils.getStringFromDate(new Date());
  model.tickets = [];

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
    model.tickets.push(ticketModel);
  });

  model.totales = {
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

  return model;
}

Parse.Cloud.job('generarFacturas', async (request, status) => {
  try {
    const result = await InvoiceService.getPending(Parse);
    for (var i = 0; i < result.length; i++) {
      const anyoFacturacion = parseFloat(
        result[i].mesFacturacion
          .getFullYear()
          .toString()
          .substr(-2)
      );

      const numeroFactura = await InvoiceService.getNextInvoiceIdByMerchantId(
        Parse,
        result[i].merchant.id,
        anyoFacturacion
      );
      const docxModel = await generateModelForDocxInvoice(
        result[i],
        numeroFactura
      );

      const doc = generateDOCX.createDocx(
        'factura-borrador-template.docx',
        docxModel
      );
      const pdf = await generatePDF.getPDF(doc);

      const request = new InsertDraftInvoiceRequest();
      request.autonomo = result[i].autonomo;
      request.file = pdf;
      request.merchant = result[i].merchant;
      request.tipo = 'B';
      request.tickets = result[i].tickets;
      request.periodoFacturacion = result[i].mesFacturacion;

      const response = await InvoiceService.insertDraftInvoice(Parse, request);

      //   fs.writeFileSync(path.resolve(__dirname, 'test.pdf'), pdf);

      //   const request = sendGrid.emptyRequest();
      //   request.body = {
      //     attachments: [
      //       {
      //         filename: 'Factura.pdf',
      //         type: 'application/pdf',
      //         disposition: 'attachment',
      //         content: pdf.toString('base64')
      //       }
      //     ],
      //     from: { email: 'info@facturiva.com', name: 'FacturIVA' },
      //     personalizations: [
      //       {
      //         to: [
      //           {
      //             email: 'ernest@partners.innocells.io',
      //             name: 'User'
      //           }
      //         ],
      //         substitutions: {
      //           '<%name%>': 'Ernest'
      //         }
      //       }
      //     ],
      //     subject: 'This is the subject',
      //     template_id: '4f3febe7-7f55-4abd-acca-3f828172349a'
      //   };

      //   request.method = 'POST';
      //   request.path = '/v3/mail/send';

      //   sendGrid.API(request, function(error, response) {
      //     console.log(response.statusCode);
      //     console.log(response.body);
      //     console.log(response.headers);
      //     if (error) {
      //       status.error('Error: ', error);
      //     }
      //   });

      //   status.success('Mail Enviado');

      //   // const imageData = ImageUtils.getImageFromUrl(result[i].merchant.logo);
      //   // const imageContent = await getImage(result[i].merchant.logo);
    }
  } catch (error) {
    console.log(error);
    logger.error('Error enviar mail: ', error.message);
  }
});

// const request = sendGrid.emptyRequest();
// request.body = {s
//   from: { email: 'info@facturiva.com', name: 'FacturIVA' },
//   personalizations: [
//     {
//       to: [
//         {
//           email: 'ernest@partners.innocells.io',
//           name: 'User'
//         }
//       ],
//       substitutions: {
//         '<%name%>': 'Ernest'
//       }
//     }
//   ],
//   subject: 'This is the subject',
//   template_id: '4f3febe7-7f55-4abd-acca-3f828172349a'
// };

// request.method = 'POST';
// request.path = '/v3/mail/send';

// sendGrid.API(request, function(error, response) {
//   console.log(response.statusCode);
//   console.log(response.body);
//   console.log(response.headers);
// });
