Parse.Cloud.beforeSave('Tickets', function(request, response) {
  request.log.error(request.object.id);
  response.success();
});
