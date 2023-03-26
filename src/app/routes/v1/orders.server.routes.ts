import createOrder from '../../api/orders/controller/create.order.controller';
import rzpWebhook from '../../api/orders/controller/rzpWebhook.controller';
import updateOrderStatus from '../../api/orders/controller/update.status.order.controller';
import isAuthenticated from '../../../middlewares/isAuthenticated';
import checkOrderStatus from '../../api/orders/controller/order.status';
import checkBulkPayments from '../../api/orders/controller/bulk.payment.update.controller';
import dummyPayment from '../../api/orders/controller/dummy.process.order';
import UpdateRenewedStatus from '../../api/orders/controller/update.renewed.status';
import GenerateReceipt from '../../api/orders/controller/receipt.single';
import rzpLinksWebhook from '../../api/orders/controller/rzp.links.webhook';

module.exports = function (app, path = '') {
    createOrder.post(app, path + '/order/create', [isAuthenticated]);
    rzpWebhook.post(app, path + '/rzp/webhook', []);
    updateOrderStatus.put(app, path + '/order/update', [isAuthenticated]);
    checkOrderStatus.get(app, path + '/orderStatus', [isAuthenticated]);
    checkBulkPayments.post(app, path + '/bulkOrderStatus', []);
    dummyPayment.post(app, path + '/dummyPay', []);
    UpdateRenewedStatus.post(app, path + '/updateRenewdStatus', []);
    GenerateReceipt.post(app, path + '/receipt/single', [isAuthenticated]);
    rzpLinksWebhook.post(app, path + '/rzp/links/webhook', []);
};
