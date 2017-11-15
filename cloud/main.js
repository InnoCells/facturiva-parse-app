Parse.Cloud.job('generarFacturas', async (request, status) => {
  return status.success('Ok');
});

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});
