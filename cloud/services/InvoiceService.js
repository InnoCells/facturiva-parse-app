const _ = require('lodash');
const logger = require('../logger');
const Factura = require('../models/Factura');

async function getPending(parse) {
  const result = [];
  try {
    const query = new parse.Query('AutonomoTicketMerchant');
    query.include('merchant');
    query.include('merchant.invoiceMakers');
    query.include('merchant.logo');
    query.include('autonomo');
    query.include('autonomo.userProfile');
    query.include('tickets');
    query.equalTo('status', 'N');

    const queryResult = await query.find({ useMasterKey: true });
    _.each(queryResult, dbFactura => {
      const factura = new Factura();
      factura.loadFromParseObject(dbFactura);
      result.push(factura);
    });

    return result;
  } catch (error) {
    logger.error(`Error on InvoiceService.getPending: ${error.message}`);
  }
}

module.exports = { getPending };
