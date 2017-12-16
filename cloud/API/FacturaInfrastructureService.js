const Factura = require('../models/Factura');
const Merchant = require('../models/Merchant');
const MerchantInfrastructureService = require('./MerchantInfrastructureService');
const AutonomoInfrasctructureService = require('./AutonomoInfrasctructureService');
// async function CrearFacturaFromPreFactura(preFactura) {
//   try {
//     const merchantId = preFactura.merchant.id;
//     const fechaFacturacion = preFactura.mesFacturacion;
//     const nuevaFacturaId = await getNextInvoiceId(merchantId, fechaFacturacion);
//     if (nuevaFacturaId) {
//     }
//   } catch (error) {
//     throw new Error(
//       `Error on 'InsertCrearFacturaFromPreFactura': ${error.message}`
//     );
//   }
// }

async function InsertFactura(facturaRequest) {
  try {
    const factura = new Parse.Object('Facturas');
    const facturaACL = new Parse.ACL();
    facturaACL.setPublicWriteAccess(true);
    facturaACL.setPublicReadAccess(true);
    facturaACL.setRoleWriteAccess('Admin', true);
    facturaACL.setRoleReadAccess('Admin', true);
    factura.setACL(facturaACL);

    const merchant = await MerchantInfrastructureService.getById(
      facturaRequest.merchantId
    );
    factura.set('merchant', merchant);

    const autonomo = await AutonomoInfrasctructureService.getById(
      facturaRequest.autonomoId
    );
    factura.set('autonomo', autonomo);

    // factura.set('tickets', facturaRequest.tickets);
    factura.set('status', factura.status);
    factura.set('tipo', facturaRequest.tipo);
    factura.set('anyoFacturacion', facturaRequest.anyoFacturacion);
    factura.set('mesFacturacion', facturaRequest.mesFacturacion);
    factura.set('numeroFactura', facturaRequest.numeroFactura);
    await factura.save(null, { useMasterKey: true });
  } catch (error) {
    throw new Error(`Error en 'InsertFactura': ${error.message}`);
  }
}

async function generaNumeroFactura(merchantId, anyoFacturacion) {
  try {
    const invoiceQuery = new Parse.Query(Factura);
    const merchant = await MerchantInfrastructureService.getById(merchantId);
    invoiceQuery.equalTo('merchant', merchant);
    invoiceQuery.equalTo('anyoFacturacion', anyoFacturacion);
    invoiceQuery.descending('createdAt');
    const result = await invoiceQuery.first({ useMasterKey: true });
    const anyoFacturacionShort = anyoFacturacion.toString().substring(2);
    if (result) {
      const lastNum = result.get('numeroFactura');
      let num = parseFloat(lastNum.substring(7, lastNum.length));
      num += 1;
      return `FI${anyoFacturacionShort}001${num.toString().padStart(5, '0')}`;
    } else {
      return `FI${anyoFacturacionShort}00100001`;
    }
  } catch (error) {
    throw new Error(`Error on 'getNextInvoiceId': ${error.message}`);
  }
}

// async function getNextInvoiceIdByMerchantId(merchantId, anyoFacturacion) {
//   try {
//     const invoiceQuery = new Parse.Query(Factura);
//     invoiceQuery.equalTo('merchant', merchant);
//     invoiceQuery.equalTo('anyoFacturacion', anyoFacturacion);
//     invoiceQuery.descending('createdAt');

//     const result = await invoiceQuery.first({ useMasterKey: true });
//     const anyoFacturacionShort = anyoFacturacion.toString().substring(2);
//     if (result) {
//       const lastNum = result.get('numeroFactura');
//       let num = parseFloat(lastNum.substring(7, lastNum.length));
//       num += 1;
//       return `FI${anyoFacturacionShort}001${num.toString().padStart(5, '0')}`;
//     } else {
//       return `FI${anyoFacturacionShort}00100001`;
//     }
//   } catch (error) {
//     throw new Error(
//       `Error on 'getNextInvoiceIdByMerchantId': ${error.message}`
//     );
//   }

module.exports = { generaNumeroFactura, InsertFactura };
