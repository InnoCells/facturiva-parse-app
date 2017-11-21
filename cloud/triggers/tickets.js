const _ = require('lodash');

Parse.Cloud.beforeSave('Tickets', async (request, response) => {
  try {
    const ticketQuery = new Parse.Query('Tickets');
    ticketQuery.include('merchant');
    ticketQuery.include('user');
    ticketQuery.equalTo('objectId', request.object.id);

    const ticketQuery = await ticketQuery.first();
    if (ticketQuery) {
      // if (ticketQuery.get('merchant') !== request.object.get('merchant')) {
      const autonomoMerchantTicketQuery = new Parse.Query(
        'AutomoTicketMerchant'
      );
      autonomoMerchantTicketQuery.equalTo('autonomo', ticketQuery.get('user'));
      autonomoMerchantTicketQuery.equalTo(
        'merchant',
        ticketQuery.get('merchant')
      );

      const res = await autonomoMerchantTicketQuery.first();
      if (res) {
        res.delete();
        res.save();
      }
      // }
    }
    response.success();
  } catch (error) {
    response.error('Error on beforeSave Tickets', error);
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
