export interface IorderPayload {
    orderType: string;
    groupId?: number;
    messageId?: number;
    userId: number;
    email?: number;
    period?: string;
    periodTitle?: string;
    couponName?: string;
}

export interface IPayment {
    id?: number;
    orderId: string;
    buyerId: number;
    sellerId: number;
    amount: number;
    orderType: string;
    groupId?: number;
    messageId?: number;
    currentPlan?: string;
    status?: string;
    paymentStatus?: string;
    couponName?: string;
    couponDiscount?: number;
    planDiscount?: number;
    planId?: number;
}

export interface ITransfer {
    orderId: string;
    transferId?: string;
    accountId?: string;
    userId: number;
    amount: number;
}
