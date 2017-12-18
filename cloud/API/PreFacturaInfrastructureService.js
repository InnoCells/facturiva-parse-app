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
    const queryResult = await query.find({ useMasterKey: true });
    return queryResult;
  } catch (error) {
    throw new Error(
      `Error on 'AutonomoMerchantTickets.getAllPreFacturas': ${error.message}`
    );
  }
}

async function deletePreFacturaById(preFacturaId) {
  try {
    const preFacturaQuery = new Parse.Object('AutonomoTicketMerchant');
    preFacturaQuery.set('objectId', preFacturaId);
    const preFacturaObject = await preFacturaQuery.fetch({
      useMasterKey: true
    });
    if (preFacturaObject) {
      await preFacturaObject.destroy();
    }
  } catch (error) {
    throw new Error(
      `Error on 'AutonomoMerchantTickets.deletePreFactura': ${error.message}`
    );
  }
}

module.exports = {
  getAllPreFacturas,
  deletePreFacturaById
};
