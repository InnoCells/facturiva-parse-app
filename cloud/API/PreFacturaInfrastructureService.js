const logger = require('../logger');
const PreFactura = require('../models/PreFactura');

async function getAllPreFacturas() {
  try {
    const query = new Parse.Query(PreFactura);
    query.include('autonomo');
    query.include('autonomo.userProfile');
    query.include('merchant');
    query.include('merchant.invoiceMakers');
    query.include('tickets');
    const res = await query.first({ useMasterKey: true });
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
