const _ = require('lodash');

class Factura extends Parse.Object {
  constructor() {
    super('Facturas');
  }

  get getPlainObject() {
    return {
      id: this.id,
      autonomo: this.get('autonomo')
        ? this.get('autonomo').getPlainObject
        : null,
      merchant: this.get('merchant')
        ? this.get('merchant').getPlainObject
        : null,
      status: this.get('status'),
      tipo: this.get('tipo'),
      anyoFacturacion: this.get('anyoFacturacion'),
      mesFacturacion: this.get('mesFacturacion'),
      numeroFactura: this.get('numeroFactura'),
      factura: this.get('factura') ? this.get('factura').url() : null,
      tickets: this.get('tickets')
        ? _.map(this.get('tickets'), ticket => {
            return ticket.getPlainObject;
          })
        : null
    };
  }
}

Parse.Object.registerSubclass('Facturas', Factura);

module.exports = Factura;
