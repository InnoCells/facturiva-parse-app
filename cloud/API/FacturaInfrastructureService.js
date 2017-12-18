const Factura = require('../models/Factura');
const Merchant = require('../models/Merchant');
const MerchantInfrastructureService = require('./MerchantInfrastructureService');
const AutonomoInfrasctructureService = require('./AutonomoInfrasctructureService');
const StatusFacturaEnum = require('../utils/statusFacturaEnum');

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

    const ticketQuery = new Parse.Query('Tickets');
    ticketQuery.containedIn('objectId', facturaRequest.ticketsId);
    const tickets = await ticketQuery.find({ useMasterKey: true });

    factura.set('tickets', tickets);
    factura.set('status', facturaRequest.status);
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
    const merchantQuery = new Parse.Object('Merchant');
    merchantQuery.set('objectId', merchantId);
    const merchant = await merchantQuery.fetch({ useMasterKey: true });

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

async function getByStatus(status) {
  try {
    const query = new Parse.Query(Factura);
    query.equalTo('status', status);
    query.include('merchant');
    query.include('merchant.invoiceMakers');
    query.include('autonomo');
    query.include('autonomo.userProfile');
    query.include('tickets');
    const result = await query.find({ useMasterKey: true });
    return result;
  } catch (error) {
    throw new Error(`Error on 'getByStatus':  ${error.message}`);
  }
}

async function getById(facturaId) {
  try {
    const query = new Parse.Query(Factura);
    query.equalTo('objectId', facturaId);
    query.include('merchant');
    query.include('merchant.invoiceMakers');
    query.include('autonomo');
    query.include('autonomo.userProfile');
    query.include('tickets');
    const result = await query.first({ useMasterKey: true });
    return result;
  } catch (error) {
    throw new Error(`Error on 'getByStatus':  ${error.message}`);
  }
}

async function updateFactura(updateFacturaRequest) {
  try {
    const query = new Parse.Query(Factura);
    query.equalTo('objectId', updateFacturaRequest.id);
    const factura = await query.first({ useMasterKey: true });

    factura.set('status', updateFacturaRequest.status);

    if (updateFacturaRequest.pdfFile) {
      const file = new Parse.File('factura.pdf', {
        base64: updateFacturaRequest.pdfFile.toString('base64')
      });
      factura.set('factura', file);
    }
    factura.set('tipo', updateFacturaRequest.tipo);
    await factura.save(null, { useMasterKey: true });
  } catch (error) {
    throw new Error(
      `Error en 'FacturaInfrastructureService.updateFactura': ${error.message} `
    );
  }
}

async function setStatus(facturaId, status) {
  try {
    const query = new Parse.Query(Factura);
    query.equalTo('objectId', facturaId);
    const factura = await query.first({ useMasterKey: true });
    factura.set('status', status);
    await factura.save(null, { useMasterKey: true });
  } catch (error) {
    throw new Error(
      `Error en 'FacturaInfrastructureService.updateFactura': ${error.message} `
    );
  }
}

module.exports = {
  generaNumeroFactura,
  InsertFactura,
  getByStatus,
  getById,
  updateFactura,
  setStatus
};
