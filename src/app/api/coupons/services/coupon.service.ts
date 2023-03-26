const { ResponseBuilder } = require('base-packages');
import GroupDetailsRepository from '../../../repository/group.repository';
import CommonService from '../../../utils/common.service';

import Coupons from '../../../../models/Coupon';
import CouponsMapping from '../../../../models/couponMapping';
import { SUCCESS_200 } from '../../../../config/constants/errorMessages';
import GroupDetails from '../../../../models/GroupDetail';
import Group from '../../../utils/group';
import GroupSubscriptionPlans from '../../../../models/GroupSubscriptionPlan';

class CouponService extends CommonService {
    async add(payload: any) {
        try {
            const { name, plans, type, groupId, value, isVisible } = payload;
            const [group, coupon, subscriptionPlan] = await Promise.all([
                GroupDetailsRepository.findGroupById(payload.groupId),
                Coupons.findOne({
                    where: {
                        groupId: groupId,
                        name: name,
                        isdeleted: false
                    },
                    raw: true
                }),
                GroupSubscriptionPlans.findAll({
                    where: {
                        groupId: groupId,
                        isDeleted: false
                    },
                    raw: true
                })
            ]);

            if (!group) {
                throw new Error('not a valid group');
            }
            if (coupon && coupon.id) {
                throw new Error('coupon with this name already exists');
            }

            // const subscriptionPlan = JSON.parse(group.subscriptionPlan);
            const validPlans = [];
            console.log(plans, subscriptionPlan);

            for (let i = 0; i < plans.length; i++) {
                const filteredPlan = subscriptionPlan.filter(
                    (plan) => plan.id === plans[i]
                );
                if (filteredPlan.length) {
                    validPlans.push(plans[i]);
                }
            }
            if (!validPlans.length) {
                throw new Error(
                    'Please select atleast one valid plan to create coupon'
                );
            }

            const createdCoupon = await Coupons.create({
                groupId,
                name,
                type,
                value,
                isVisible,
                isActive: 1
            });

            const couponPlans = validPlans.map((plan) => ({
                couponId: createdCoupon.id,
                groupId,
                plan: plan,
                isActive: 1
            }));
            const couponMapping = await CouponsMapping.bulkCreate(couponPlans);
            console.log('couponsMapping', couponMapping);
            return new ResponseBuilder(200, createdCoupon, SUCCESS_200);
        } catch (error) {
            return new ResponseBuilder(400, {}, error.message);
        }
    }

