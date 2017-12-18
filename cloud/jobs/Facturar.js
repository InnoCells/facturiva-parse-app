const logger = require('../logger');
const PrepararFacturasService = require('../services/PrepararFacturasService');
const FacturasService = require('../services/FacturasService');
const MailService = require('../services/MailService');

Parse.Cloud.job('generarFacturas', async (request, status) => {
  try {
    await PrepararFacturasService.prepararFacturas();
    await FacturasService.generarFacturas();
    await MailService.generarEmailsFacturas();
  } catch (error) {
    logger.error(`Error al preparar las facturas: ${error.message}`);
  }
});
