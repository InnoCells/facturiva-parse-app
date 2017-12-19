const _ = require('lodash');
const TipoFacturaEnum = require('../utils/tipoFacturaEnum');
const generateDOCX = require('./generateDOCX');
const generatePDF = require('./generatePDF');
const ImageUtils = require('../utils/imageUtils');
const merchantUtils = require('../utils/merchantUtils');
const dateUtils = require('../utils/dateUtils');

async function getPDF(factura, tipo) {
  try {
    if (tipo === TipoFacturaEnum.SOLICITUD) {
      return null;
    }
    const modelo = await generarModelo(factura);
    const file = await generarFacturaPDF(modelo, tipo);
    return file;
  } catch (error) {
    throw new Error(`Error al generar factura en PDF: ${error.message}`);
  }
}

async function generarFacturaPDF(model, tipo) {
  let result = null;
  try {
    if (tipo === TipoFacturaEnum.SOLICITUD) {
      return null;
    }
    const template =
      tipo === TipoFacturaEnum.BORRADOR
        ? 'factura-borrador-template.docx'
        : 'factura-template.docx';

    const docResponse = generateDOCX.createDocx(template, model);
    const response = await generatePDF.getPDF(docResponse.buffer);
    result = response.file;
  } catch (error) {
    throw new Error(`Error en 'generarFacturaPDF': ${error.message}`);
  }
  return result;
}

async function generarModelo(factura) {
  try {
    const model = {
      facturaId: factura.numeroFactura
    };
    // model.hasImage = factura.merchant.logo ? true : false;
    model.hasImage = false;
    if (model.hasImage) {
      model.imageData = await ImageUtils.getImageFromUrl(factura.merchant.logo);
      // model.image = await ImageUtils.getImageFromUrl(
      //   'https://facturivaparsedevstr.blob.core.windows.net/parse/e8f053b2e6f608299fe5d9cc7870939b_Mcdonalds_logo.png'
      // );
    }
    model.emisor = {
      nombre: factura.merchant.razonSocial,
      nifCif: factura.merchant.nifCif,
      calle: factura.merchant.direccion,
      direccionCompleta: `${factura.merchant.codigoPostal}, ${
        factura.merchant.localidad
      }, ${factura.merchant.provincia}`,
      tipo: merchantUtils.getMerchantType(factura.merchant.tipoMerchant)
    };
    model.destinatario = {
      nombre: factura.autonomo.userProfile.razonSocial,
      nifCif: factura.autonomo.userProfile.nifNie,
      calle: factura.autonomo.userProfile.domicilioSocial,
      direccionCompleta: `${factura.autonomo.userProfile.codigoPostal}, ${
        factura.autonomo.userProfile.poblacion
      }, ${factura.autonomo.userProfile.provincia}`
    };

    model.periodoFacturacion = dateUtils.getMonthYearString(
      factura.mesFacturacion,
      factura.anyoFacturacion
    );
    model.fecha = dateUtils.getStringFromDate(new Date());
    model.tickets = [];

    let totalBaseImponible = 0;
    let totalTipoImpositivo = 0;
    let totalIvaIncluido = 0;

    _.each(factura.tickets, ticket => {
      const total = ticket.importe;
      const ivaPercent = ticket.porcentajeIVA;
      const tipoImpositivo = ivaPercent / 100 * total;
      const baseImponible = total - tipoImpositivo;

      totalBaseImponible += baseImponible;
      totalTipoImpositivo += tipoImpositivo;
      totalIvaIncluido += total;

      const ticketModel = {
        total: (Math.round(total * 1000) / 1000)
          .toFixed(2)
          .toLocaleString('es-ES'),
        ivaPercent: (Math.round(ivaPercent * 1000) / 1000)
          .toFixed(2)
          .toLocaleString('es-ES'),
        tipoImpositivo: (Math.round(tipoImpositivo * 1000) / 1000)
          .toFixed(2)
          .toLocaleString('es-ES'),
        baseImponible: (Math.round(baseImponible * 1000) / 1000)
          .toFixed(2)
          .toLocaleString('es-ES')
      };
      model.tickets.push(ticketModel);
    });

    model.totales = {
      baseImponible: (Math.round(totalBaseImponible * 1000) / 1000)
        .toFixed(2)
        .toLocaleString('es-ES'),
      tipoImpositivo: (Math.round(totalTipoImpositivo * 1000) / 1000)
        .toFixed(2)
        .toLocaleString('es-ES'),
      totalIvaIncluido: (Math.round(totalIvaIncluido * 1000) / 1000)
        .toFixed(2)
        .toLocaleString('es-ES')
    };
    return model;
  } catch (error) {
    throw new Error(
      `Error al generar modelo para factura en 'PDFFacturaService.generateModelForDocx': ${
        error.message
      }`
    );
  }
}

module.exports = { getPDF };
