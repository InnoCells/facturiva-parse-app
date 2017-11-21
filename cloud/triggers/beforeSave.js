// const _ = require('lodash');

Parse.Cloud.beforeSave('Tickets', function(request, response) {
  const logger = request.log;

  try {
    logger.error('Request: ', request.object);
    // const ticketQuery = new Parse.Query('Tickets');
    // ticketQuery.equalTo('objectId', request.object.id);
    // ticketQuery.include('user');
    // ticketQuery.include('merchant');
    // const ticketResult = await ticketQuery.first();
    // logger.error('ticketResult 2: ', request);

    // if (ticketResult) {
    //   logger.error('Entra en el if');
    //   // if (ticketQuery.get('merchant') !== request.object.get('merchant')) {
    //   const autonomoMerchantTicketQuery = new Parse.Query(
    //     'AutomoTicketMerchant'
    //   );
    //   autonomoMerchantTicketQuery.equalTo('autonomo', ticketResult.get('user'));
    //   autonomoMerchantTicketQuery.equalTo(
    //     'merchant',
    //     ticketResult.get('merchant')
    //   );
    //   const res = await autonomoMerchantTicketQuery.first();
    //   logger.info('beforeSave');
    //   if (res) {
    //     logger.error('Elimina registro');
    //     logger.info('beforeSave: ', res);
    //     await res.destroy();
    //     res.save();
    //   }
    // }
    // }
    response.success();
  } catch (error) {
    response.error('Error on beforeSave Tickets', error);
    logger.error('Post beforeSave Ticket' + error);
    request.log.error('Error on beforeSave Tickets', error);
  }
});
