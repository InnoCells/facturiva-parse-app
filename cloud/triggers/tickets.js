Parse.Cloud.afterSave('Tickets', async function(request) {
  request.log.info('Request: ', request.object.id);
  const ticketQuery = new Parse.Query('Tickets');
  ticketQuery.equalTo('objectId', request.object.id);
  const ticketResult = await ticketQuery.first();
});
