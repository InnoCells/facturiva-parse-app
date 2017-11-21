const logger = require('parse-server').logger;

Parse.Cloud.afterSave('Tickets', function(request) {
  logger.log('Request: ', request.object.id);
});
