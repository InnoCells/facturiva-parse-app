Parse.Cloud.beforeSave('Tickets', function(request, response) {
  request.log.error(request.object.get('numero'));
  response.success();
});
