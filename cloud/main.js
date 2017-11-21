require('./jobs/generarFactura');
require('./triggers/tickets');

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});
