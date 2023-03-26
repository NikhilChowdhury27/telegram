import isAuthenticated from '../../../middlewares/isAuthenticated';
import addGroup from '../../api/groups/controller/add.group';
import WhatsappCreate from '../../api/groups/controller/add.whatsapp';
import listGroups from '../../api/groups/controller/list.group';
import getGroup from '../../api/groups/controller/get.group';
import getGroupUnauth from '../../api/groups/controller/get.groupUnauth';

import updateGroup from '../../api/groups/controller/update.group';
import listMember from '../../api/members/controller/list.member';
import statsGroup from '../../api/groups/controller/stats.group';
import groupMembersMigration from '../../api/groups/controller/group.members.migration';
import PreAuthGroup from '../../api/groups/controller/preAuth.group';
import CreateLinks from '../../api/groups/controller/create.links';
import ChannelStats from '../../api/groups/controller/channel.breakdown';
import MigrateGroupPlans from '../../api/groups/controller/migrateGroupPlans';
import MigrateMemberPlans from '../../api/members/controller/addMemberPlan';
import ExtendMembersExpiry from '../../api/groups/controller/extend.MembersExpiry';
import UploadImage from '../../api/groups/controller/upload.logo';
import GetAutomateBot from '../../api/groups/controller/get.automate.bot';
import GetChannel from '../../api/groups/controller/get.automated.group';
import ClassplusWebhook from '../../api/groups/controller/classplus.webhook';
import CreateGroupCoAdmin from '../../api/groups/controller/group.coAdmin';
import GetGroupCoAdmin from '../../api/groups/controller/coAdmin.list';
import RenewScript from '../../api/members/controller/renew.trigger';
import listGroupsAll from '../../api/groups/controller/list.all.groups';
import GroupRazorpayLinksGeneration from '../../api/groups/controller/group.razorpayLinks';
import WhatsappMap from '../../api/groups/controller/update.wa.mapping';

module.exports = function (app, path = '') {
    addGroup.post(app, path + '/group', [isAuthenticated]);
    WhatsappMap.post(app, path + '/group/whatsappmap', [isAuthenticated]);
    WhatsappCreate.post(app, path + '/group/whatsapp', [isAuthenticated]);
    listGroups.get(app, path + '/group', [isAuthenticated]); // pass groupId in queryParams to get details of one group
    listGroupsAll.get(app, path + '/group/all', [isAuthenticated]);
    getGroup.get(app, path + '/group/:groupId', [isAuthenticated]);
    getGroupUnauth.get(app, path + '/groupUnauth/:groupId');
    updateGroup.put(app, path + '/group/:groupId', [isAuthenticated]);
    listMember.get(app, path + '/group/:groupId/members', [isAuthenticated]);
    statsGroup.get(app, path + '/group/members/stats', [isAuthenticated]);
    groupMembersMigration.post(app, path + '/group/membersMigration');
    PreAuthGroup.post(app, path + '/preAuthGroup/:id');
    CreateLinks.post(app, path + '/group/links');
    ChannelStats.get(app, path + '/channelStats', [isAuthenticated]);
    MigrateGroupPlans.post(app, path + '/migrateGroupPlans', [isAuthenticated]);
    MigrateMemberPlans.post(app, path + '/addMemberPlanId', [isAuthenticated]);
    ExtendMembersExpiry.post(app, path + '/extendMembersExpiry', [
        isAuthenticated
    ]);
    UploadImage.post(app, path + '/uploadImage', [isAuthenticated]);

    GetAutomateBot.get(app, path + '/getAutomateBot', [isAuthenticated]);

    GetChannel.get(app, path + '/getAutomatedChannel', [isAuthenticated]);
    ClassplusWebhook.post(app, path + '/classplusWebhook', []);
    CreateGroupCoAdmin.post(app, path + '/createCoAdmin', [isAuthenticated]);
    GetGroupCoAdmin.get(app, path + '/getCoAdmins/:groupId', [isAuthenticated]);
    RenewScript.post(app, path + '/member/renewalScript');
    GroupRazorpayLinksGeneration.post(app, path + '/generatePaymentLinks');
};
