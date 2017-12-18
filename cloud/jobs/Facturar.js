const logger = require('../logger');
const PrepararFacturasService = require('../services/PrepararFacturasService');

Parse.Cloud.job('generarFacturas', async (request, status) => {
  try {
    await PrepararFacturasService.prepararFacturas();
  } catch (error) {
    logger.error(`Error al preparar las facturas: ${error.message}`);
  }
});
