export const BAD_INTERNAL_500 = 'Something went wrong';
export const BAD_CLIENT_REQUEST_400 = 'Bad Request';
export const BAD_CLIENT_MISSING_USER_400 = 'Bad request, missing user details';
export const BAD_CLIENT_MISSING_TUTOR_ID_400 =
    'Bad request, missing/invalid tutor details';
export const TOKEN_MISSING_400 = 'Token not provided';
export const TOKEN_EXPIRED_400 = 'Token expired';
export const TOKEN_ERROR_400 = 'Token is corrupt';
export const UNABLE_TO_PROCESS_400 = 'Unable to process, Data Mismatch';
export const TOKEN_INVALID_401 = 'Token not provided';
export const TOKEN_INVALID = 'Token Invalid';
export const ACCESS_403 = 'Forbidden to access';
export const ACCESS_403_TUTORS_ONLY =
    'Forbidden to access tutors only resource';
export const ACCESS_403_PREMIUM_TUTORS_ONLY =
    'Forbidden to access, premium tutors only resource';
export const ACCESS_403_STUDENTS_ONLY =
    'Forbidden to access, students only resource';
export const ACCESS_403_PARENTS_ONLY =
    'Forbidden to access, parents only resource';
export const DUPLICATE_COURSE =
    'Course Already Exists for this category . Try with a different name';
export const DUPLICATE_SUBJECT =
    'Subject Already Exists for this course . Try with a different name';
export const DUPLICATE_NUMBER =
    'Number Already Exists. Try with a different Number';
export const EXISTING_RECEIPT =
    'Number Already Exists. Try with a different Number';
export const BATCH_DUPLICATE_VIDEO_RESOURCE = 'Video already exists';
export const BAD_INVALID_CARETAKER_400 = 'Bad request, invalid caretaker';
export const RAZORPAY_BAD_REQUEST = 'Error making payment. Please try again';
export const TOO_MANY_REQUESTS = 'Too many requests - try again later';
export const SUCCESS_200 = 'success';
export const SUCCESS_201 = 'success';
export const UPDATED_SUCCESSFULLY = 'Updated Successfully';
export const ERROR_400 = 'Invalid Request';
export const ERROR_401 = 'Token not provided';
export const ERROR_403 = 'Not allowed';
export const ERROR_500 = 'Something went wrong';
export const GUEST_CANT_LOGIN = "User can't login as guest";
export const GUEST_USER = 'Guest User';
export const DRAWER_NOT_WORKING = 'OrgDrawer service not working';
export const INVALID_FIELDS = 'Invalid Field(s) !!!';
export const ENTERED_WRONG_DOOR =
    "Uh'oh seems like you entered the wrong door.";
export const NOT_TUTOR_OR_PREMIUM =
    "Either you're not a tutor or you're not premium";
export const ERROR_GENERATING_URL = 'Error generating url for this org';
export const TRY_WITH_DIFF_ORGCODE = 'Try with different OrgCode';
export const INVALID_ORGCODE = 'Invalid Org Code! Please try again';
export const INVALID_ORG = 'Invalid Organization';
export const STORE_DEACTIVATED =
    'Your Store has been deactivated, please contact customer support for more information.';
export const NOTHING_TO_UPDATE = 'Nothing to update';
export const ORG_NOT_FOUND = 'Organization not found';
export const FORCE_UPDATE_STATUS_FETCHED =
    'Force Update Status Fetched Successfully';
export const DRAWER_NOT_FOUND =
    'No Drawer Found for the given orgId and drawerId';
export const DRAWER_DETAILS_FETCHED = 'Drawer details fetched successfully';
export const NO_DATA_FOUND_FOR_ORG = 'No data found for the given orgId';
export const NOT_ENOUGH_COINS = 'Not enough coins to redeem';
export const FETCHED_HOME_TABS = 'Successfully Fetched Home Tabs';
export const COINS_REDEEMED_AND_LEFT =
    'Coins are redeemed in the Database Successfully.{coinsLeft} are left in the Database';
export const EITHER_MOBILE_EMAIL_REQUIRED =
    'Either mobile or email is required!';
