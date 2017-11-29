const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

module.exports = {
  createDocx(templateName, jsonData) {
    try {
      const content = fs.readFileSync(
        path.resolve(__dirname, templateName),
        'binary'
      );
      const zip = new JSZip(content);
      const doc = new Docxtemplater();
      doc.loadZip(zip);
      doc.setData(jsonData);

      try {
        doc.render();
      } catch (error) {
        return null;
      }
      const buf = doc.getZip().generate({ type: 'nodebuffer' });
      return buf;
    } catch (error) {
      return null;
    }
  }
};
