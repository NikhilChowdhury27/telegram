'use strict';
import nationalities from './constants/nationalities';
import bloodGroups from './constants/bloodGroups';
import {
    TOKEN_VERIFIED,
    TOKEN_MISSING_400,
    TOKEN_EXPIRED_400,
    TOKEN_ERROR_400,
    TOKEN_INVALID_401,
    BAD_CLIENT_MISSING_USER_400,
    BAD_CLIENT_MISSING_CLIENT_400,
    BAD_MALFORMED_SYNTAX,
    ACCOUNT_NOT_FOUND,
    FORBIDDEN_ACCESS,
    BAD_CLIENT_MISSING_TUTOR_ID_400,
    ACCESS_403_TUTORS_ONLY,
    ACCESS_403_PREMIUM_TUTORS_ONLY,
    BAD_INTERNAL_500,
    BAD_INVALID_CARETAKER_400,
    BASIC_INFO,
    PERSONAL_DETAILS,
    ADDRESS,
    EDUCATIONAL_DETAILS,
    MOBILE_NUMBER,
    NAME,
    EMAIL,
    ABOUT,
    ROLL_NO,
    DOJ,
    DOB,
    GENDER,
    NATIONALITY,
    BLOOD_GROUP,
    AADHAR_NO,
    AADHAR_CARD_IMG,
    PAN_NO,
    PAN_CARD_IMG,
    SIGNATURE,
    PERMANENT_ADDRESS,
    PERMANENT_PINCODE,
    CORRESPONDENCE_ADDRESS,
    CORRESPONDENCE_PINCODE,
    COLLEGE_NAME,
    COLLEGE_MARKS,
    COLLEGE_RESULT,
    SCHOOL_NAME,
    XII_MARKS,
    XII_RESULT,
    X_MARKS,
    X_RESULT,
    BLOCKED_USER_ID,
    BATCHES,
    COURSES,
    INFO,
    PERFORMANCE,
    PAYMENTS,
    ASSIGNMENTS,
    COURSE_TESTS,
    BATCH_TESTS,
    TEST_TYPE,
    DATE_RANGE
} from './constants/errorMessages';

export const forbiddenNumbers = [
    '919179786141',
    '919713189020',
    '917229935935',
    '918750219727',
    '919784714479',
    '919907465488',
    '919893889052',
    '917903750270',
    '917688852536'
];

export const redisStoreName = {
    userDetails: {
        env: 'USER_DETAILS',
        redis: 'userDetails'
    }
};

export const byPassNumbers = ['918130866039'];

export const userTypeMap = {
    student: 1,
    parent: 2,
    tutor: 3,
    guest: 0,
    faculty: 4
};

export const AUTH_TOKEN = {
    TOKEN_VERIFIED: TOKEN_VERIFIED,
    TOKEN_MISSING_400: TOKEN_MISSING_400,
    TOKEN_EXPIRED_400: TOKEN_EXPIRED_400,
    TOKEN_ERROR_400: TOKEN_ERROR_400,
    TOKEN_INVALID_401: TOKEN_INVALID_401,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    BAD_CLIENT_MISSING_USER_400: BAD_CLIENT_MISSING_USER_400,
    BAD_CLIENT_MISSING_CLIENT_400: BAD_CLIENT_MISSING_CLIENT_400,
    BAD_MALFORMED_SYNTAX: BAD_MALFORMED_SYNTAX,
    ACCOUNT_NOT_FOUND: ACCOUNT_NOT_FOUND,
    FORBIDDEN_ACCESS: FORBIDDEN_ACCESS
};

export const AUTH_TUTOR_MIDDLEWARE = {
    BAD_CLIENT_MISSING_USER_400: BAD_CLIENT_MISSING_USER_400,
    BAD_CLIENT_MISSING_TUTOR_ID_400: BAD_CLIENT_MISSING_TUTOR_ID_400,
    ACCESS_403_TUTORS_ONLY: ACCESS_403_TUTORS_ONLY,
    ACCESS_403_PREMIUM_TUTORS_ONLY: ACCESS_403_PREMIUM_TUTORS_ONLY,
    BAD_INTERNAL_500: BAD_INTERNAL_500,
    BAD_INVALID_CARETAKER_400: BAD_INVALID_CARETAKER_400
};

