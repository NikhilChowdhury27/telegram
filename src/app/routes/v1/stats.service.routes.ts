import AllStats from '../../api/stats/controller/stats.controller';
import ReportController from '../../api/tutor/controller/request.report';
import isAuthenticated from '../../../middlewares/isAuthenticated';

module.exports = function (app, path = '') {
    AllStats.get(app, path + '/my/stats', [isAuthenticated]);
    ReportController.post(app, path + '/my/report', [isAuthenticated]);
};
