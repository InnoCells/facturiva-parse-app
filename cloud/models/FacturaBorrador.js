const _ = require('lodash');
const Autonomo = require('./Autonomo');
const Merchant = require('./Merchant');
const Ticket = require('./Ticket');

class FacturaBorrador {
  constructor() {
    this.id = null;
    this.autonomo = null;
    this.merchant = null;
    this.tickets = [];
    this.mesFacturacion = null;
    this.anyoFacturacion = null;
    this.status = null;
    this.tipo = null;
  }

  loadFromParseObject(parseFactura) {
    if (!parseFactura) return;
    this.id = parseFactura.id;
    this.mesFacturacion = parseFactura.get('mesFacturacion');
    this.anyoFacturacion = parseFactura.get('anyoFacturacion');
    this.tipo = parseFactura.get('tipo');
    this.status = parseFactura.get('status');
    this.autonomo = new Autonomo();
    this.autonomo.loadFromParseObject(parseFactura.get('autonomo'));
    this.merchant = new Merchant();
    this.merchant.loadFromParseObject(parseFactura.get('merchant'));

    _.each(parseFactura.get('tickets'), dbTicket => {
      const ticket = new Ticket();
      ticket.loadFromParseObject(dbTicket);
      this.tickets.push(ticket);
    });
  }
}

module.exports = FacturaBorrador;