export const CONFIG = {
    PUBLIC_KEY_URL: 'https://api4.truecaller.com/v1/key'
};

export const templateIdMap = {
    lite_invite_student_to_batch_02: '1707161106424059400',
    lite_student_signup_01: '1707161829766970050',
    lite_invite_student_01: '1707161217198615051',
    lite_student_signup_reminder_01: '1707161175346691982',
    lite_landing_page_signup_tutor_01: '1707161829825718252',
    lite_student_signup_reminder_02: '1707161226115076445',
    lite_homework_assigned_02: '1707161848830184688',
    lite_fees_reminder: '1707161777349089622',
    lite_fees_transaction_modified: '1707161777497701463',
    lite_fees_payment_reminder: '1707161777349089622',
    lite_fees_transaction_created: '1707161777473055902',
    lite_fees_transaction_processed_tutor: '1707161777524608523',
    lite_fees_transaction_processed_student: '1707161777515902941',
    lite_new_study_material_01: '1707161898622174202',
    lite_new_study_material_02: '1707161898614460142'
};

export const userProfileInfoSections = {
    1: [
        {
            sectionId: 1,
            sectionName: BASIC_INFO,
            order: 1,
            isEditable: 0,
            isVisible: 1,
            default: 1
        },
        {
            sectionId: 3,
            sectionName: PERSONAL_DETAILS,
            order: 2,
            isEditable: 0,
            isVisible: 1,
            default: 0
        },
        {
            sectionId: 4,
            sectionName: ADDRESS,
            order: 3,
            isEditable: 0,
            isVisible: 1,
            default: 0
        },
        {
            sectionId: 5,
            sectionName: EDUCATIONAL_DETAILS,
            order: 4,
            isEditable: 0,
            isVisible: 1,
            default: 0
        }
    ]
};

