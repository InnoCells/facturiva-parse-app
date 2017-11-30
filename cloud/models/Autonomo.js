const UserProfile = require('./UserProfile');

class Autonomo {
  constructor() {
    this.nombre = null;
    this.apellidos = null;
    this.email = null;
    this.UserProfile = null;
  }

  loadFromParseObject(parseAutonomo) {
    if (!parseAutonomo) return;
    this.nombre = parseAutonomo.get('name');
    this.apellidos = parseAutonomo.get('surnames');
    this.email = parseAutonomo.get('email');
    if (parseAutonomo.get('userProfile')) {
      const userProfile = new UserProfile();
      userProfile.loadFromParseObject(userProfile);
      this.userProfile = userProfile;
    }
  }
}

module.exports = Autonomo;
