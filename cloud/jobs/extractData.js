const ticketService = require('../services/ticketService');
const _ = require('lodash');
const xlsxTemplate = require('xlsx-template');
const fs = require('fs');
const logger = require('../logger');
const path = require('path');

const TicketStatusEnum = {
  P: { key: 'P', value: 'Pendiente de validación' },
  AP: { key: 'AP', value: 'Aceptado / Pendiente de factura' },
  AF: { key: 'AF', value: 'Aceptado y facturado' },
  AN: { key: 'AN', value: 'Aceptado y no facturado' },
  R: { key: 'R', value: 'Rechazado' }
};

Parse.Cloud.job('ExtractData', async (request, status) => {
  try {
    const model = {
      extractDate: new Date(),
      tickets: []
    };

    const result = await ticketService.getAllTickets();
    _.each(result, ticket => {
      const ticketModel = {
        numeroTicket: ticket.numeroTicket,
        fecha: ticket.fecha,
        importe: ticket.importe,
        estado: TicketStatusEnum[ticket.status].value,
        propietario: `${ticket.user.nombre} ${ticket.user.apellidos}`
      };
      model.tickets.push(ticketModel);
    });

    const xslxBuffer = fs.readFileSync(
      path.join(__dirname, 'templates', 't1.xlsx')
    );

    // Create a template
    const template = new xlsxTemplate(xslxBuffer);

    // Replacements take place on first sheet
    var sheetNumber = 1;

    // Perform substitution
    template.substitute(sheetNumber, model);

    // Get binary data
    var data = template.generate();

    fs.writeFileSync(path.resolve(__dirname, 'datos.xlsx'), data, 'binary');
  } catch (error) {
    logger.error('Error al generar XSLX: ', error.message);
  }
});
