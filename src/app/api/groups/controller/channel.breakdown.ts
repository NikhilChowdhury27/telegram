const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import groupService from '../services/group';
import GroupServiceV2 from '../services/group_V2';

export default class ChannelStats extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Channel wise Breakdown',
            summary: 'Channel wise Breakdown'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                groupId: Joi.number().min(1).required(),
                limit: Joi.number().default(10).optional(),
                offset: Joi.number().default(0).optional(),
                startDate: Joi.string().optional(),
                endDate: Joi.string().optional(),
                v2Enabled: Joi.boolean().default(false).optional(),
                version2: Joi.boolean().default(false).optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            if (this.data.v2Enabled === 'true') {
                if (this.data.version2 === 'true') {
                    return await GroupServiceV2.getChannelBreakdownV2(
                        this.data
                    );
                } else {
                    return await GroupServiceV2.getChannelBreakdown(this.data);
                }
            }
            return await groupService.getChannelBreakdown(this.data);
        } catch (error) {
            console.log('Channel Brakdown error', error);
            return new ResponseBuilder(500, { error }, ERROR_500);
        }
    }
}
