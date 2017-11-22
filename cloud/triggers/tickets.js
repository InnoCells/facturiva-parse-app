async function getAutonomoMerchantTicket(autnomo, merchant) {
  try {
    const query = new Parse.Query('AutomoTicketMerchant');
    query.include('tickets');
    query.equalTo('autonomo', autonomo);
    query.equalTo('merchant', merchant);

    const result = await query.first();
    return result;
  } catch (error) {
    throw error;
  }
}

// Parse.Cloud.beforeSave('Tickets', function(request, response) {
//   request.log.error(
//     `Merchant: ${JSON.stringify(
//       request.object.dirty('merchant')
//     )}, Status: ${JSON.stringify(request.object.dirty('status'))}`
//   );
//   response.success();
// });

Parse.Cloud.afterSave('Tickets', async function(request) {
  try {
    if (request.object.isNew()) return;

    const newStatus = request.original.get('status');
    const oldStatus = request.object.get('status');

    const changedMerchant =
      request.object.dirty('merchant') !== request.original.get('merchant');

    if (changedMerchant) {
      request.log.error('Se ha cambiado el merchant');
    }

    if (newStatus !== oldStatus) {
      request.log.error(
        `Se ha cambiado el status ${oldStatus} por el estatus ${newStatus}`
      );
    }

    if (request.object.get('status') === 'AP') {
    }
  } catch (error) {
    request.log.error('Error on afterSave Tickets', error);
  }
});
