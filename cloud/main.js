Parse.Cloud.job('generarFacturas', async (request, status) => {
  status.success('Ok');
});

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});
