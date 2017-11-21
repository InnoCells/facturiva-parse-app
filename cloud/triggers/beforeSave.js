Parse.Cloud.beforeSave('Tickets', async function(request, response) {
  const ticketQuery = new Parse.Query('Tickets');
  ticketQuery.equalTo('objectId', request.object.id);

  const result = await ticketQuery.first();

  request.log.error(result.id);

  response.success();
});
