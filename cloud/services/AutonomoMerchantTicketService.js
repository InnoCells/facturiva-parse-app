const logger = require('../logger');
const PreFactura = require('../models/PreFactura');
const User = require('../models/Autonomo');

async function getAllPreFacturas() {
  try {
    const query = new Parse.Query(PreFactura);
    query.include('autonomo');
    const res = await query.first();
    const result = res.getPlainObject;
    return result;
  } catch (error) {
    throw new Error(
      `Error on 'AutonomoMerchantTickets.getAllPreFacturas': ${error.message}`
    );
  }
}

async function deletePreFactura() {
  try {
  } catch (error) {
    throw new Error(
      `Error on 'AutonomoMerchantTickets.deletePreFactura': ${error.message}`
    );
  }
}

module.exports = {
  getAllPreFacturas,
  deletePreFactura
};
