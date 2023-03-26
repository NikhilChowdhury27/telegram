import {
    FindAttributeOptions,
    WhereOptions,
    FindOptions
} from 'sequelize/types';
export interface ApiInterface {
    size: number;
    readonly label;
    optional?: any;
}

export interface DeleteUserDeviceInterface {
    userId?: number;
    guestId?: number;
    deviceToken: string;
    type?: number;
    isFingerprintEnabled?: boolean;
    fingerprintId?: string;
    orgId?: number;
}
export interface UserFilterInterface {
    id?: number;
    name?: string;
    limit?: number;
    offset?: number;
}

export interface UserCreateInterface {
    name: string;
    phone: string;
    email?: string;
}

export interface User {
    name: string;
    id: number;
}

export interface FindGuestUser {
    id: string;
    projection?: string;
    refreshToken?: string;
    limit?: number;
    offset?: number;
    order?: string;
    useMaster?: boolean;
    orderBy?: [string, string][];
}

export interface UserInfo {
    id: number;
    orgId: number;
    name: string;
    username: string;
    email: string;
    countryExt: string;
    mobile: string;
    imageUrl: string;
    bio: string;
    dob: string;
    gender: string;
    facebookId: string;
    isEmailVerified: number;
    type: number;
    signedUp: number;
    active: number;
    created: string;
    modified: string;
    promocode: string;
    imageUrlBackup: string;
}

export let userInfo: UserInfo = {
    id: 1,
    orgId: 1,
    name: 'John Doe',
    username: 'john@classplus.co',
    email: 'john@classplus.co',
    countryExt: '91',
    mobile: '7000000000',
    imageUrl: '1234-xyz',
    bio: '',
    gender: 'male',
    facebookId: null,
    isEmailVerified: 1,
    type: 1,
    signedUp: 1,
    active: 1,
    created: '2018-01-27 01:24:49',
    modified: '2018-01-27 01:24:49',
    promocode: null,
    imageUrlBackup: null,
    dob: null
};

export enum UserRole {
    STUDENT = 1,
    PARENT = 2,
    TUTOR = 3
}
export interface userDevice {
    deviceType: string;
    deviceToken: string;
    userId: number;
}

export interface userDeviceList {
    isDistinct: boolean;
    projection: string;
    userIds: number[];
}

export interface listPayload {
    userIds: Array<number>;
    projections: any;
    order?: {
        key: string;
        direction: string;
    };
    limit?: number;
    offset?: number;
    isDistinct?: string;
    umsTrackId?: string;
}

export interface UserSettingsFilterInterface {
    userId: number;
    notification?: boolean;
    email?: boolean;
    sms?: boolean;
}
export interface UpdateUserSettingsInterface {
    notification?: boolean;
    email?: boolean;
    sms?: boolean;
}

export interface IUserRegister {
    orgUpdateDataForIntl?: {
        sendSmsEnabled?: number;
        enablePaymentReciept?: number;
        growthManagerContact?: string;
        saveUserInfoType?: number;
        countryCode?: string;
        defaultLanguage?: string;
        inAppRenewal?: number;
        enableEnquiryManagement?: number;
        inAppReferal?: number;
        isPaymentEnabled?: number;
        isInternational?: number;
    };
    isIntlMuv?: number;
    contact: {
        countryExt?: string;
        mobile?: string;
        email?: string;
    };
    type: number;
    fullMobileNo: string;
    orgId: number;
    userId: number;
    imageUrl?: string;
    name: string;
    sessionId: string;
    otp: number;
    bio: string;
    gender: string;
    dob: Date;
    fb?: {
        id?: string;
        token?: string;
    };
    apiVersion: string;
    appVersion: string;
    isReviewer: boolean;
    isAndroid: boolean;
    isIos: boolean;
    userAgent: string;
    accessToken: string;
    ip: string;
    buildType: number;
    regViaFreeTest: number;
    fingerprintId?: string;
    isFingerprintEnabled?: boolean;
}