    async get(data: any, userId: number) {
        try {
            const { groupId } = data;
            const coupons = await Coupons.findAll({
                where: {
                    groupId,
                    isdeleted: false
                },
                attributes: [
                    'id',
                    'groupId',
                    'name',
                    'type',
                    'value',
                    'isActive',
                    'isdeleted',
                    'userType',
                    'isVisible',
                    'memberCount',
                    'totalEarnings'
                ],
                include: [
                    {
                        model: GroupDetails,
                        where: {
                            createdBy: userId
                        },
                        attributes: ['groupName', 'about']
                    },
                    {
                        model: CouponsMapping,
                        as: 'couponsMapping',
                        where: {
                            groupId: groupId,
                            isActive: true
                        },
                        order: [['createdAt', 'DESC']],
                        paranoid: true,
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']],
                logging: true,
                nest: true
                // raw: true
            });

            const finalCoupons = coupons.map((coupon) => ({
                ...coupon['dataValues'],
                shareableText: `Get ${coupon?.value}${
                    coupon?.type === 'discount' ? '₹' : '%'
                } OFF using “${coupon?.name}” for ${
                    coupon?.group?.groupName
                } Telegram Channel. Click on the given link and apply your coupon code - ${
                    process.env.PAYMENT_DOMAIN
                }/g/${coupon?.groupId}
                `,
                paymentLink: `${process.env.PAYMENT_DOMAIN}/g/${coupon?.groupId}`
            }));

            for (let coupon of finalCoupons) {
                if (coupon.isActive) {
                    coupon['shareLinks'] = await Group.links(
                        coupon?.groupId,
                        coupon?.group?.groupName,
                        coupon?.group?.about,
                        coupon?.shareableText
                    );
                }
            }
            console.log('Got Coupons', finalCoupons);
            return new ResponseBuilder(200, finalCoupons, SUCCESS_200);
        } catch (error) {
            return new ResponseBuilder(400, {}, error.message);
        }
    }

    async changeCouponStatus(data: any) {
        try {
            const update = {};
            let coupon;
            if (data.deleted) {
                update['isdeleted'] = true;
                update['deletedAt'] = new Date();
                update['isActive'] = false;
                coupon = await Coupons.update(update, {
                    where: {
                        id: data.couponId
                    },
                    logging: true
                });
            } else if (data.isActive == false) {
                update['isActive'] = data.isActive;
                coupon = await Coupons.update(update, {
                    where: {
                        id: data.couponId
                    },
                    logging: true
                });
            } else if (data.isActive || data.isActive == false) {
                update['isActive'] = data.isActive;
                return await this.checkCouponForActivation(data.couponId);
            }

            return new ResponseBuilder(200, coupon, SUCCESS_200);
        } catch (error) {
            return new ResponseBuilder(400, {}, error.message);
        }
    }

    async checkCouponValidity(data: any) {
        try {
            const { couponName, groupId, plan } = data;
            const [group, coupon, subscriptionPlan] = await Promise.all([
                GroupDetailsRepository.findGroupById(groupId),
                Coupons.findOne({
                    where: {
                        groupId: groupId,
                        name: couponName,
                        isActive: true,
                        isdeleted: false
                    },
                    attributes: ['type', 'value'],
                    include: [
                        {
                            model: CouponsMapping,
                            as: 'couponsMapping',
                            where: {
                                groupId: groupId,
                                isActive: true
                            },
                            paranoid: true,
                            required: false
                        }
                    ],
                    logging: true,
                    nest: true
                }),
                GroupSubscriptionPlans.findAll({
                    where: {
                        groupId: groupId,
                        isDeleted: false
                    },
                    raw: true
                })
            ]);

            if (!coupon) {
                throw new Error('Coupon Name invalid');
            }
            if (!group) {
                throw new Error('Invalid group');
            }
            const allPlansData = [];
            const currentPlanData = {};
            const couponsMapping = JSON.parse(
                JSON.stringify(coupon.couponsMapping)
            );
            console.log('checking plans', plan.id);
            // const couponValidPlan = couponsMapping.find(
            //     (couponplan) => couponplan.plan === plan.id
            // );
            // console.log(couponsMapping, couponValidPlan);
            // if (!couponValidPlan) {
            //     throw new Error(
            //         'This coupon is not valid for the selected plan'
            //     );
            // }
            for (let currentPlan of subscriptionPlan) {
                let couponPlanCheck = couponsMapping.find(
                    (couponPlan) => couponPlan.plan === currentPlan.id
                );
                if (plan.id === currentPlan.id) {
                    currentPlanData['planPrice'] = currentPlan.price;
                    currentPlanData['planDiscount'] = currentPlan.discount;
                }
                console.log(couponPlanCheck);
                if (!couponPlanCheck) {
                    continue;
                }
                let finalPrice = 0;
                let couponDiscount = 0;

                if (coupon.type === 'discount') {
                    finalPrice = Number(
                        (
                            currentPlan.price -
                            currentPlan.discount -
                            Number(coupon.value)
                        ).toFixed(2)
                    );
                    couponDiscount = Number(Number(coupon.value).toFixed(2));
                } else if (coupon.type === 'percentage') {
                    let planPrice = currentPlan.price - currentPlan.discount;
                    couponDiscount = Number(
                        ((Number(coupon.value) / 100) * planPrice).toFixed(2)
                    );
                    finalPrice = Number(
                        (planPrice - couponDiscount).toFixed(2)
                    );
                }
                console.log(finalPrice);

                if (plan.id === currentPlan.id && finalPrice >= 2) {
                    currentPlanData['couponDiscount'] = couponDiscount;
                    currentPlanData['finalPrice'] = finalPrice;
                } else if (finalPrice < 2) {
                    continue;
                } else {
                    allPlansData.push({
                        planPrice: currentPlan.price,
                        planDiscount: currentPlan.discount,
                        couponDiscount: couponDiscount,
                        finalPrice: finalPrice,
                        planId: currentPlan.id
                    });
                }
            }
            // const selectedPlan = JSON.parse(plan);
            // const isValidPlan = subscriptionPlan.find(
            //     (plan) =>
            //         (plan.selectedPeriod === 'Custom Period'
            //             ? plan.periodTitle
            //             : plan.selectedPeriod) ===
            //         (selectedPlan.selectedPeriod === 'Custom Period'
            //             ? selectedPlan.periodTitle
            //             : selectedPlan.selectedPeriod)
            // );

            // if (!couponPlanCheck) {
            //     throw new Error('Coupon is not valid for this plan');
            // }

            return new ResponseBuilder(
                200,
                {
                    allPlansData: allPlansData,
                    currentPlanData
                },
                SUCCESS_200
            );
        } catch (error) {
            return new ResponseBuilder(400, {}, error.message);
        }
    }

    async editCoupon(data: any) {
        try {
            const { groupId, couponId, plans, type, value, isVisible } = data;
            const [group, coupon, subscriptionPlans] = await Promise.all([
                GroupDetailsRepository.findGroupById(groupId),
                Coupons.findOne({
                    where: {
                        groupId: groupId,
                        id: couponId,
                        isdeleted: false
                    },
                    attributes: ['type', 'value', 'id'],
                    include: [
                        {
                            model: CouponsMapping,
                            as: 'couponsMapping',
                            where: {
                                groupId: groupId
                            },
                            paranoid: true,
                            required: false
                        }
                    ],
                    logging: true,
                    nest: true
                }),
                GroupSubscriptionPlans.findAll({
                    where: {
                        groupId: groupId,
                        isDeleted: false
                    },
                    raw: true
                })
            ]);

            if (!coupon) {
                throw new Error('Coupon Name invalid');
            }
            if (!group) {
                throw new Error('Group not found');
            }

            // const subscriptionPlans = JSON.parse(group.subscriptionPlan);
            const couponsMapping = JSON.parse(
                JSON.stringify(coupon.couponsMapping)
            );
            const couponMappingArray = [];
            for (let i = 0; i < plans.length; i++) {
                const couponPlan = couponsMapping.find((data) => {
                    return data.plan === plans[i].plan;
                });
                const subscriptionFiltered = subscriptionPlans.find(
                    (selectedPlan) => selectedPlan.id === plans[i].plan
                );

                if (!couponPlan && plans[i].isActive === false) {
                    continue;
                }
                if (!subscriptionFiltered) {
                    couponMappingArray.push({
                        id: couponPlan?.id,
                        couponId,
                        plan: plans[i].plan,
                        isActive: false
                    });
                    continue;
                }

                let finalPrice = 0;
                let couponDiscount = 0;

                if (type === 'discount') {
                    finalPrice =
                        subscriptionFiltered.price -
                        subscriptionFiltered.discount -
                        Number(value);
                    couponDiscount = Number(coupon.value);
                } else if (type === 'percentage') {
                    let planPrice =
                        subscriptionFiltered.price -
                        subscriptionFiltered.discount;
                    couponDiscount = (Number(value) / 100) * planPrice;
                    finalPrice = planPrice - couponDiscount;
                }

                if (finalPrice < 2) {
                    plans[i].isActive = false;
                }
                couponMappingArray.push({
                    id: couponPlan?.id,
                    couponId,
                    plan: plans[i].plan,
                    isActive: plans[i].isActive
                });
            }

            await Promise.all(
                couponMappingArray.map((plan) =>
                    CouponsMapping.upsert({
                        id: plan?.id,
                        groupId,
                        plan: plan.plan,
                        isActive: plan.isActive,
                        couponId: plan.couponId
                    })
                )
            );
            const activePlans = couponMappingArray.filter(
                (plan) => plan.isActive === true
            );
            const updateData = {
                type,
                value,
                isVisible
            };
            if (!couponMappingArray.length || !activePlans.length) {
                updateData['isActive'] = false;
            }
            const updatedCoupon = await Coupons.update(updateData, {
                where: {
                    id: coupon.id
                }
            });
            return new ResponseBuilder(200, updatedCoupon, SUCCESS_200);
        } catch (error) {
            console.log(error);
            return new ResponseBuilder(400, {}, error);
        }
    }

    async checkCouponForActivation(couponId: number, plans?: any) {
        try {
            const coupon = await Coupons.findOne({
                where: {
                    id: couponId,
                    isdeleted: false
                },
                attributes: ['type', 'value', 'id', 'groupId'],
                include: [
                    {
                        model: CouponsMapping,
                        as: 'couponsMapping',
                        paranoid: true,
                        required: false
                    }
                ],
                nest: true
            });

            if (!coupon) {
                throw new Error('Coupon Name invalid');
            }
            const [group, groupPlans] = await Promise.all([
                GroupDetailsRepository.findGroupById(coupon.groupId),
                GroupSubscriptionPlans.findAll({
                    where: {
                        groupId: coupon.groupId,
                        isDeleted: false
                    },
                    raw: true
                })
            ]);
            if (!group) {
                throw new Error('Invalid Group');
            }
            const subscriptionPlans = plans || groupPlans;

            const couponsMapping = JSON.parse(
                JSON.stringify(coupon.couponsMapping)
            );
            const couponMappingArray = [];
            for (let i = 0; i < couponsMapping.length; i++) {
                const subscriptionFiltered = subscriptionPlans.find(
                    (selectedPlan) => selectedPlan.id === couponsMapping[i].plan
                );

                if (!subscriptionFiltered) {
                    couponMappingArray.push({
                        id: couponsMapping[i]?.id,
                        couponId,
                        plan: couponsMapping[i].plan,
                        isActive: false
                    });
                    continue;
                }

                let finalPrice = 0;
                let couponDiscount = 0;

                if (coupon.type === 'discount') {
                    finalPrice =
                        subscriptionFiltered.price -
                        subscriptionFiltered.discount -
                        Number(coupon.value);
                    couponDiscount = Number(coupon.value);
                } else if (coupon.type === 'percentage') {
                    let planPrice =
                        subscriptionFiltered.price -
                        subscriptionFiltered.discount;
                    couponDiscount = (Number(coupon.value) / 100) * planPrice;
                    finalPrice = planPrice - couponDiscount;
                }
                if (finalPrice < 2) {
                    couponsMapping[i].isActive = false;
                }
                couponMappingArray.push({
                    id: couponsMapping[i]?.id,
                    couponId,
                    plan: couponsMapping[i].plan,
                    isActive: couponsMapping[i].isActive
                });
            }
            await Promise.all(
                couponMappingArray.map((plan) =>
                    CouponsMapping.upsert({
                        id: plan?.id,
                        groupId: coupon.groupId,
                        plan: plan.plan,
                        isActive: plan.isActive,
                        couponId: plan.couponId
                    })
                )
            );
            const activeCouponPlans = couponMappingArray.filter(
                (plan) => plan.isActive == 1
            );
            const updateData = {
                isActive: activeCouponPlans.length ? 1 : 0
            };
            const updatedCoupon =
                updateData.isActive !== coupon.isActive &&
                (await Coupons.update(updateData, {
                    where: {
                        id: coupon.id
                    }
                }));

            if (!activeCouponPlans.length) {
                return new ResponseBuilder(
                    400,
                    {},
                    'There are no valid plans to activate this coupon, please edit the coupon'
                );
            }
            return new ResponseBuilder(200, updatedCoupon, SUCCESS_200);
        } catch (error) {
            console.log(error);
            return new ResponseBuilder(400, {}, error);
        }
    }
}

export default new CouponService();