export const COUNTRY_EXT_MOBILE_REQ =
    'Country Extension and mobile both are required!';
export const MAX_ATTEMPTS_REACHED = 'Max. attempts reached! Please try again.';
export const INVALID_OTP = 'Invalid OTP';
export const VERIFY_SUCCESSFUL = 'Verify successful';
export const OTP_CODE_SENT = 'OTP code sent';
export const YOUR_ONE_TIME_PASSWORD = 'Your ONE TIME PASSWORD(OTP)';
export const VIASMS_OR_VIAEMAIL =
    'viaSms is required with mobile OR viaEmail is required with email!';
export const RETRY_VOICE_NOT_POSSIBLE = 'Retry Voice not possible with email!';
export const NO_UNUSED_OTP = 'No unused otp found';
export const REMOVED_PARENT_SUCCESSFULLY = 'Removed parent successfully';
export const UNABLE_TO_REMOVE_PARENT = 'Unable to remove parent';
export const UNABLE_TO_ADD_OR_ORG_NOT_FOUND =
    'Unable to add student or Organisation not found.';
export const SOME_STUDENTS_ADDED = 'Some Students Added Successfully';
export const STUDENTS_ADDED = 'Students Added Successfully';
export const TOKEN_ISSUED = 'Access Token Issued Successfully';
export const TOKEN_EXPIRED_ERROR = 'TokenExpiredError';
export const JSON_WEB_TOKEN_ERROR = 'JsonWebTokenError';
export const CANNOT_EXTEND_EXPIRY = 'Cannot extend expiry, user is not tutor!';
export const PREMIUM_DURATION_CHANGED = 'Premium duration changed successfully';
export const USER_REGISTERED_AS_PARENT_STUDENT =
    'User registered as parent/student';
export const TUTOR_WITH_NUMBER_ALREADY_EXISTS =
    'Tutor with this contact number already exists';
export const DATA_FETCHED_SUCCESSFULLY = 'Data fetched successfully';
export const INVALID_STUDENT_COLLECTION =
    'Invalid student collection, no parent details';
export const UNABLE_TO_INSERT_DATA = 'Unable to insert users data';
export const UNABLE_TO_INSERT_PARENTS_DATA = 'Unable to insert parents data';
export const INVALID_STUDENT_NO_PARENTID =
    'Invalid student object collection, no parentId provided';
export const PARENTS_ADDED = 'Parents successfully added for students';
export const DEVICE_REMOVED = 'Device Removed Successfully';
export const USER_NOT_FOUND_ABORT = 'User not found..Aborting!';
export const ONLY_STUDENT_CAN_BE_REMOVED_FROM_ORG =
    'Only students can be removed from organisation';
export const USER_REMOVED_FROM_ORG = 'User removed from organisation!';
export const USER_NOT_FOUND = 'User Not Found';
export const SESSION_CREATED = 'Session successfully created';
export const SESSION_UPDATED = 'Session successfully updated';
export const STUDENTS_SUBSCRIBED_CANNOT_DELETED =
    'Student subscribed to a course hence can not be deleted';
export const DELETED_SUCCESSFULLY = 'Deleted Successfully';
export const INVALID_USER_FILTER = 'Invalid user filter';
export const USER_COORDINATE_ALREADY_ADDED = 'User coordinates already added!';
export const NO_CITY_STATE_INFO =
    'No city/state infromation available for these coordinates';
export const USER_COORD_UPDATED = 'User coordinates updated!';
export const COORD_DETAILS_UPDATES = 'Coordinates details not updated';
export const TUTOR_NOT_AVAILABLE = 'Tutor is not available';
export const STUDENT_NOT_AVAILABLE = 'Student is not available';
export const INVALID_TYPE_TOKEN = 'Invalid type provided from the token';
export const SUCCESSFULLY_ADDED = 'Successfully added coordinates';
export const UNABLE_TO_RECOGNIZE_USER = 'Unable to recognize user';
export const YOU_ARE_NOT_ALLOWED = 'You are not allowed for this action';
export const INVALID_USER = 'Invalid user';
export const PARENT_LOGIN_NOT_ENABLED = 'Parent login is not enabled';
export const INVALID_OTP_SESSIONID = 'Invalid OTP or session id!';
export const INVALID_TYPE_USER = 'Invalid type for given user';
export const USER_ALREADY_EXISTS = 'User already exists';
export const NOT_ALLOWED_FOR_TUTORS = 'Not allowed for tutors';
export const USER_DETAILS_FETCHED_SUCCESSFULLY =
    'User Details Fetched Succesfully';
