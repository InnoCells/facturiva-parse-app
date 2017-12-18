class UserProfile extends Parse.Object {
  constructor() {
    super('UserProfile');
  }

  get getPlainObject() {
    return {
      razonSocial: this.get('razonSocial'),
      domicilioSocial: this.get('domicilioSocial'),
      poblacion: this.get('poblacion'),
      provincia: this.get('provincia'),
      nifNie: this.get('nifNie'),
      codigoPostal: this.get('codigoPostal'),
      telefono: this.get('telefono')
    };
  }
}

Parse.Object.registerSubclass('UserProfile', UserProfile);

module.exports = UserProfile;
