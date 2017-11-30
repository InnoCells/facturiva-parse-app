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

async function generateModelForDocxInvoice(factura) {
  const model = {};
  model.hasImage = factura.merchant.logo ? true : false;
  if (model.hasImage) {
    model.imageData = await ImageUtils.getImageFromUrl(factura.merchant.logo);
  }
  model.emisor = {
    nombre: factura.merchant.razonSocial,
    nifCif: factura.merchant.nifCif,
    calle: factura.merchant.direccion,
    direccionCompleta: `${factura.merchant.codigoPostal}, ${
      factura.merchant.localidad
    }, ${factura.merchant.provincia}`
  };
  model.destinatario = { nombre: factura.autonomo.nombre };
  model.tickets = [];
  _.each(factura.tickets, ticket => {
    const ticketModel = {
      total: ticket.importe,
      iva: ticket.porcentajeIVA
    };
    model.tickets.push(ticketModel);
  });
  return model;
}

Parse.Cloud.job('generarFacturas', async (request, status) => {
  try {
    const result = await InvoiceService.getPending(Parse);
    for (var i = 0; i < result.length; i++) {
      const docxModel = await generateModelForDocxInvoice(result[i]);

      const doc = generateDOCX.createDocx('factura-template.docx', docxModel);
      const pdf = await generatePDF.getPDF(doc);
      fs.writeFileSync(path.resolve(__dirname, 'test.pdf'), pdf);

      // const imageData = ImageUtils.getImageFromUrl(result[i].merchant.logo);
      // const imageContent = await getImage(result[i].merchant.logo);
    }
  } catch (error) {
    console.log(error);
    request.log.error('Error enviar mail: ', error.message);
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
