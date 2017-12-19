const userProfile = require('./UserProfile');

class User extends Parse.User {
  constructor() {
    super(Parse.User);
  }
  get getPlainObject() {
    return {
      id: this.id,
      nombre: this.get('name'),
      apellidos: this.get('surnames'),
      userProfile: this.get('userProfile')
        ? this.get('userProfile').getPlainObject
        : null
    };
  }
}

Parse.Object.registerSubclass('_User', User);

module.exports = User;
