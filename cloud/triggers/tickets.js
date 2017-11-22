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

Parse.Cloud.afterSave('Tickets', async function(request) {
  try {
    if (request.object.isNew()) return;

    const newStatus = request.original.get('status');
    const oldStatus = request.object.get('status');

    request.log.error('Dirty Merchant: ', request.object.dirty('merchant'));
    request.log.error('Dirty user: ', request.object.dirty('user'));

    const changedMerchant =
      request.original.get('merchant') !== request.object.get('merchant');

    if (changedMerchant) {
      request.log.error('Se ha cambiado el merchant');
    }

    if (request.object.get('status') === 'AP') {
    }
  } catch (error) {
    request.log.error('Error on afterSave Tickets', error);
  }
});
