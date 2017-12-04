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
  model.destinatario = {
    nombre: factura.autonomo.userProfile.razonSocial,
    nifCif: factura.autonomo.userProfile.nifNie,
    calle: factura.autonomo.userProfile.domicilioSocial,
    direccionCompleta: `${factura.autonomo.userProfile.codigoPostal}, ${
      factura.autonomo.userProfile.poblacion
    }, ${factura.autonomo.userProfile.provincia}`
  };
  model.tickets = [];

  _.each(factura.tickets, ticket => {
    const total = ticket.importe;
    const ivaPercent = ticket.porcentajeIVA;
    const tipoImpositivo = ivaPercent / 100 * total;
    const baseImponible = total - tipoImpositivo;

    const ticketModel = {
      total: total.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      ivaPercent: ivaPercent.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      tipoImpositivo: tipoImpositivo.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      baseImponible: baseImponible.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    };
    model.tickets.push(ticketModel);
  });

  model.totales = {
    // baseImponible: _.sumBy(factura.tickets, 'baseImponible'),
    baseImponible: 0,
    tipoImpositivo: 0
  };
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

      const request = sendGrid.emptyRequest();
      request.body = {
        attachments: [
          {
            filename: 'Factura.pdf',
            type: 'application/pdf',
            disposition: 'attachment',
            content: pdf.toString('base64')
          }
        ],
        from: { email: 'info@facturiva.com', name: 'FacturIVA' },
        personalizations: [
          {
            to: [
              {
                email: 'ernest@partners.innocells.io',
                name: 'User'
              }
            ],
            substitutions: {
              '<%name%>': 'Ernest'
            }
          }
        ],
        subject: 'This is the subject',
        template_id: '4f3febe7-7f55-4abd-acca-3f828172349a'
      };

      request.method = 'POST';
      request.path = '/v3/mail/send';

      sendGrid.API(request, function(error, response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        if (error) {
          status.error('Error: ', error);
        }
      });

      status.success('Mail Enviado');

      // const imageData = ImageUtils.getImageFromUrl(result[i].merchant.logo);
      // const imageContent = await getImage(result[i].merchant.logo);
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
