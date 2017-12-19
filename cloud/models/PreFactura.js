const _ = require('lodash');
const Autonomo = require('./Autonomo');
const Merchant = require('./Merchant');
const Ticket = require('./Ticket');

class PreFactura extends Parse.Object {
  constructor() {
    super('AutonomoTicketMerchant');
  }
  get getPlainObject() {
    return {
      id: this.id,
      mesFacturacion: this.get('mesFacturacion'),
      autonomo: this.get('autonomo')
        ? this.get('autonomo').getPlainObject
        : null,
      merchant: this.get('merchant')
        ? this.get('merchant').getPlainObject
        : null,
      tickets: this.get('tickets')
        ? _.map(this.get('tickets'), ticket => {
            return ticket.getPlainObject;
          })
        : null
    };
  }
}

Parse.Object.registerSubclass('AutonomoTicketMerchant', PreFactura);

module.exports = PreFactura;