export const UNRECOGNIZED_TYPE = 'Unrecognised type';
export const SUCCESSFULLY_APPLIED_PROMOCODE =
    'Successfully applied promocode details';
export const ALREADY_REGISTERED_PARENT = 'User already registered as Parent';
export const USER_ALREADY_REGISTERED_AS_TUTOR =
    'User already registered as Tutor';
export const EMAIL_ALREADY_EXISTS = 'Email already registered';
export const ADDED_SUCCESSFULLY = 'Added successfully';
export const NOT_FOUND = '{name} not found';
export const SERVICE_NOT_WORKING = '{name} Service not working';
export const SUCCESSFULLY_CREATED = 'Successfully created';
export const SUCCESSFULLY_UPDATED = 'Successfully updated';
export const SUCCESSFULLY_LISTED = 'Successfully listed';
export const SUCCESSFULLY_DELETED = 'Successfully deleted';
export const UNLOCK_ALL_APP = 'Unlock all app features by signing up';
export const LOGIN_SUCCESSFULL = 'Login successful';
export const DATA_NOT_FOUND = 'Data not found/invalid';
export const UPLOAD_SUCCESSFUL = 'Upload successful';
export const CONTACT_NOT_FOUND = 'Contact not found';
export const USER_LIST_FETCHED = 'User list fetched successfully';
export const BAD_INTERNAL_500_CHECK_INPUT =
    'Something went wrong for following contact number.Please check the input provided.';
export const DATA_RECORDED_SUCESSFULLY = 'Data recorded successfully.';
export const INTERNAL_SERVER_ERROR = 'Internal server error.';
export const SUCCESSFULLY_SAVED = 'Successfully saved data';
export const ERROR_SAVING_DETAILS = 'Error saving user details';
export const ERROR_ADDING_NEW_CATEGORY = 'Error adding new category';
export const SUCCESSFULLY_FETCHED = 'Successfully fetched data';
export const UNABLE_TO_FETCH_DATA = 'Unable to fetch data';
export const UNABLE_TO_SAVE_PREFERENCES = 'Unable to save your preferences';
export const INVALID_MOBILE_NUMBER = 'Valid mobile number is required';
export const PLEASE_PROVIDE_ALL_FIELDS =
    'Please provide all the required fields';
export const PLEASE_PROVIDE_VALID_INPUTS = 'Please provide a valid Inputs';

export const NOT_ALLOWED_ON_WEB_FOR_LITE_USER =
    'Not allowed on web for lite user';
export const INVALID_CONTACTS = 'Invalid contacts';
export const INVALID_NUMBER = 'Invalid number';
export const USER_NOT_REGISTERED =
    'User not found.Please register this number and try again.';
export const SUCCESSFULLY_INSERTED = 'Successfully inserted';
export const COINS_CREDITED = 'Coins are credited in the Database Successfully';
export const DEVICE_REGISTERED_SUCCESSFULLY = 'Device Registered Successfully';
export const OTP_IS_MISSING = 'OTP is missing.';
export const SESSIONID_IS_MISSING = 'SessionId is missing/invalid';
export const MOBILE_NUMBER_DIGIT = '10-digit mobile number is required';
export const INVALID_COUNTRY_CODE = '2-digit country code is required';
export const ERR_PROCESSING_REQ =
    'There was an error in processing the request';