export const userProfileInfoSectionsSubSections = {
    1: {
        1: [
            {
                subSectionId: 1,
                sectionId: 1,
                label: NAME,
                key: 'name',
                order: 1,
                type: 'TEXT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/name.png',
                isValueEditable: 1,
                default: 1,
                isVisible: 1,
                isMandatory: 1
            },
            {
                subSectionId: 2,
                sectionId: 1,
                label: MOBILE_NUMBER,
                key: 'mobile_number',
                order: 2,
                type: 'MOBILE',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/number.png',
                isValueEditable: 0,
                default: 1,
                isVisible: 1,
                isMandatory: 1
            },
            {
                subSectionId: 3,
                sectionId: 1,
                label: EMAIL,
                key: 'email',
                order: 3,
                type: 'EMAIL',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/mail.png',
                isValueEditable: 0,
                default: 1,
                isVisible: 1,
                isMandatory: 1
            },
            {
                subSectionId: 4,
                sectionId: 1,
                label: ABOUT,
                key: 'about',
                order: 4,
                type: 'TEXT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/info.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 5,
                sectionId: 1,
                label: ROLL_NO,
                key: 'roll_number',
                order: 5,
                type: 'TEXT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/number.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 6,
                sectionId: 1,
                label: DOJ,
                key: 'date_of_joining',
                order: 6,
                type: 'DATE',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/calendar.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            }
        ],
        3: [
            {
                subSectionId: 1,
                sectionId: 3,
                label: DOB,
                key: 'date_of_birth',
                order: 1,
                type: 'DATE',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/DOB.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 2,
                sectionId: 3,
                label: GENDER,
                key: 'gender',
                order: 2,
                type: 'RADIO',
                options: [
                    {
                        id: 1,
                        value: `Male`,
                        label: `Male`
                    },
                    {
                        id: 2,
                        value: `Female`,
                        label: `Female`
                    }
                ],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/gender.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 3,
                sectionId: 3,
                label: NATIONALITY,
                key: 'nationality',
                order: 3,
                type: 'DROPDOWN',
                options: nationalities,
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/nationality.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 4,
                sectionId: 3,
                label: BLOOD_GROUP,
                key: 'blood_group',
                order: 4,
                type: 'DROPDOWN',
                options: bloodGroups,
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/bllodgroup.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 5,
                sectionId: 3,
                label: AADHAR_NO,
                key: 'aadhar_number',
                order: 5,
                type: 'TEXT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/file.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 6,
                sectionId: 3,
                label: AADHAR_CARD_IMG,
                key: 'aadhar_card_image',
                order: 6,
                type: 'DOCUMENT_UPLOAD',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/upload.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 7,
                sectionId: 3,
                label: PAN_NO,
                key: 'pan_number',
                order: 7,
                type: 'TEXT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/file.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 8,
                sectionId: 3,
                label: PAN_CARD_IMG,
                key: 'pan_card_image',
                order: 8,
                type: 'DOCUMENT_UPLOAD',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/upload.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 9,
                sectionId: 3,
                label: SIGNATURE,
                key: 'signature',
                order: 9,
                type: 'DOCUMENT_UPLOAD',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/file.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            }
        ],
        4: [
            {
                subSectionId: 1,
                sectionId: 4,
                label: PERMANENT_ADDRESS,
                key: 'permanent_address',
                order: 1,
                type: 'TEXT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/address.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 2,
                sectionId: 4,
                label: PERMANENT_PINCODE,
                key: 'permanent_address_pin_code',
                order: 2,
                type: 'NUMBER',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/pincode.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 3,
                sectionId: 4,
                label: CORRESPONDENCE_ADDRESS,
                key: 'correspondence_address',
                order: 3,
                type: 'TEXT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/address.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 4,
                sectionId: 4,
                label: CORRESPONDENCE_PINCODE,
                key: 'correspondence_address_pin_code',
                order: 4,
                type: 'NUMBER',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/pincode.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            }
        ],
        5: [
            {
                subSectionId: 1,
                sectionId: 5,
                label: COLLEGE_NAME,
                key: 'college_university_name',
                order: 1,
                type: 'TEXT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/College.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 2,
                sectionId: 5,
                label: COLLEGE_MARKS,
                key: 'marks_in_college',
                order: 2,
                type: 'PERCENT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/marks.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 3,
                sectionId: 5,
                label: COLLEGE_RESULT,
                key: 'upload_college_result',
                order: 3,
                type: 'DOCUMENT_UPLOAD',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/upload.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 4,
                sectionId: 5,
                label: SCHOOL_NAME,
                key: 'school_name',
                order: 4,
                type: 'TEXT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/SchoolName.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 5,
                sectionId: 5,
                label: XII_MARKS,
                key: 'marks_in_xii',
                order: 4,
                type: 'PERCENT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/marks.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 6,
                sectionId: 5,
                label: XII_RESULT,
                key: 'upload_xii_result',
                order: 4,
                type: 'DOCUMENT_UPLOAD',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/upload.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 7,
                sectionId: 5,
                label: X_MARKS,
                key: 'marks_in_x',
                order: 4,
                type: 'PERCENT',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/marks.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            },
            {
                subSectionId: 8,
                sectionId: 5,
                label: X_RESULT,
                key: 'upload_x_result',
                order: 4,
                type: 'DOCUMENT_UPLOAD',
                options: [],
                isEditable: 0,
                iconUrl:
                    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/upload.png',
                isValueEditable: 1,
                default: 0,
                isVisible: 1,
                isMandatory: 0
            }
        ]
    }
};

