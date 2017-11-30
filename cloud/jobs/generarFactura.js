require('dotenv').config();
const sendGrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
const InvoiceService = require('../services/InvoiceService');
var request = require('request').defaults({ encoding: null });
var logger = require('../logger');

async function getImage(imageUrl) {
  return new Promise(function(resolve, reject) {
    request.get(imageUrl, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const data =
          'data:' +
          response.headers['content-type'] +
          ';base64,' +
          new Buffer(body).toString('base64');
        resolve(data);
      } else {
        resolve(null);
      }
    });
  });
}

Parse.Cloud.job('generarFacturas', async (request, status) => {
  try {
    const result = await InvoiceService.getPending(Parse);
    for (var i = 0; i < result.length; i++) {
      const json = JSON.stringify(result[i]);
      console.log(json);
      // const imageContent = await getImage(result[i].merchant.logo);
      logger.error(`Merchant image url: ${result[i].merchant.logo}`);

      const a = 0;
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
