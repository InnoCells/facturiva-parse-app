// const _ = require('lodash');

Parse.Cloud.beforeSave('Tickets', async function(request, response) {
  const logger = request.log;
  try {
    const ticketQuery = new Parse.Query('Tickets');
    ticketQuery.equalTo('objectId', request.object.id);
    // ticketQuery.include('merchant');
    // ticketQuery.include('user');

    const ticketResult = await ticketQuery.first();

    logger.error('ticketResult: ', ticketResult);

    if (ticketResult) {
      logger.error('Entra en el if');
      // if (ticketQuery.get('merchant') !== request.object.get('merchant')) {
      const autonomoMerchantTicketQuery = new Parse.Query(
        'AutomoTicketMerchant'
      );
      autonomoMerchantTicketQuery.equalTo('autonomo', ticketResult.get('user'));
      autonomoMerchantTicketQuery.equalTo(
        'merchant',
        ticketResult.get('merchant')
      );
      const res = await autonomoMerchantTicketQuery.first();
      logger.info('beforeSave');
      if (res) {
        logger.error('Elimina registro');
        logger.info('beforeSave: ', res);
        await res.destroy();
        res.save();
      }
      // }
    }
    response.success();
  } catch (error) {
    response.error('Error on beforeSave Tickets', error);
    logger.error('Post beforeSave Ticket' + error);
    request.log.error('Error on beforeSave Tickets', error);
  }
});

Parse.Cloud.afterSave('Tickets', async function(request) {
  try {
    request.log.info('Request: ', request.object.id);
    const ticketQuery = new Parse.Query('Tickets');
    ticketQuery.equalTo('objectId', request.object.id);
    ticketQuery.include('user');
    ticketQuery.include('merchant');
    const ticketResult = await ticketQuery.first();

    if (ticketResult) {
      const merchant = ticketResult.get('merchant');
      const autonomo = ticketResult.get('user');

      if (merchant && autonomo && ticketResult.get('status') == 'AP') {
        const autonomoTicketMerchantQuery = new Parse.Query(
          'AutomoTicketMerchant'
        );
        autonomoTicketMerchantQuery.include('tickets');
        autonomoTicketMerchantQuery.equalTo('autonomo', autonomo);
        autonomoTicketMerchantQuery.equalTo('merchant', merchant);

        const result = autonomoTicketMerchantQuery.first();
        if (result) {
          const dbTickets = autonomoTicketMerchantQuery.get('tickets');
          let exsist = false;
          _.each(dbTickets, dbTicket => {
            if (dbTicket.id === ticket.id) {
              exsist = true;
              return false;
            }
            return true;
          });

          if (!exsist) {
            dbTickets.push(ticketResult);
            dbTickets.save();
          }
        } else {
          const autonomoMerchantTicket = new Parse.Object(
            'AutomoTicketMerchant'
          );
          const autonomoMerchantTicketACL = new Parse.ACL();
          autonomoMerchantTicketACL.setPublicWriteAccess(false);
          autonomoMerchantTicketACL.setPublicReadAccess(false);
          autonomoMerchantTicketACL.setRoleWriteAccess('Admin', true);
          autonomoMerchantTicketACL.setRoleReadAccess('Admin', true);
          autonomoMerchantTicket.setACL(autonomoMerchantTicketACL);
          autonomoMerchantTicket.set('autonomo', autonomo);
          autonomoMerchantTicket.set('merchant', merchant);
          autonomoMerchantTicket.set('tickets', [ticketResult]);
          autonomoMerchantTicket.save();
        }
      }
    }
  } catch (error) {
    request.log.error('Error on afterSave Tickets', error);
  }
});
