const Autonomo = require('../models/Autonomo');

async function getById(autonomoId) {
  try {
    const query = new Parse.Query(Autonomo);
    query.equalTo('objectId', autonomoId);
    const result = await query.first({ useMasterKey: true });
    return result;
  } catch (error) {
    throw new Error(
      `Error on 'AutonomoInfrastructureService.getById': ${error.message}`
    );
  }
}

module.exports = { getById };
