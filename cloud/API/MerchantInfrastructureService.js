const logger = require('../logger');
const Merchant = require('../models/Merchant');

async function update(updateMerchantRequest) {
  let result = null;
  try {
    const merchantQuery = new Parse.Object('Merchant');
    merchantQuery.set('objectId', updateMerchantRequest.merchantId);

    const merchant = await merchantQuery.fetch({ useMasterKey: true });
    if (merchant) {
      merchant.set('efc3', updateMerchantRequest.efc3);
      result = await merchant.save(null, { useMasterKey: true });
    }
  } catch (error) {
    throw new Error(`Error on 'updateMerchant': ${error.message}`);
  }
  return result;
}

async function getById(merchantId) {
  try {
    const query = new Parse.Query(Merchant);
    query.equalTo('objectId', merchantId);
    const result = await query.first({ useMasterKey: true });
    return result;
  } catch (error) {
    throw new Error(
      `Error on MerchantInfrastructureService.getById: ${error.message}`
    );
  }
}

module.exports = { update, getById };
