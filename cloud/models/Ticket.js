const Autonomo = require('./Autonomo');

class Ticket {
  constructor() {
    this.id = null;
    this.importe = null;
    this.tipoPago = null;
    this.status = null;
    this.comments = null;
    this.image = null;
    this.numeroTicket = null;
    this.fecha = null;
    this.porcentajeIVA = null;
    this.user = null;
    this.merchant = null;
  }

  loadFromParseObject(parseTicket) {
    if (!parseTicket) return this;
    this.id = parseTicket.id;
    this.importe = parseTicket.get('importe');
    this.tipoPago = parseTicket.get('tipoPago');
    this.status = parseTicket.get('status');
    this.comments = parseTicket.get('comments');
    this.image = parseTicket.get('image')
      ? parseTicket.get('image').url()
      : null;
    this.numeroTicket = parseTicket.get('numero');
    this.fecha = parseTicket.get('fecha');
    this.porcentajeIVA = parseTicket.get('porcentajeIVA');
    this.user = new Autonomo();
    if (parseTicket.get('user')) {
      this.user.loadFromParseObject(parseTicket.get('user'));
    }
    this.merchant = parseTicket.get('merchant');
  }
}

module.exports = Ticket;
