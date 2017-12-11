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

module.exports = { getAllTickets };
