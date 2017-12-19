const _ = require('lodash');
const invoiceMaker = require('./InvoiceMaker');

class Merchant extends Parse.Object {
  constructor() {
    super('Merchant');
  }

  get getPlainObject() {
    return {
      id: this.id,
      nombre: this.get('nombre'),
      direccion: this.get('direccion'),
      fuc: this.get('fuc'),
      telefono: this.get('telefono'),
      nifCif: this.get('nifCif'),
      tipoMerchant: this.get('tipoMerchant'),
      email: this.get('email'),
      codigoPostal: this.get('codigoPostal'),
      localidad: this.get('localidad'),
      provincia: this.get('provincia'),
      efc3: this.get('efc3'),
      razonSocial: this.get('razonSocial'),
      logo: this.get('logo') ? this.get('logo').url() : null,
      invoiceMakers: this.get('invoiceMakers')
        ? _.map(this.get('invoiceMakers'), invoiceMaker => {
            return invoiceMaker.getPlainObject;
          })
        : null,
      async toParseObject() {
        const merchant = new Parse.Object('Merchant');
        merchant.set('objectId', this.id);
        const result = await merchant.fetch({ useMasterKey: true });
        return result;

        // const result = new Parse.Query(Merchant);
        // result.equalTo('objectId', this.id);
        // return await result.first({ useMasterKey: true });
      }
    };
  }
}

Parse.Object.registerSubclass('Merchant', Merchant);

module.exports = Merchant;
