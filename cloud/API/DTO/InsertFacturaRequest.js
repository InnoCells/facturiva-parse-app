class InsertFacturaRequest {
  constructor() {
    this.numeroFactura = null;
    this.merchantId = null;
    this.autonomoId = null;
    this.ticketsId = [];
    this.status = null;
    this.tipo = null;
    this.anyoFacturacion = null;
    this.mesFacturacion = null;
  }
}

module.exports = InsertFacturaRequest;
