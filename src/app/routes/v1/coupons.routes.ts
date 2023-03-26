import GetCoupons from '../../api/coupons/controller/get.coupons';
import isAuthenticated from '../../../middlewares/isAuthenticated';
import AddCoupons from '../../api/coupons/controller/add.coupons';
import ChangeCouponStatus from '../../api/coupons/controller/status.coupons';
import CheckCouponValidity from '../../api/coupons/controller/check.validity';
import EditCouponDetails from '../../api/coupons/controller/edit.coupon';

module.exports = function (app, path = '') {
    AddCoupons.post(app, path + '/coupons', [isAuthenticated]);
    EditCouponDetails.put(app, path + '/editCouponDetails', [isAuthenticated]);

    GetCoupons.get(app, path + '/coupons', [isAuthenticated]);
    ChangeCouponStatus.post(app, path + '/changeCouponStatus', [
        isAuthenticated
    ]);
    CheckCouponValidity.post(app, path + '/checkCouponValidity');
};
