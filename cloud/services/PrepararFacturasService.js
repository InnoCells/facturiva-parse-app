const logger = require('../logger');
const _ = require('lodash');
const PreFacturaInfrastructureService = require('../API/PreFacturaInfrastructureService');
const FacturaInfrastructureService = require('../API/FacturaInfrastructureService');
const InsertFacturaRequest = require('../API/DTO_/InsertFacturaRequest');

async function prepararFacturas() {
  try {
    const result = await PreFacturaInfrastructureService.getAllPreFacturas();
    for (var i = 0; i < result.length; i++) {
      const preFactura = result[i].getPlainObject;

      const anyoFacturacion = preFactura.mesFacturacion.getFullYear();
      const mesFacturacion = preFactura.mesFacturacion.getMonth();
      const nuevaFacturaId = await FacturaInfrastructureService.generaNumeroFactura(
        preFactura.merchant,
        anyoFacturacion
      );

      const insertRequest = new InsertFacturaRequest();
      insertRequest.numeroFactura = nuevaFacturaId;
      insertRequest.anyoFacturacion = anyoFacturacion;
      insertRequest.mesFacturacion = mesFacturacion;
      insertRequest.merchantId = preFactura.merchant.id;
      insertRequest.autonomoId = preFactura.autonomo.id;
      insertRequest.ticketsId = _.map(preFactura.tickets, ticket => {
        return ticket.id;
      });
      insertRequest.status = '';
      insertRequest.tipo = '';
      await FacturaInfrastructureService.InsertFactura(insertRequest);
    }
  } catch (error) {
    throw new Error(
      `Error on 'prepararFacturas.prepararFacturas': ${error.message}`
    );
  }
}

module.exports = { prepararFacturas };
