var request = require('request').defaults({ encoding: null });
const pdfRegularEx = /^.*.pdf$/;

async function getPdfFromUrl(pdfUrl) {
  return new Promise(function(resolve, reject) {
    request.get(pdfUrl, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        let applicationType = '';
        if (pdfRegularEx.exec(pdfUrl)) {
          applicationType = 'application/pdf';
          const data = new Buffer(body).toString('base64');
          resolve({ data: data, type: applicationType });
        } else {
          resolve(null);
        }
      }
    });
  });
}

module.exports = {
  getPdfFromUrl
};
