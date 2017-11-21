Parse.Cloud.afterSave('Tickets', function(request) {
  var ticketId = request.object.get('Ticket').id;
  console.log('TicketId: ', ticketId);
});
