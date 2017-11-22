Parse.Cloud.beforeSave('Tickets', async function(request, response) {
  // try {
  //   const newMerchant = request.object.get('merchant').id;
  //   const oldMerchant = request.original.get('merchant').id;
  //   const owner = request.object.get('user');
  //   if (newMerchant !== oldMerchant) {
  //     request.log.error('Se han cambiado los merchants');
  //     const query = new Parse.Query('AutomoTicketMerchant');
  //     query.include('tickets');
  //     query.equalTo('autonomo', owner);
  //     query.equalTo('merchant', oldMerchant);
  //     const result = await query.first();
  //     request.log.error(
  //       'Query AutonomoTicketMerchant: ',
  //       JSON.stringify(result.id)
  //     );
  //   }
  //   response.success();
  // } catch (error) {
  //   response.error('Error on beforeSave: ', error);
  // }
  response.success();
});

Parse.Cloud.afterSave('Tickets', async function(request) {
  try {
    request.log.info('Original: ', JSON.stringify(request.original));
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
