var request = require('request').defaults({ encoding: null });

module.exports = {
  async getImageFromUrl(imageUrl) {
    return new Promise(function(resolve, reject) {
      request.get(imageUrl, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          const data =
            'data:' +
            response.headers['content-type'] +
            ';base64,' +
            new Buffer(body).toString('base64');
          resolve(data);
        } else {
          resolve(null);
        }
      });
    });
  }
};
