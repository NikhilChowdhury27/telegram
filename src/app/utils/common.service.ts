const { MasterService } = require('base-packages');
import _ from 'underscore';
import { memberEncryption, groupEncryption } from '../../config/constant';
const tinyUrl = require('tinyurl');
export default class CommonService extends MasterService {
    checkIfNewBatchManagement(apiVersion: number) {
        return apiVersion > 7 ? 1 : 0;
    }

    getDate(date) {
        return date.getDate();
    }

    getMonth(date) {
        return date.getMonth() + 1;
    }

    getYear(date) {
        return date.getFullYear();
    }

    getDateMonthYearArray() {
        const date = new Date();
        return [this.getDate(date), this.getMonth(date), this.getYear(date)];
    }

    getRenderedSMSTemplate(tplContent, tplData) {
        for (let key in tplData) {
            if (
                tplData[key] &&
                typeof (tplData[key] == 'string') &&
                tplData[key].length > 30
            ) {
                tplData[key] = tplData[key].substring(0, 28) + '..';
            }
        }
        const tpl = _.template(tplContent);
        const data = tpl(tplData);
        return data;
    }

    getTinyUrl(link) {
        try {
            return new Promise((resolve, reject) => {
                tinyUrl.shorten(link, function (res, err) {
                    if (err) {
                        console.error('Error in creating tiny link', err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            });
        } catch (err) {
            console.error('Error shortening link with Tiny', err);
        }
    }

    getEncryptedmember(memberId: string) {
        const memberSplit = String(memberId).split('');
        const encryptedMember = memberSplit.map((id) => memberEncryption[id]);
        return encryptedMember.join('');
    }

    getEncryptedGroup(groupId: string) {
        const groupSplit = String(groupId).split('');
        const encryptedGroup = groupSplit.map((id) => groupEncryption[id]);
        return encryptedGroup.join('');
    }

    getDecryptedMember(data: string) {
        const encryptSplit = data.split('');
        const member = encryptSplit.map((item) => {
            return Object.keys(memberEncryption).find(
                (key) => memberEncryption[key] === item
            );
        });
        const memberString = member.join('');
        return Number(memberString);
    }

    getDecryptedGroup(data: string) {
        const encryptSplit = data.split('');
        const group = encryptSplit.map((item) => {
            return Object.keys(groupEncryption).find(
                (key) => groupEncryption[key] === item
            );
        });
        const groupString = group.join('');
        return Number(groupString);
    }
}
