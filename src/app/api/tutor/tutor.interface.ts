import { RequestUserInterface } from '../user/user.interface';
import { FindAttributeOptions } from 'sequelize';
export interface ItutorFilterFreemium {
    userId: number;
    premiumStatus: number;
}
export interface ItutorFilterUserSettings {
    id?: number;
}
export interface ITutorFilter {
    filter?: ItutorFilterFreemium | ItutorFilterUserSettings;
    userId?: number;
    projection: string;
    limit?: number;
    offset?: number;
}
export interface ITutorFilterIncludingId {}
export interface IPremiumTutorCreate {
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
    mobile: string;
    name: string;
    email: string;
    premiumExpiryDate: Date;
    orgId: number;
    premiumStatus: number;
    region: string;
}
export interface PremiumExpiryFilter {
    userId: number;
    numberOfDays: number;
}

export interface RemoveParentFromStudentServiceDataInterface {
    studentId: number;
    parentId: number;
}
export interface ITutorReferral {
    tutorUserId: number;
    referalName: string;
    referalContact: string;
    remarks: string;
    type: boolean;
}

export interface GetTutorDataServiceInterface {
    filter: {
        id?: number | number[];
        userId?: number | number[];
        type?: 'premium' | 'faculty';
        premiumStatus?: 1 | 0;
        isActive?: 1 | 0;
    };
    projection: {
        attributes?: string | (string[] | String)[];
        limit?: number;
        offset?: number;
        order?: [string, string] | [string, string][];
    };
}

export interface GetTutorDataRepositoryInterface {
    filter: {
        id?: number | number[];
        userId?: number | number[];
        type?: 'premium' | 'faculty';
        premiumStatus?: 1 | 0;
        isActive?: 1 | 0;
    };
    projection: {
        attributes?: FindAttributeOptions;
        limit?: number;
        offset?: number;
        order?: [string, string][];
    };
}
export interface studentObjectCollectionInterface {
    studentId: number;
    parentName: string;
    parentMobile: string;
    parentCountryCode?: string;
    parentEmail?: string;
}

export interface AddParentsForStudentsServiceInterface {
    studentObjectCollection: studentObjectCollectionInterface[];
    isSignedUp: 1 | 0;
    user: RequestUserInterface;
}
export interface GetAllTutorsRouteServiceDataInterface {
    user: RequestUserInterface;
    limit?: number;
    offset?: number;
}

export interface GetAllTutorsFromOrgDataInterface {
    attributes?: {
        users?: Array<string> | Array<Array<string>>;
        tutors?: Array<string> | Array<Array<string>>;
    };
    limit?: number;
    offset?: number;
    order?: Array<[string, string]>;
}
export interface ITutorCreate {
    countryCode: string;
    mobile: string;
    fullMobile: string;
    name: string;
    orgId: number;
}

export enum SequelizeOperation {
    EQUAL,
    NOT_EQUAL
}

export interface GetAllTutorsFromOrgFilterInterface {
    users?: {
        where?: {
            id?: number;
            orgId?: number;
            tutorId?: number;
        };
        operations?: {
            id?: SequelizeOperation;
            orgId?: SequelizeOperation;
            tutorId?: SequelizeOperation;
        };
    };
    tutors?: {
        where?: {
            orgId?: number;
            userId?: number;
            tutorId?: number;
            premiumStatus?: number;
        };
        operations?: {
            orgId?: SequelizeOperation;
            userId?: SequelizeOperation;
            tutorId?: SequelizeOperation;
            premiumStatus?: SequelizeOperation;
        };
    };
}
export interface GetTutorDetailsServiceInterface {
    filter: {
        user?: Object;
        tutor?: Object;
        organization?: Object;
        organizationDetails?: Object;
        caretaker?: Object;
    };
    projection: {
        user?: FindAttributeOptions;
        tutor?: FindAttributeOptions;
        organization?: FindAttributeOptions;
        organizationDetails?: FindAttributeOptions;
        caretaker?: FindAttributeOptions;
    };
    group?: string[];
    limit?: number;
    offset?: number;
    order?: [string, string][];
    fn?: {
        filter?: Object;
        projection?: Object;
    };
    umsTrackId?: string;
    options?: {
        projection?: {
            user?: Array<Array<any> | string>;
            tutor?: Array<Array<any> | string>;
            organization?: Array<Array<any> | string>;
            organizationDetails?: Array<Array<any> | string>;
            caretaker?: Array<Array<any> | string>;
        };
        filter?: {
            user?: object;
            tutor?: object;
            organization?: object;
            organizationDetails?: object;
            caretaker?: object;
        };
        required?: {
            user?: boolean;
            tutor?: boolean;
            organization?: boolean;
            organizationDetails?: boolean;
            caretaker?: boolean;
        };
    };
    useMaster?: boolean;
}
export interface IUserCreateService {
    countryCode: string;
    mobile?: string;
    name: string;
    orgId: number;
    type: number;
    signedUp: number;
    email?: string;
}

export interface IBulkCreateTutor {
    dataArray: Array<IUserCreateService>;
    ignoreDuplicates?: boolean;
}

export interface IAddTazapayBank {
    beneficiaryName: string;
    accountNumber: number;
    bankName: string;
    swiftCode: string;
    ABACode: string;
    BSBCode: string;
    tzpAccountId: string;
    countryCode: string;
}
