class InvoiceMaker extends Parse.Object {
  constructor() {
    super('InvoiceMaker');
  }
  get getPlainObject() {
    return {
      id: this.id,
      nombre: this.get('nombre'),
      telefono: this.get('telefono'),
      email: this.get('email')
    };
  }
}

Parse.Object.registerSubclass('InvoiceMaker', InvoiceMaker);

module.exports = InvoiceMaker;