export const userProfileTabs = {
    // userType.tabCategoryId = {}
    1: [
        {
            tabName: INFO,
            tabCategory: 1,
            order: 1,
            premiumTutorOnly: 0,
            filters: [],
            subTabs: []
        },
        {
            tabName: BATCHES,
            tabCategory: 2,
            order: 2,
            premiumTutorOnly: 0,
            filters: [],
            subTabs: [],
            weEventName: 'Profile_BatchTab Click'
        },
        {
            tabName: COURSES,
            tabCategory: 3,
            order: 3,
            premiumTutorOnly: 1,
            filters: [],
            subTabs: [],
            weEventName: 'Profile_CoursesTab Click'
        },
        {
            tabName: PERFORMANCE,
            tabCategory: 4,
            order: 4,
            premiumTutorOnly: 0,
            filters: [],
            subTabs: [
                {
                    id: 1,
                    name: BATCH_TESTS,
                    premiumTutorOnly: 0,
                    filters: [
                        {
                            id: 1,
                            name: BATCHES,
                            key: 'batchIdColl',
                            isStudentVisible: 0,
                            premiumTutorOnly: 0
                        },
                        {
                            id: 2,
                            name: TEST_TYPE,
                            key: 'testType',
                            isStudentVisible: 1,
                            premiumTutorOnly: 0
                        },
                        {
                            id: 3,
                            name: DATE_RANGE,
                            key: 'dateRange',
                            isStudentVisible: 1,
                            premiumTutorOnly: 0
                        }
                    ],
                    weEventName: 'Profile_Performance Batch'
                },
                {
                    id: 2,
                    name: COURSE_TESTS,
                    premiumTutorOnly: 1,
                    filters: [
                        {
                            id: 1,
                            name: COURSES,
                            key: 'courses',
                            isStudentVisible: 1,
                            premiumTutorOnly: 1
                        },
                        {
                            id: 2,
                            name: DATE_RANGE,
                            key: 'dateRange',
                            isStudentVisible: 1,
                            premiumTutorOnly: 0
                        }
                    ],
                    weEventName: 'Profile_Performance Course'
                }
            ]
        },
        {
            tabName: PAYMENTS,
            tabCategory: 5,
            order: 5,
            premiumTutorOnly: 1,
            filters: [],
            subTabs: [],
            weEventName: 'Profile_PaymentTab Click'
        },
        {
            tabName: ASSIGNMENTS,
            tabCategory: 6,
            order: 6,
            premiumTutorOnly: 0,
            filters: [
                {
                    id: 1,
                    name: BATCHES,
                    key: 'batchIdColl',
                    isStudentVisible: 0,
                    premiumTutorOnly: 0
                },
                {
                    id: 2,
                    name: DATE_RANGE,
                    key: 'dateRange',
                    isStudentVisible: 1,
                    premiumTutorOnly: 0
                }
            ],
            subTabs: [],
            weEventName: 'Profile_AssignmentTab Click'
        }
    ],
    2: [
        {
            tabName: INFO,
            tabCategory: 1,
            order: 1,
            premiumTutorOnly: 0,
            filters: [],
            subTabs: []
        }
    ],
    3: [
        {
            tabName: INFO,
            tabCategory: 1,
            order: 1,
            premiumTutorOnly: 0,
            filters: [],
            subTabs: []
        }
    ]
};

export const conversationTypes = {
    oneToOne: 1,
    group: 2,
    broadcast: 3
};
export const defaultSubSectionIconUrl =
    'https://res.cloudinary.com/classplus/image/upload/v1577096529/whitelabel/studentProfile/customise.png';

export const buildType = {
    MANUAL: 1,
    AUTOMATED: 2
};

export const AUTH_USER = {
    BLOCKED_USER_ID: BLOCKED_USER_ID
};

export const ILLEGAL_COLLATION_CODE = 1267;

export const orgAppColors = {
    default: '009ae0',
    blue: '009ae0',
    red: 'FD3D39',
    orange: 'FE9526',
    green: '53D86A',
    purple: '595BD4',
    pink: 'FD3259',
    rust: 'E6632F',
    yellow: 'ffd000',
    '#009ae0': '009ae0',
    '#fd3d39': 'FD3D39',
    '#fe9526': 'FE9526',
    '#53d86a': '53D86A',
    '#595bd4': '595BD4',
    '#fd3259': 'FD3259',
    '#e6632f': 'E6632F',
    '#ffd000': 'ffd000'
};

export const myInstituteDefaultColor = 'FD3D39';

export const diyBypassedOrgs = [170];

export const IMG_MARKETING =
    'https://res.cloudinary.com/dmnjztlw5/image/upload/v1573822168/Dashboard_creative_10.09_1_mjgzud.jpg';

export const USER_TABS = [
    {
        id: 1,
        enum: 'telegramGroup',
        label: 'Telegram Group'
    }
    // {
    //     id: 2,
    //     enum: 'lockedMessage',
    //     label: 'Locked Message'
    // }
];