export interface IUserDetails {
    orgId: number;
    mobile: string;
    type: number;
    apiVersion: string;
    fullMobileNo: string;
    email?: string;
    isInternational?: number;
    saveUserInfoType?: number;
}
export interface removeUserOrganisationMapping {
    id: number;
    type: number;
    orgId: number;
}
export interface RequestUserInterface {
    id?: number;
    orgId?: number;
    type?: number;
    mobile?: string;
    name?: string;
    email?: string;
    iat?: number;
    exp?: number;
    tutorId?: number;
    isTutorPremium?: boolean;
    guestId?: number;
    imageUrl?: string;
    isInternational?: number;
    defaultLanguage?: string;
    countryCode?: string;
    countryISO?: string;
    timezone?: string;
}

export interface UpdateUserSettingsServiceDataInterface {
    notification?: 1 | 0;
    email?: 1 | 0;
    sms?: 1 | 0;
    contentStore?: 1 | 0;
    isGroupStudyEnabled?: 1 | 0;
    user?: RequestUserInterface;
}

export interface IUserContact {
    filter: any;
    projection?: string;
    limit?: string;
    offset?: string;
    search?: string;
    group?: any;
    order?: any;
}

export interface IPostContactList {
    contactList: Array<any>;
    user: {
        id: number;
        name: string;
    };
}
export interface IGetContactList {
    limit?: string;
    offset?: string;
    search?: string;
    user: {
        id: number;
    };
}

export interface IGetUserAndOrgDataFilter {
    user: {
        userId?: any;
        mobile?: string;
        countryExt?: string;
        email?: string;
        type?: number;
        orgId?: number;
    };
    organization: {
        orgId?: number;
        orgCode?: string;
        buildType?: number;
    };
}

export interface IGetUserAndOrgDataProjection {
    user: any;
    organization: any;
}

export interface IGetUserAndOrgData {
    filter: IGetUserAndOrgDataFilter;
    projection: IGetUserAndOrgDataProjection;
    id: number;
    orgId: number;
}

export interface IfindUserOrgDataGeneric {
    filter: {
        user?: {
            id?: number;
            email?: string;
            type?: number;
            orgId?: number;
            mobile?: string;
        };
        organization?: {
            id?: number;
            orgCode?: string;
            buildType?: number;
        };
    };
    projection: {
        user?: any;
        organization?: any;
    };
}
export interface UserDetailsInterface {
    filter?: any;
    projection?: {
        users?: {
            attributes?: FindAttributeOptions;
        };
        students?: {
            required?: boolean;
            attributes?: FindAttributeOptions;
            filter?: any;
            parentStudentMap?: {
                required?: boolean;
                attributes?: FindAttributeOptions;
                filter?: any;
                parents?: {
                    required?: boolean;
                    attributes?: FindAttributeOptions;
                    filter?: any;
                    users?: {
                        required?: boolean;
                        attributes?: FindAttributeOptions;
                        filter?: any;
                    };
                };
            };
        };
        parents?: {
            required?: boolean;
            attributes?: FindAttributeOptions;
            filter?: any;
            parentStudentMap?: {
                required?: boolean;
                attributes?: FindAttributeOptions;
                filter?: any;
                students?: {
                    required?: boolean;
                    attributes?: FindAttributeOptions;
                    filter?: any;
                    users?: {
                        required?: boolean;
                        attributes?: FindAttributeOptions;
                        filter?: any;
                    };
                };
            };
        };
        tutors?: {
            required?: boolean;
            attributes?: FindAttributeOptions;
            filter?: any;
            caretakers?: {
                required?: boolean;
                attributes?: FindAttributeOptions;
                filter?: any;
            };
        };
        organization?: {
            required?: boolean;
            attributes?: FindAttributeOptions;
            filter?: any;
            organizationDetails?: {
                required?: boolean;
                attributes?: FindAttributeOptions;
                filter?: any;
            };
        };
        userSettings?: {
            required?: boolean;
            attributes?: FindAttributeOptions;
            filter?: any;
        };
    };
    group?: string[];
    limit?: number;
    offset?: number;
    order?: [string, string][];
    useMaster?: boolean;
}

