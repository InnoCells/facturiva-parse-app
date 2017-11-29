const docToPdf = require('docx-to-pdf');

module.exports = {
  getPDF(buf) {
    try {
      return new Promise(function(resolve, reject) {
        docToPdf(buf, function(err, data) {
          resolve(data);
        });
      });
    } catch (error) {
      return error;
    }
  }
};
