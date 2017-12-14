const Autonomo = require('./Autonomo');

class PreFactura extends Parse.Object {
  constructor(attr, options) {
    super('AutonomoTicketMerchant', attr, options);
    if (!this.id) return;
    this.id = this.id;
    this.autonomo = this.get(Autonomo);
  }
  get getPlainObject() {
    return {
      autonomo: this.get('autonomo').getPlainObject
    };
  }
}

Parse.Object.registerSubclass('AutonomoTicketMerchant', PreFactura);

module.exports = PreFactura;
