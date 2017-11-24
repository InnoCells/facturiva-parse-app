require('dotenv').config();
const sendGrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
const ticketModule = require('../classes/tickets');

Parse.Cloud.job('generarFacturas', async (request, status) => {
  try {
    const request = sendGrid.emptyRequest();
    request.body = {
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
    });

    status.success('Mail Enviado');
  } catch (error) {
    console.log(error);
    request.log.error('Error enviar mail: ', error.message);
  }
});

// email.setApiKey(process.env.SENDGRID_API_KEY);
// const emailmessage = {
//   from: 'sentfrom@yourdomain.com',
//   to: 'ernest@partners.innocells.io',
//   html: '<p></p>',
//   subject: 'Password reset for Mish Guru',
//   substitutions: { "-sub1-": "This is the new substitured text", "-sub2-": "Substitured text" }
//   template_id: 'email_test_1',
//   active: 1,
//   name: 'example_version_name'
// };
