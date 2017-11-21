Parse.Cloud.afterSave('Tickets', function(request) {
  request.log.info('Request: ', request.object.id);
});
