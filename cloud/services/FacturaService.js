const logger = require('../logger');
const FacturaBorrador = require('../models/FacturaBorrador');

async function getById(parse, facturaId) {
  const response = { factura: null };
  try {
    const query = new parse.Query('Facturas');
    query.include('merchant');
    query.include('autonomo');
    query.include('autonomo.userProfile');
    query.include('tickets');
    query.equalTo('objectId', facturaId);

    const result = await query.first({ useMasterKey: true });

    if (result) {
      const factura = new FacturaBorrador();
      factura.loadFromParseObject(result);
      response.factura = factura;
    }
  } catch (error) {
    logger.error(`Error on 'FacturaService.getById': ${error.message}`);
  }
  return response;
}

module.exports = { getById };
