const logger = require('../logger');
const PreFacturaInfrastructureService = require('../API/PreFacturaInfrastructureService');

async function prepararFacturas() {
  let result = false;
  try {
    const result = await PreFacturaInfrastructureService.getAllPreFacturas();
    return result;
  } catch (error) {
    throw new Error(
      `Error on 'prepararFacturas.prepararFacturas': ${error.message}`
    );
  }
  return result;
}

module.exports = { prepararFacturas };
