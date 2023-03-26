const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
// const bigInt = require('big-integer');
const BOT_TOKEN = '5371169753:AAHAmaKvsrAhcJLke3YV39WsxzwP8DPAbwk';
const input = require('input');
// import { AuthKey } from 'telegram/crypto/AuthKey';
const telegram = async () => {
	// let sessionManish = '';
	// const client = new TelegramClient(
	// 	new StringSession(sessionManish),
	// 	14320533,
	// 	'192db7fb339420314bef52629b25533e',
	// 	{ connectionRetries: 5 }
	// );
	// await client.start({
	// 	phoneNumber: '+918587850199',
	// 	phoneCode: async () => await input.text('Code ?'),
	// 	onError: (err) => console.log(err)
	// });

	// await client.connect();
	// console.log('result1', JSON.stringify(client.session));
	// const result = await client.invoke(
	// 	new Api.channels.CreateChannel({
	// 		title: 'Title',
	// 		about: 'About',
	// 		megagroup: false
	// 		// forImport: true,
	// 		// geoPoint: new Api.InputGeoPoint({
	// 		// 	lat: 8.24,
	// 		// 	long: 8.24,
	// 		// 	accuracyRadius: 43
	// 		// }),
	// 		// address: 'some string here'
	// 	})
	// );

	// console.log(JSON.stringify(result));
	// const channelId = result.updates[1].channelId;
	// const channelAccessHash = result.chats[0].accessHash;
	// let sessionPrateek =
	// 	'1BQANOTEuMTA4LjU2LjE2MQG7Pc99fQdGvu/f06ZtCex68Jr5eTCBA4YUjoj90Ggh5eWQSjSmkOkKMteanKYsu0TTlQGTcXjjpwYiAyyc/kPTaZZOhJ3qpS1pykePQm2zN4xKHAMU3EyVKiKCYOKzZqHHKhB8vR43GeEbIGtytG7EEUYVDZ5VZZ81SL4XjcC8g9+hUo+5K8/zS9k9CBJXC8AeGhG49CfMLRcUmKXqNQWLSJhJ2HnOgAUSp1FUaSvMz6zwPzAdHHNe2nw89V0oN4fLtUQSrXQfxWOCES4/HCq8VgU3gKMXOOOAzxF6NYIvuFCO4VDQisW/dNBhkplCcKyEBUWanvtZVrLxu2j9UvyTtg==';
	// const client1 = new TelegramClient(
	// 	new StringSession(sessionPrateek),
	// 	14320533,
	// 	'192db7fb339420314bef52629b25533e',
	// 	{ connectionRetries: 5 }
	// );
	// await client1.connect();
	// const tutorInfo = await client1.getMe();
	// console.log(tutorInfo);
	// const channelResult = await client1.invoke(
	// 	new Api.channels.CreateChannel({
	// 		title: 'Title',
	// 		about: 'About',
	// 		megagroup: false
	// 		// forImport: true,
	// 		// geoPoint: new Api.InputGeoPoint({
	// 		// 	lat: 8.24,
	// 		// 	long: 8.24,
	// 		// 	accuracyRadius: 43
	// 		// }),
	// 		// address: 'some string here'
	// 	})
	// );
	// console.log(JSON.stringify(channelResult));
	// // await client1.start({
	// // 	phoneNumber: '+919044624143',
	// // 	phoneCode: async () => await input.text('Code ?'),
	// // 	onError: (err) => console.log(err)
	// // });
	// const user = await client1.getEntity('+919810746284');
	// // console.log(channelResult);
	// console.log(
	// 	'info',
	// 	Number(channelResult.chats[0].id),
	// 	channelResult.chats[0].accessHash
	// );
	// const result1 = await client1.invoke(
	// 	new Api.channels.InviteToChannel({
	// 		channel: new Api.InputChannel({
	// 			channelId: Number(channelResult.chats[0].id),
	// 			accessHash: channelResult.chats[0].accessHash
	// 		}),
	// 		users: [
	// 			new Api.InputUser({
	// 				userId: Number(user.id),
	// 				accessHash: Number(user.accessHash)
	// 			})
	// 		]
	// 	})
	// );
	// console.log('END', result1);
	// await input.text('type anything ?');
	// const result2 = await client1.invoke(
	// 	new Api.channels.EditBanned({
	// 		channel: new Api.InputChannel({
	// 			channelId: Number(channelResult.chats[0].id),
	// 			accessHash: channelResult.chats[0].accessHash
	// 		}),
	// 		participant: new Api.InputUser({
	// 			userId: Number(user.id),
	// 			accessHash: Number(user.accessHash)
	// 		}),
	// 		bannedRights: new Api.ChatBannedRights({
	// 			viewMessages: true,
	// 			sendMessages: true,
	// 			sendMedia: false,
	// 			sendStickers: false,
	// 			sendGifs: false,
	// 			sendGames: false,
	// 			sendInline: false,
	// 			sendPolls: false,
	// 			changeInfo: false,
	// 			inviteUsers: false,
	// 			pinMessages: false
	// 		})
	// 	})
	// );
	// console.log(result2);
	// await input.text('type anything ?');
	// const result3 = await client1.invoke(
	// 	new Api.channels.InviteToChannel({
	// 		channel: new Api.InputChannel({
	// 			channelId: Number(channelResult.chats[0].id),
	// 			accessHash: channelResult.chats[0].accessHash
	// 		}),
	// 		users: [
	// 			new Api.InputUser({
	// 				userId: Number(user.id),
	// 				accessHash: Number(user.accessHash)
	// 			})
	// 		]
	// 	})
	// );

	const session = new StringSession(''); // You should put your string session here
	const client = new TelegramClient(
		session,
		14320533,
		'192db7fb339420314bef52629b25533e',
		{}
	);
	await client.start({
		phoneNumber: '+918910319716',
		phoneCode: async () => await input.text('Code ?'),
		onError: (err) => console.log(err)
	});
	await client.connect(); // This assumes you have already authenticated with .start()
	const user = await client.getEntity('+919810746284');
	// const result = await client.invoke(
	// 	new Api.account.CheckUsername({
	// 		username: '+919810746284'
	// 	})
	// );
	console.log(user); // prints the result
};
telegram();