export const INCORRECT_ACTION = 'Incorrect Action Entered';
export const INVALID_WEB_ADDRESS = 'Please enter a valid web address';
export const INVALID_EMAIL_ADDRESS = 'Please enter a valid email address';
export const INPUT_FIELDS_MISSING = 'Please provide all fields in input';
export const DEEPLINK_MISSING = 'Please provide deeplink object';
export const CANNOT_ADD_YOURSELF = 'You cannot add yourself';
export const ALREADY_REGISTERED =
    'Already registered as a tutor/student on our platform';
export const ORG_CODE_MISSING = 'Org code not provided';
export const GROW_YOUR_INSTITUTE =
    'Grow your institute by sharing your own marketing posters!';
export const INTRODUCING_PRACTICE_TEST =
    'Introducing Practice Tests - Click picture of your question paper and create online tests for your students in 60 seconds';
export const USING_CLASSPLUS_LITE =
    'Great news! 💥\n\n{{orgName}} is now using the *Classplus Lite* app to teach their students online. Ab aap bhi hissa ban sakte hain is online education ki revolution ka!.\n\n*Download the app now* and join us: {{newLink}}';
export const SUBSCRIPTION_EXPIRED =
    'Your app subscription has expired.Extend your subscription to access your app features smoothly';
export const RENEW_SUBSCRIPTION = 'Renew subscription';
export const DO_LATER = 'I will do it later';
export const CONTACT_SALES = 'Contact Sales';
export const STUDY_MATERIAL = 'Study Material';
export const SETTINGS = 'Settings';
export const EDUCATION_AWARDS = 'Educators Awards';
export const HELP_A_FRIEND = 'Help a Friend';
export const HELP_AND_SUPPORT = 'Help And Support';
export const STUDENT_TESTIMONIAL = 'Students Testimonial';
export const FREE_TESTS = 'Free Tests';
export const COMMUNITY = 'Community';
export const MY_LIBRARY = 'My Library';
export const FEES = 'Fees';
export const FREE_STUDY_MATERIAL = 'Free Study Material';
export const ARCHIVED_BATCHES = 'Archived Batches';
export const FEATURE_REQUEST = 'Feature Request';
export const EDIT_PROFILE = 'Edit Profile';
export const SMS_RECHARGE = 'SMS Recharge';
export const COUPON = 'Coupon';
export const PAYMENTS = 'Payments';
export const ENQUIRY_MANAGEMENT = 'Enquiry Management';
export const COINS = 'Coins';
export const APP_DOWNLOADS = 'App Downloads';
export const EMAIL_TO_CEO = "Email to Classplus's CEO";
export const MARKET_APP = 'Market your App';
export const HELP_CENTER = 'Help Center';
export const HOW_TO_USE_APP = 'How to use the App';
export const PRIVACY_POLICY = 'Privacy Policy';
export const BLOG = 'Blog';
export const MY_WEBSITE = 'My Website';
export const TERMS_OF_SERVICE = 'Terms of Service';
export const OFFLINE_DOWNLOADS = 'Offline Downloads';
export const GUEST = 'Guest';
export const UNLOCK_FEATURES = 'Unlock all app features by signing up';
export const OOPS = 'Oops!';
export const GOT_IT = 'Got it';
export const DUPLICATE_ELEMENT = 'Duplicate element found';
export const HOME = 'Home';
export const CHATS = 'Chats';
export const TIMETABLE = 'Timetable';
export const STORE = 'Store';
export const BATCHES = 'Batches';
export const PROFILE = 'Profile';
export const STUDENTS = 'Students';
export const REPORTS = 'Reports';
export const COURSES = 'Courses';

export const APP_FOR_PLATFORM_NOT_PUBLISHED =
    'App for {platform} platform is not published';
export const CLICK_TO_RENEW = 'Click here to renew now';
export const CONTACT_US = 'Contact Us';
export const EXTEND_SUBSCRIPTION = 'Extend Subscription';
export const SHARE_ON_WHATSAPP = 'Share on WhatsApp';
export const REFER_WIN = 'REFER & WIN';
export const TRIAL_EXPIRY =
    'Your trial is expiring on {{{premiumExpiry}}}.Get your full functional app now';
export const PREMIUM_EXPIRY =
    'Your subscription is expiring on {{{premiumExpiry}}}';

export const UPDATE_ERROR =
    'Mobile number cannot be updated for signed-up users';
