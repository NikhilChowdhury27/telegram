import CapturedLeads from '../../../../models/CapturedLeads';
import CommonService from '../../../utils/common.service';

class LeadsService extends CommonService {
    async captureLeads(payload: any) {
        console.log(payload);
        const [lead, created] = await CapturedLeads.findOrCreate({
            where: {
                mobile: payload.mobile
            },
            defaults: {
                ...payload
            }
        });

        if (created) {
            // send mail
        }

        return [lead, created];
    }
}

export default new LeadsService();