export interface IUserTutorDeviceInterface {
    user: Object;
}

export interface GetUserTutorDeviceDetailsServiceInterface {
    filter: {
        user?: Object;
        tutor?: Object;
        userDevices?: Object;
        userSettings?: Object;
        tutorBankDetails?: Object;
        userOtpVerification?: Object;
        organization?: Object;
    };
    projection: {
        user?: FindAttributeOptions;
        tutor?: FindAttributeOptions;
        userDevices?: FindAttributeOptions;
        userSettings?: FindAttributeOptions;
        tutorBankDetails?: FindAttributeOptions;
        userOtpVerification?: FindAttributeOptions;
        organization?: FindAttributeOptions;
    };
    group?: string[];
    limit?: number;
    offset?: number;
    order?: [string, string][];
    fn?: {
        filter?: Object;
        projection?: Object;
    };
    otpFKey?: string;
    options?: {
        projection?: {
            user?: Array<Array<any> | string>;
            tutor?: Array<Array<any> | string>;
            userDevices?: Array<Array<any> | string>;
            userSettings?: Array<Array<any> | string>;
            tutorBankDetails?: Array<Array<any> | string>;
            userOtpVerification?: Array<Array<any> | string>;
            organization?: Array<Array<any> | string>;
        };
        filter?: {
            user?: object;
            tutor?: object;
            userDevices?: object;
            userSettings?: object;
            tutorBankDetails?: object;
            userOtpVerification?: object;
            organization?: object;
        };
        required?: {
            user?: boolean;
            tutor?: boolean;
            userDevices?: boolean;
            userSettings?: boolean;
            tutorBankDetails?: boolean;
            userOtpVerification?: boolean;
            organization?: boolean;
        };
    };
}
export interface IAddUserService {
    user: RequestUserInterface;
    webReleaseVersion: string;
    isAndroid: boolean;
    isIos: boolean;
    xAccessToken: string;
}
export interface IUserTrack {
    utmSource: string;
    utmMedium: string;
    utmTerm: string;
    utmContent: string;
    utmCampaign: string;
    referStr: string;
    anid: string;
    ip: any;
    deviceId: any;
    user: {
        id: number;
        orgId: number;
    };
}

export interface IUserMeta {
    filter: {
        userId: number;
        orgId: number;
    };
    projection: Array<string>;
}

export interface IUserMetaUpdate {
    filter: {
        id: Array<number>;
        orgId: number;
    };
    updateData: any;
}

export interface IUserMetaCreate {
    utmSource?: string;
    utmMedium?: string;
    utmTerm?: string;
    utmContent?: string;
    utmCampaign?: string;
    referStr?: string;
    anid?: string;
    userId: number;
    orgId: number;
}
export interface IUserMap {
    filter: {
        userId: number;
        orgId: number;
        type: number;
    };
    projection: Array<string>;
}

export interface IUserMapUpdate {
    filter: {
        userId: number;
    };
    updateData: {
        latitude?: string;
        longitude?: string;
        city?: string;
        state?: string;
    };
}
export interface IUserWithParams {
    filter: any;
    projection?: {
        users?: any;
        students?: any;
    };
    limit?: string;
    offset?: string;
    search?: string;
    sortBy?: any;
}

export interface IFindUserCredits {
    filter: {
        type?: number;
        orgId?: number;
    };
    projection: {
        users?: any;
        userCredits?: any;
    };
}
export interface UpdateUserSettingsInterface {
    notification?: boolean;
    email?: boolean;
    sms?: boolean;
}

