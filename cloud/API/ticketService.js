const _ = require('lodash');
const Ticket = require('../models/Ticket');
const logger = require('../logger');

async function getAllTickets() {
  const result = [];
  try {
    const ticketQuery = new Parse.Query('Tickets');
    ticketQuery.limit(1000);
    ticketQuery.include('merchant');
    ticketQuery.include('user');
    const ticketResult = await ticketQuery.find({ useMasterKey: true });
    _.map(ticketResult, dbTicket => {
      const ticket = new Ticket();
      ticket.loadFromParseObject(dbTicket);
      result.push(ticket);
    });
    return result;
  } catch (error) {
    logger.error('Error al recuperar tickets: ', error.message);
  }
}

async function getInvoiceById(idFactura) {
  try {
    const factura = new Parse.Object('Facturas');
    factura.set('objectId', idFactura);
    const result = await factura.fetch();
    return result;
  } catch (error) {
    logger.error('Error al recuperar la Factura: ', error.message);
  }
}

async function updateTickets(request) {
  try {
    const factura = await getInvoiceById(request.facturaId);

    const updateQuery = new Parse.Query('Tickets');
    updateQuery.containedIn('objectId', request.ticketIds);
    const result = await updateQuery.find({ useMasterKey: true });

    for (var i = 0; i < result.length; i++) {
      result[i].set('factura', factura);
      await result[i].save(null, { useMasterKey: true });
    }

    return result.length > 0;
  } catch (error) {
    logger.error('Error al asociar tickets a Factura: ', error.message);
  }
}

module.exports = { getAllTickets, updateTickets };
