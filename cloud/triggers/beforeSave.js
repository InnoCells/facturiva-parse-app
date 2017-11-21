Parse.Cloud.beforeSave('Tickets', function(request, response) {
  request.log.error(request.object.get('objectId'));
  response.success();
});
