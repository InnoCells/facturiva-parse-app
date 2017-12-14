const logger = require('../logger');
const AutonomoMerchantTicketService = require('./AutonomoMerchantTicketService');

async function prepararFacturas() {
  let result = false;
  try {
    const result = await AutonomoMerchantTicketService.getAllPreFacturas();
    return result;
  } catch (error) {
    throw new Error(
      `Error on 'PrepararFacturasService.prepararFacturas': ${error.message}`
    );
  }
  return result;
}

module.exports = { prepararFacturas };