export const PRICING_PLANS = {
    paymentPeriod: {
        price: {
            type: 'number'
        },
        period: {
            type: 'text',
            valid: [
                {
                    id: 1,
                    label: 'Weekly'
                },
                {
                    id: 2,
                    label: 'Bi-Weekly'
                },
                {
                    id: 3,
                    label: 'Monthly'
                },
                {
                    id: 4,
                    label: 'Every 2 Months'
                },
                {
                    id: 5,
                    label: 'Every 3 Months'
                },
                {
                    id: 6,
                    label: 'Every 6 Months'
                }
            ]
        }
    },
    accessPrice: {
        type: 'number'
    }
};

// export const BOT_MAP_CHANNEL_ID =
//     process.env.NODE_ENV == 'production' ? 1490836445 : 1562893392; // PROD
// export const BOT_MAP_CHANNEL_ID = 1562893392; // STAGE

export const LANDING_URL = 'https://web.fankonnect.com/?token=';
export const CHAT_URL =
    'https://chat.googleapis.com/v1/spaces/AAAA-vzlfGA/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=5bLUXCsmA3a4m11mCN7eHUgvXcUnCooie_-mSr3g8LM%3D';
export const REMOVAL_CHAT_URL =
    'https://chat.googleapis.com/v1/spaces/AAAAgKRGCWw/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=C-amGzXggxJ1Q9yelTqZSGepNms07AvidYYmaKaEorg%3D';

export const TOKEN_CHAT_URL =
    'https://chat.googleapis.com/v1/spaces/AAAA3oPosc0/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=XhW2gQEPh2MsnNzXX4EgKq_gPy5UgSqXEg_RJZgXSpo%3D';

export const WEBHOOK_CHAT_URL =
    'https://chat.googleapis.com/v1/spaces/AAAAU9USR8o/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=2eq1kPTxK9GQtyaZVlTuDoCJ75UZUjTnLRsXMEqCq8c%3D';

export const RAZORPAY_CHAT_URL =
    'https://chat.googleapis.com/v1/spaces/AAAAEjN1aSw/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=FSj2RthBFfmC3IY0xf5UcfZz4avQhlPuo3SgKEXjHHA%3D';

export const CLASSPLUS_WEBHOOK_CHAT_URL =
    'https://chat.googleapis.com/v1/spaces/AAAAVSjwjIM/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=CFQcY___-o8NhOmJ_2U5Y_6F8PP1R4ZRR8phCMu2OyM%3D';
export const memberEncryption = Object.freeze({
    0: 'z',
    1: 'q',
    2: '8',
    3: 'O',
    4: 'J',
    5: 'r',
    6: 'l',
    7: 'U',
    8: 'm',
    9: 'S'
});
export const groupEncryption = Object.freeze({
    0: 'Y',
    1: '0',
    2: 'e',
    3: 't',
    4: 'B',
    5: 'X',
    6: 'r',
    7: 'G',
    8: 'v',
    9: 'H'
});
export const WHATSAPP_MANAGEMENT_URL =
    process.env.ENVIRONMENT == 'production'
        ? 'https://chat.googleapis.com/v1/spaces/AAAAGiv3lek/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=rj6IZ5muH06EuswmoVaZfFlgXQpG5fsV2TIrQMj7lPs%3D'
        : 'https://chat.googleapis.com/v1/spaces/AAAAZACwW5M/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=mb6N7TEjsyrdtIjrJmK3BI6MyP7NiMvGhPLp_fRUTig%3D';
export const WHATSAPP_USER_ADDITION =
    process.env.ENVIRONMENT == 'production'
        ? 'https://chat.googleapis.com/v1/spaces/AAAAJYzjgDA/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=bhCKJYO-4TREOrN98b-IalqzbZ2xgG8U9wssjY6SQU8%3D'
        : 'https://chat.googleapis.com/v1/spaces/AAAAMZn1CA4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=d1N6d1hvTIJ0FKpY2eHwUpk99-OGzA6ckNn1I0LMlL4%3D';

export const additionRateDifference = 15;
export const additionThreshhold = 5;
export const waGroupThreshold = 480;
export const waCommunityThreshold = 4980;
