const Factura = require('../models/Factura');

async function InsertFacturaEvent(facturaEventRequest) {
  try {
    const event = new Parse.Object('FacturasEventLog');

    const facturaQuery = new Parse.Query(Factura);
    facturaQuery.equalTo('objectId', facturaEventRequest.facturaId);
    const factura = await facturaQuery.first({ useMasterKey: true });
    event.set('factura', factura);
    event.set('type', facturaEventRequest.type);
    event.set('info', facturaEventRequest.info);
    event.set('xMessageId', facturaEventRequest.xMessageId);
    await event.save(null, { useMasterKey: true });
  } catch (error) {
    throw new Error(`Error on 'InsertFacturaEvent': ${error.message}`);
  }
}
module.exports = {
  InsertFacturaEvent
};
