const _ = require('lodash');

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

async function deleteTicketFromAutonomoMerchantRelationIfExsist(
  autnomo,
  merchant,
  ticket,
  logger
) {
  try {
    logger.error(`Merchant pointer: ${JSON.stringify(ticket.get('merchant'))}`);

    const query = new Parse.Query('Merchant');
    query.equalTo('objectId', merchant.id);
    const merchantResult = await query.first();

    const queryA = new Parse.Query('User');
    queryA.equalTo('objectId', autnomo.id);
    const autonomoResult = await queryA.first();

    const autonomoMerchant = new Parse.Query('AutomoTicketMerchant');
    autonomoMerchant.equalTo('autonomo', autonomoResult);
    autonomoMerchant.equalTo('merchant', merchantResult);

    const result = await autonomoMerchant.first();

    logger.error(`Merchant response: ${result.get('nombre')}`);
    // const merchant = new Parse.Query('Merchant');
    // const result = await merchant.fetch();
    // logger.error(`Merchant result: ${JSON.stringify(result)}`);
    // logger.error(`Query`);
    // const query = new Parse.Query('AutomoTicketMerchant');
    // query.include('tickets');
    // query.equalTo('autonomo', autnomo);
    // query.equalTo('merchant', merchant);
    // const result = await query.first();
    // logger.error(`PostQuery ${result}`);
    // // if (result) {
    // const indexArray = _.indexOf(result.get('tickets'), ticket);
    // logger.error(`Index array: ${indexArray}`);
    // // }
  } catch (error) {
    logger.error(
      `Error on deleteTicketFromAutonomoMerchantRelationIfExsist ${JSON.stringify(
        error
      )}`
    );
  }
}

Parse.Cloud.afterSave('Tickets', async function(request) {
  try {
    if (request.object.isNew()) return;

    const logger = request.log;

    const autonomo = request.object.get('user');
    const newStatus = request.original.get('status');
    const oldStatus = request.object.get('status');

    const newMerchant = request.original.get('merchant');
    const oldMerchant = request.object.get('merchant');

    logger.error('delete');
    const res = await deleteTicketFromAutonomoMerchantRelationIfExsist(
      autonomo,
      newMerchant,
      request.object,
      logger
    );

    // if (newStatus !== oldStatus) {
    //   if (newStatus !== 'AP') {
    //     await deleteTicketFromAutonomoMerchantRelationIfExsist(
    //       request.object.get('user'),
    //       newMerchant,
    //       request.object
    //     );
    //     //TODO: Eliminar ticket en la relacion Usuario/Merchant/Ticket
    //   } else {
    //     const autonomoMerchantTicket = new Parse.Object('AutomoTicketMerchant');
    //     const autonomoMerchantTicketACL = new Parse.ACL();
    //     autonomoMerchantTicketACL.setPublicWriteAccess(false);
    //     autonomoMerchantTicketACL.setPublicReadAccess(false);
    //     autonomoMerchantTicketACL.setRoleWriteAccess('Admin', true);
    //     autonomoMerchantTicketACL.setRoleReadAccess('Admin', true);
    //     autonomoMerchantTicket.setACL(autonomoMerchantTicketACL);
    //     autonomoMerchantTicket.set('autonomo', request.object.get('user'));
    //     autonomoMerchantTicket.set('merchant', newMerchant);
    //     autonomoMerchantTicket.set('tickets', [request.object]);
    //     autonomoMerchantTicket.save();
    //   }
    // }

    if (newMerchant !== oldMerchant) {
      //TODO: Eliminar ticket de la relacion
    }
  } catch (error) {
    request.log.error(`Error on afterSave Tickets ${error}`);
  }
});
