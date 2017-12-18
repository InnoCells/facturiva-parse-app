const logger = require('../logger');
const FacturasService = require('../services/FacturasService');

Parse.Cloud.define("generaFacturaUnica", async (request, response) => {
  try {
    await FacturasService.generarFacturaUnica(request.params.facturaId);
    response.success({ success: true });
  } catch (error) {
    logger.error(`Error on 'cloud.generaFacturaUnica': ${error.message}`);
    response.error({ success: false });
  }
});