export const FEILDS_MISSING = `Please provide all '*' marked fields to register.`;
export const UNABLE_VERIFY_TRUE_CALLER =
    'Unable to verify your truecaller profile.';
export const TRUE_CALLER_PROFILE_MISSING =
    'Unable to verify your truecaller profile.';
export const REGISTERD_AS_PARENT =
    'This mobile is already registered as Parent';
export const REGISTERD_AS_STUDENT =
    'This mobile is already registered as Student';
export const USER_REGISTERED_AS_PARENT_OR_STUDENT =
    'User registered as parent/student';
export const BAD_MALFORMED_SYNTAX =
    'The request could not be understood by the server due to malformed syntax';
export const MOBILE_EMAIL_REQUIRED = 'Mobile/Email is required';
export const REGISTERED_AS_TUTOR = 'This mobile is already registered as tutor';
export const EMAIL_REQUIRED = 'Email is required';
export const USER_NOT_FOUND_TRY_AGAIN = `User not found.Please register this number and try again.`;
export const SUCCESS_ADD_NEW_DETAILS = 'Details added successfully';
export const NEW_NUMBER_ALREADY_EXISTS = 'New Number already exists!';
export const OLD_NUMBER_DOES_NOT_EXISTS = "Old Number doesn't exists";
export const SUCCESSFULLY_UPDATED_DATA = 'Successfully updated data';
export const MOBILE_REQUIRED = 'Mobile is required';
export const ILLEGAL_COLLATION = 'Unsupported search keyword entered';
export const USER_BLOCKED_ALREADY = 'User already blocked';
export const SUCCESS_SAVE_NEW_DETAILS = 'Successfully saved new details';
export const TABS_FETCH_SUCCESS = 'Tabs fetched successfully';
export const INVALID_USER_ORG = 'Invalid user for this organization';
export const UNRECOGNIZED_TAB_CATEGORY = 'Unrecognized tab category';
export const CARETAKER_ADDED_SUCCESSFULLY = 'Caretaker added successfully';
export const CARETAKER_ALREAY_EXISTS = 'Caretaker already exists';
export const NO_CARETAKER_TO_ADD = 'No caretaker to add';
export const FAILED_TO_ADD_CARETAKERS = 'Failed to add caretakers';
export const SEQUELIZE_DATABASE_ERROR = 'Sequelize Database Error';
export const NO_DATA_TO_UPDATE = 'No Data to update';
export const INVALID_USERID = 'Invalid userId for this organization';
export const INVALID_MOB_NUMBER = 'Invalid Mobile Number';
export const PARENT_ALREADY_ADDED = 'Parent already added';
export const TOO_LARGE_DATA = 'Too large data';
export const UNABLE_TO_IDENTIFY = 'Unable to identify tutor';
export const UNABLE_TO_IDENTIFY_USER_TYPE =
    'Unable to identify the type of user';
export const UPDATE_DATA_SUCCESS = 'Update data successfully';
export const UNABLE_TO_IDENTIFY_TUTOR = 'Unable to identify tutor';
export const BANK_DETAILS_ALREADY_ADDED = 'Bank details are already added.';
export const TAB_UPDATE_DATA_SUCCESS = 'Tabs updated successfully';
export const INSUFFICIENT_BANK_DETAILS = 'Insufficient bank details provided';
export const FILTER_EMPTY = 'Filter Empty';
export const INVALID_COUNTRY_EXT = 'Country ext mismatched..Aborting!';
export const TOKEN_VERIFIED = 'Token Verified';
export const BAD_CLIENT_MISSING_CLIENT_400 =
    'Bad request, missing access clients details';
