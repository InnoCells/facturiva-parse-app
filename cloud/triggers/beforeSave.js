Parse.Cloud.beforeSave('Tickets', async function(request, response) {
  try {
    const ticketQuery = new Parse.Query('Tickets');
    ticketQuery.equalTo('objectId', request.object.id);

    const result = await ticketQuery.first();

    request.log.error(result.get('numero'));

    response.success();
  } catch (error) {
    response.error('Error: ', error);
  }
});
