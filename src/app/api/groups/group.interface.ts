export interface IPaymentPeriod {
    price: number;
    period: string;
}

// export interface IBundles {
// 	value: number;
// 	period: string;
// 	paymentPeriod: IPaymentPeriod;
// 	discountPrice: number;
// }
export interface IPricing {
    price: number;
    selectedPeriod: string;
    discount?: number;
    selectedOffer?: string;
    customType?: string;
    customValue?: number;
    id?: number;
}
export interface IGroupCreate {
    name: string;
    about: string;
    pricing: IPricing;
    session?: string;
}

export interface IGroup {
    id?: number;
    groupName: string;
    paymentLink?: string;
    isActive?: number;
    about: string;
    subscriptionPlan?: string;
    createdBy?: number;
    memberCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
    channelId: number;
    channelHash?: string;
    status?: string;
    category?: string;
    inviteLink?: string;
    sesssionId?: number;
    conditionalApproval?: number;
    formlink?: string;
    logoUrl?: string;
    type?: string;
    joinedBy?: number;
    removalBotStatus?: boolean;
}

export interface IGroupListPayload {
    status: string;
    limit?: number;
    offset?: number;
    userId?: number;
}

export interface IQueryOption {
    limit?: number;
    offset?: number;
    order?: Array<any>;
    group?: Array<string>;
}

export interface IJoinGroup {
    channelId: number;
    channelHash: string;
    session: string;
    telegramUsername: string;
}

export interface IMember {
    groupId: number;
    memberId: number;
    paymentId: number;
    expiryDate?: Date;
    expiryTimestamp?: Date;
    isActive: boolean;
    joinedDate: Date;
    currentPlan: string;
    groupName: string;
    status: string;
    isAdded?: boolean;
    memberStatus?: string;
}

export interface IJoinGroupParam {
    groupId: number;
    userId: number;
    plan: string;
    amount: number;
    paymentId: number;
    planId?: number;
    renewed?: number;
    expiryDate?: Date;
}