export const ACCOUNT_NOT_FOUND = 'Account not found';
export const FORBIDDEN_ACCESS = 'Forbidden to access this resource';
export const ENQUIRY = 'Enquiry';
export const COUPON_CODE = 'Coupon Code';
export const GROW = 'Grow';
export const BASIC_INFO = 'Basic Information';
export const PERSONAL_DETAILS = 'Personal Details';
export const ADDRESS = 'Address';
export const EDUCATIONAL_DETAILS = 'Educational Details';
export const MOBILE_NUMBER = 'Mobile Number';
export const NAME = 'Name';
export const EMAIL = 'Email';
export const ABOUT = 'About';
export const ROLL_NO = 'Roll Number';
export const DOJ = 'Date of Joining';
export const DOB = 'Date of Birth';
export const GENDER = 'Gender';
export const NATIONALITY = 'Nationality';
export const BLOOD_GROUP = 'Blood Group';
export const AADHAR_NO = 'Aadhar Number';
export const AADHAR_CARD_IMG = 'Aadhar Card Image';
export const PAN_NO = 'PAN Number';
export const PAN_CARD_IMG = 'PAN Card Image';
export const SIGNATURE = 'Signature';
export const PERMANENT_ADDRESS = 'Permanent Address';
export const PERMANENT_PINCODE = 'Permanent Address PIN Code';
export const CORRESPONDENCE_ADDRESS = 'Correspondence Address';
export const CORRESPONDENCE_PINCODE = 'Correspondence Address PIN Code';
export const COLLEGE_NAME = 'College / University Name';
export const COLLEGE_MARKS = 'Marks in College (in %)';
export const COLLEGE_RESULT = 'Upload College Result';
export const SCHOOL_NAME = 'School Name';
export const XII_MARKS = 'Marks in XII (in %)';
export const XII_RESULT = 'Upload XII Result';
export const X_MARKS = 'Marks in X (in %)';
export const X_RESULT = 'Upload X Result';
export const BLOCKED_USER_ID = 'Invalid user, please check again.';
export const INFO = 'Info';
export const PERFORMANCE = 'Performance';
export const ASSIGNMENTS = 'Assignments';
export const BATCH_TESTS = 'Batch Tests';
export const COURSE_TESTS = 'Course Tests';
export const TEST_TYPE = 'Test Type';
export const DATE_RANGE = 'Date Range';
export const FILTER_ERROR = 'Filter empty or keys are undefined';
export const MOBILE = 'Mobile';
export const TEACHING_EXPERIENCE = 'Years of teaching experience';
export const BANK_DETAILS = 'Bank Details';
export const BENEFICIARY_NAME = 'Beneficiary Name';
export const ACCOUNT_NUMBER = 'Account Number';
export const BANK_NAME = 'Bank Name';
export const IFSC_CODE = 'IFSC Code';
export const INSTITUTE_NAME = 'Institute Name';
export const SWIFT_CODE = 'Swift Code';
export const BSB_CODE = 'BSB Code';
export const WHAT_DO_YOU_TEACH = 'What do you teach?';
export const STATE = 'State';
export const WARDS = 'Wards';
export const BENEFITS_CLUB = 'Benefits Club';
export const FINGERPRINT_ID_REQUIRED = 'Fingerprint id is required';
export const ORG_ID_REQUIRED = 'Org id is required';
export const ONLY_SINGLE_DEVICE_LOGIN_ALLOWED =
    'You can access your account only from 1 device. To access from new device contact {{{tutorContact}}}';
export const MAX_DEVICES_LOGIN_REACHED =
    'Maximum devices login reached, please logout from other device(s) to continue.';
export const INVALID_DEVICES_ALLOWED =
    'Can not get devices allowed for this org';
export const SUCCESS_REGISTERED = 'User registered Successfully';
export const FAILED_TO_ADD_USER = 'Failed to add user';
export const ERROR_EMAIL_UPDATE = 'Please update email to enter bank details';
export const EMAIL_IS_REQUIRED = 'Email is required';
export const MOBILE_ALREADY_EXISTS = 'Mobile number already exists';
export const USER_ALREADY_EXISTS_DIFF_TYPE =
    'User already exists with different type';

export const GROUP_CREATE_SUCCESS = 'Group created Successfully';
export const GROUP_CREATE_PENDING =
    'Success, Your group will be live in some time';
export const INVALID_GROUP = 'Group not exists';
export const ALREADY_A_MEMBER = 'Already a member of this group';
export const ACCEPTED = 'Accepted';
