const logger = require('../logger');

async function updateMerchant(updateMerchantRequest) {
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

module.exports = { updateMerchant };