export interface RequestUserInterface {
    id?: number;
    orgId?: number;
    type?: number;
    mobile?: string;
    name?: string;
    email?: string;
    iat?: number;
    exp?: number;
    tutorId?: number;
    isTutorPremium?: boolean;
}
export interface UpdateUserSettingsServiceDataInterface {
    notification?: 0 | 1;
    email?: 0 | 1;
    sms?: 0 | 1;
    contentStore?: 0 | 1;
    isGroupStudyEnabled?: 0 | 1;
    user?: RequestUserInterface;
}
export interface UserSettingsFilterInterface {
    userId: number;
    notification?: boolean;
    email?: boolean;
    sms?: boolean;
}

export interface ISearchStudentsService {
    mobile?: string;
    email?: string;
    user: RequestUserInterface;
}
export interface DeleteUserFromOrgServiceDataInterface {
    userIds?: string;
    user: RequestUserInterface;
}

export interface IUserReferrelShare {
    user: {
        id: number;
    };
    shareType?: string;
    reference?: string;
}
export interface IRegisterDeviceService {
    deviceToken: string;
    deviceType: string;
    user: RequestUserInterface;
}

export interface IInsertData {
    tableName: string;
}

export interface IUpdateData {
    tableName: string;
    filter?: object;
    updatedData: object;
    options?: any;
}

export interface IUserFreemiumData {
    filter?: {
        users?: {
            where?: WhereOptions;
        };
        organizations: {
            where?: WhereOptions;
            freemiumOrganisationDetails?: {
                where?: WhereOptions;
            };
        };
    };
    projection: {
        users?: {
            attributes?: FindAttributeOptions;
        };
        organizations?: {
            attributes?: FindAttributeOptions;
            freemiumOrganisationDetails?: {
                attributes?: FindAttributeOptions;
            };
        };
    };
    requiredData?: {
        users?: {
            required?: boolean;
        };
        organizations?: {
            required?: boolean;
            freemiumOrganisationDetails?: {
                required?: boolean;
            };
        };
    };
    optionsData?: {
        users?: {
            options?: FindOptions;
        };
        organizations?: {
            options?: FindOptions;
            freemiumOrganisationDetails?: {
                options?: FindOptions;
            };
        };
    };
}
export interface IChangeStudentPhoneNumberService {
    orgCode: string;
    newMobile: number;
    oldMobile: number;
    type: number;
}
export interface IUserRegisterBypassed {
    contact: {
        countryExt: string;
        mobile: string;
        email?: string;
    };
    type: number;
    fullMobileNo: string;
    orgId: number;
    userId: number;
    imageUrl?: string;
    name: string;
    otp: number;
    bio: string;
    gender: string;
    dob: Date;
    fb?: {
        id?: string;
        token?: string;
    };
    apiVersion: string;
    appVersion: string;
    isReviewer: boolean;
    isAndroid: boolean;
    isIos: boolean;
    userAgent: string;
    accessToken: string;
    ip: string;
    buildType: number;
}

export interface IUpdateData {
    tableName: string;
    filter?: object;
    updatedData: object;
    options?: any;
}

export interface IVerifyOtp {
    otp: string;
    sessionId: string;
    mobile: string;
    whatsappStatus: number;
}

export interface IUserRegisterPayload {
    contact: {
        email: string;
        mobile: string;
    };
    name: string;
    otp: string;
    sessionId: string;
    whatsappStatus: number;
    state?: string;
}

export interface IBankDetail {
    beneficiaryName: string;
    accountNumber: string;
    ifscCode: string;
    userId: number;
    emailId: string;
    relationshipWithUser?: string;
}

export interface IBankStatusUpdate {
    isPrimary?: number;
    isDeleted?: number;
    bankDetailId: number;
    userId: number;
    emailId: string;
}

export interface IReceiptDetail {
    orgName: string;
    address: string;
    state: string;
    pinCode: number;
    userId: number;
    gstNumber?: string;
    gstCertificate?: string;
}
