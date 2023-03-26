// import { uploadFile } from '../../../utils/gcloud/bucket.upload';
import {
    EXISTING_RECEIPT,
    SUCCESS_200
} from '../../../../config/constants/errorMessages';
import ReceiptDetailRepository from '../../../repository/receipt.details.repository';
import CommonService from '../../../utils/common.service';
import { IReceiptDetail } from '../user.interface';
// import Common from '../../../../config/constants/common';
import userRepository from '../../../repository/user.repository';
import User from '../../../../models/User';

class CreatorReceiptDetail extends CommonService {
    async addReceiptDetail(data: any, userId: number) {
        try {
            console.log(data);
            let payload: IReceiptDetail = {
                address: data.address,
                orgName: data.orgName,
                pinCode: data.pinCode,
                state: data.state,
                gstNumber: data.gstNumber,
                userId
            };
            // if (data.files.length > 0) {
            //     const file = data.files[0];
            //     const extension = Common.EXTENSION_MAPPING[file.mimetype];

            //     const destFileName =
            //         'gst/' +
            //         new Date().getTime() +
            //         '-' +
            //         `gst-${userId}` +
            //         extension;
            //     const url = await uploadFile(
            //         file.buffer,
            //         destFileName,
            //         process.env.BUCKET_NAME
            //     );
            //     payload['gstCertificate'] = url;
            // }

            if (data.gstCertificate) {
                payload['gstCertificate'] = data.gstCertificate;
            }

            const [detail, created] = await ReceiptDetailRepository.addDetail(
                payload
            );
            return {
                statusCode: 200,
                data: {
                    new: created,
                    detail
                },
                message: created ? SUCCESS_200 : EXISTING_RECEIPT
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async addStateScript(data: any) {
        try {
            console.log(data);
            const failed = [];
            const success = [];
            for (let item of data) {
                try {
                    const user = await User.findByPk(item.userId);
                    if (!user || user.state) {
                        failed.push(item.userId);
                        continue;
                    }

                    await User.update(
                        { state: item.state },
                        { where: { id: user.id } }
                    );
                    success.push(item.userId);
                } catch (err) {
                    failed.push(item.userId);
                }
            }
            return {
                statusCode: 200,
                data: {
                    failed,
                    success
                },
                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async fetchReceiptDetail(userId: number) {
        try {
            console.log('user', userId);
            const detail = await ReceiptDetailRepository.getDetail({
                userId
            });
            if (!detail) {
                return {
                    statusCode: 404,

                    message: 'Receipt Details Not Found'
                };
            }
            return {
                statusCode: 200,
                data: detail,
                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async editReceiptDetail(data: any, userId: number) {
        try {
            console.log(data);
            let payload = {
                address: data.address,
                orgName: data.orgName,
                pinCode: data.pinCode,
                state: data.state,
                gstNumber: data.gstNumber
            };
            // if (data.files.length > 0) {
            //     const file = data.files[0];
            //     const extension = Common.EXTENSION_MAPPING[file.mimetype];

            //     const destFileName =
            //         'gst/' +
            //         new Date().getTime() +
            //         '-' +
            //         `gst-${userId}` +
            //         extension;
            //     const url = await uploadFile(
            //         file.buffer,
            //         destFileName,
            //         process.env.BUCKET_NAME
            //     );
            //     payload['gstCertificate'] = url;
            // }
            if (data.gstCertificate) {
                payload['gstCertificate'] = data.gstCertificate;
            }
            const detail = await ReceiptDetailRepository.editDetail(
                payload,
                userId
            );
            return {
                statusCode: 200,
                data: detail,
                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async addReceiptDetailScript(alldata: any) {
        try {
            console.log(alldata);
            let count = 0;
            for (const data of alldata) {
                const user = await userRepository.findUserByMobile(data.mobile);
                let payload: IReceiptDetail = {
                    address: data.address,
                    orgName: data.orgName,
                    pinCode: data.pinCode,
                    state: data.state,
                    gstNumber: data.gstNumber,
                    userId: user.id,
                    gstCertificate: data.gstCertificate
                };

                const [detail, created] =
                    await ReceiptDetailRepository.addDetail(payload);
                if (created) {
                    count++;
                }
                console.log(detail);
            }
            console.log('script done');
            return {
                statusCode: 200,
                data: {
                    new: count,
                    total: alldata.length
                },
                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default new CreatorReceiptDetail();
