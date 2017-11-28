const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const docToPdf = require('docx-to-pdf');

Parse.Cloud.define('averageStars', function(request, response) {
  const content = fs.readFileSync(
    path.resolve(__dirname, 'factura-template.docx'),
    'binary'
  );
  const zip = new JSZip(content);
  const doc = new Docxtemplater();
  doc.loadZip(zip);
  doc.setData({
    clients: [
      {
        first_name: 'Jhon'
      },
      {
        first_name: 'Jane'
      }
    ]
  });

  try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render();
  } catch (error) {
    const e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties
    };
    console.log(JSON.stringify({ error: e }));
    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
    throw error;
  }

  const buf = doc.getZip().generate({ type: 'nodebuffer' });

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  // fs.writeFileSync(path.resolve(__dirname, 'factura.docx'), buf);

  try {
    docToPdf(buf, function(err, data) {
      fs.writeFileSync(path.resolve(__dirname, 'test.pdf'), data);
    });
  } catch (error) {
    console.log(error);
    const r = error;
  }
});
