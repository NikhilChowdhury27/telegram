const countryData = globalThis.countryData;
//import * as moment from 'moment';
import * as moment from 'moment-timezone';

export const dateType = {
    EPOCH: 1,
    UTC: 2,
    IST: 3
};
export const formatDateTimeByRegion = (
    date,
    region,
    type = 1,
    dateTimeFormatType = 1
) => {
    let dateTimeStamp;
    let timeFormat;
    let timezoneTxt;

    if (typeof region === 'object') {
        dateTimeStamp = region['dateTimeStampBackend'];
        timeFormat = region['timeFormatBackend'];
        timezoneTxt = region.timezoneTxt;
    } else {
        dateTimeStamp =
            countryData[region]['dateTimeStampBackend'] ||
            countryData['default']['dateTimeStampBackend'];
        timeFormat =
            countryData[region]['timeFormatBackend'] ||
            countryData['default']['timeFormatBackend'];
        timezoneTxt =
            countryData[region].timezoneTxt ||
            countryData['default']['timezoneTxt'];
    }

    switch (dateTimeFormatType) {
        //Date TIme Both
        case 1:
            switch (type) {
                case dateType.EPOCH:
                    return moment
                        .unix(date)
                        .format(`${dateTimeStamp} ${timeFormat}`);
                case dateType.UTC:
                    return moment(date)
                        .tz(timezoneTxt)
                        .format(`${dateTimeStamp} ${timeFormat}`);
                case dateType.IST:
                    return moment(date).format(
                        `${dateTimeStamp} ${timeFormat}`
                    );
            }
        // Time Only
        case 2:
            switch (type) {
                case dateType.EPOCH:
                    return moment.unix(date).format(`${timeFormat}`);
                case dateType.UTC:
                    return moment(date).tz(timezoneTxt).format(`${timeFormat}`);
                case dateType.IST:
                    return moment(date).format(`${timeFormat}`);
            }
        //Date Only
        case 3:
            switch (type) {
                case dateType.EPOCH:
                    return moment.unix(date).format(`${dateTimeStamp}`);
                case dateType.UTC:
                    return moment(date)
                        .tz(timezoneTxt)
                        .format(`${dateTimeStamp}`);
                case dateType.IST:
                    return moment(date).format(`${dateTimeStamp}`);
            }
    }
};
