class Ticket extends Parse.Object {
  constructor() {
    super('Tickets');
  }

  get getPlainObject() {
    return {
      id: this.id,
      importe: this.get('importe'),
      merchant: this.get('merchant')
        ? this.get('merchant').getPlainObject
        : null,
      autonomo: this.get('user') ? this.get('user').getPlainObject : null,
      tipoPago: this.get('tipoPago'),
      status: this.get('status'),
      porcentajeIVA: this.get('porcentajeIVA'),
      comentarios: this.get('comments'),
      factura: this.get('factura') ? this.get('factura').getPlainObject : null,
      image: this.get('image') ? this.get('image').url() : null,
      numero: this.get('numero')
    };
  }
}

Parse.Object.registerSubclass('Tickets', Ticket);

module.exports = Ticket;
