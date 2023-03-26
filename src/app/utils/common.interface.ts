export interface contex {
    attempt: number;
}
export interface serviceResponse {
    status: number;
    msg: string;
    data: any;
}
export interface customErrInterface {
    name: string;
    message: string;
    type: 'CustomError';
    data: object;
    stack?: string;
}

export interface IOrder {
    key: string;
    direction: string;
}

export interface IUser {
    id: number;
    orgId: number;
    type: number;
    email: string;
    mobile: string;
    name: string;
    tutorId: number;
    isPremium: number;
    studentId: number;
    parentId: number;
    guestId: number;
}
export interface IHeaders {
    ApiVersion: number;
    AppVersion: string;
    UserAgent: string;
    DeviceId: string;
    DeviceDetails: string;
    accessToken: string;
}

export interface IHomeTabsHUser extends IUser, IHeaders {
    buildType: number;
    isStoreEnabled: boolean;
    contentStore: boolean;
    isAndroid: boolean;
    isMobile: boolean;
    isLite: boolean;
    isIos: boolean;
    userAgent: string;
    appVersion: string;
    apiVersion: number;
    deviceId: string;
    accessToken: string;
    xAccessToken: string;
    isReviewer: boolean;
    mobile: string;
    lang: string;
    isCams: number;
    region?: string;
    appType?: string;
    isWLApp?: string;
}

export interface IcheckNewMessagesResponse {
    data: {
        metaData: {
            hasNewMessages: boolean;
        };
    };
}
export interface IQueryOption {
    limit?: number;
    offset?: number;
    order?: Array<any>;
    attributes?: Array<any>;
}

export interface IUserOTP {
    email: string;
    mobile: string;
    otp: number;
    sessionId: number;
    deviceId: string;
    orgId: number;
}

export interface IFreemiumTutorCategory {
    filter: {
        userId: number;
        level?: number;
    };
}

export interface IFreemiumTutorCategoryInsert {
    name: string;
    level: number;
    parentCategoryId: number;
    createdBy: number;
}

export interface IFreemiumTutorSignup {
    filter: {
        orgId: number;
        userId: number;
    };
}

export interface IFreemiumTutorSignupDetails {
    userId?: number;
    orgId?: number;
    students?: number;
}

export interface IFreemiumStudentDetailsInsert {
    userId: number;
    categoryId: number;
    subCategoryId: number;
}

export interface IFreemiumStudentDetailsUpdate {
    filter: {
        userId: number;
    };
    updateData: {
        isActive: number;
    };
}

export interface IInclude {
    include: [];
    where: null | object;
}
