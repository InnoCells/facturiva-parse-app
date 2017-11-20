const ticketModule = require('../classes/tickets');

Parse.Cloud.job('generarFacturas', async (request, status) => {
  try {
    const result = await ticketModule.getTickets();
    console.log(result);
    return status.success(`Ok - ${result}`);
  } catch (error) {
    console.log(error);
  }
});
