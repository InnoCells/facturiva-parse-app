const logger = require('../logger');
const PrepararFacturasService = require('../services/PrepararFacturasService');
// const Sample = require('../testflow');

Parse.Cloud.job('generarFacturas', async (request, status) => {
  try {
    // const res = Sample.foo(1);
    await PrepararFacturasService.prepararFacturas();
  } catch (error) {
    logger.error(`Error al preparar las facturas: ${error.message}`);
  }
});
