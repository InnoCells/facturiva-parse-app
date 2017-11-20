require('./jobs/generarFactura');

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});
