const FacturaInfrastructureService = require('../API/FacturaInfrastructureService');
const TipoFacturaEnum = require('../utils/tipoFacturaEnum');
const StatusFacturaEnum = require('../utils/statusFacturaEnum');
const PDFFacturaService = require('./PDFFacturaService');
const UpdateFacturaRequest = require('../API/DTO/UpdateFacturaRequest');

async function generarFacturas() {
  try {
    const newFacturas = await FacturaInfrastructureService.getByStatus(
      StatusFacturaEnum.NEW
    );

    for (var i = 0; i < newFacturas.length; i++) {
      try {
        const factura = newFacturas[i].getPlainObject;
        const tipoFactura = getTipoFactura(factura.merchant);
        const file = await PDFFacturaService.getPDF(factura, tipoFactura);

        const updateRequest = new UpdateFacturaRequest();
        updateRequest.id = factura.id;
        updateRequest.pdfFile = file;
        updateRequest.status = StatusFacturaEnum.PENDING;
        updateRequest.tipo = tipoFactura;
        await FacturaInfrastructureService.updateFactura(updateRequest);
      } catch (error) {
        throw new Error(
          `Error on 'FacturasService.generarFacturas', idFactura: ${
            factura.id
          }: ${error.message}`
        );
      }
    }
  } catch (error) {
    throw new Error(
      `Error al generar facturas 'generarFacturas': ${error.message}`
    );
  }
}

function getTipoFactura(merchant) {
  try {
    if (!merchant) {
      return null;
    }
    if (merchant.efc3) {
      return TipoFacturaEnum.FACTURA;
    } else if (merchant.efc3 === false) {
      return TipoFacturaEnum.SOLICITUD;
    } else {
      return TipoFacturaEnum.BORRADOR;
    }
  } catch (error) {
    throw new Error(
      `Error al generar facturas 'getTipoFactura': ${error.message}`
    );
  }
}

module.exports = { generarFacturas };
