const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
// const bigInt = require('big-integer');
const input = require('input');
// import { AuthKey } from 'telegram/crypto/AuthKey';
// const BOT_TOKEN = '5371169753:AAHAmaKvsrAhcJLke3YV39WsxzwP8DPAbwk';
const BOT_TOKEN = '5347515722:AAHlr_LekaRZgomua297T7mZ0qtIaJl4un0';
const botSession =
	'1BQANOTEuMTA4LjU2LjE2MQG7RW+9SnYNhcXAwqYYGBRnaSMpIbiJmX7VWEpTN3vp0UINE3REqTQBVOIdsRN5+DqlIQOpEhau5MEuTIPj/FNfuzZ1L7KDheeZ41Hzc/IxUHlDy/5ASXEAzSvu3aGnteZshMy6XsAlagfD6L/2+hTauzPbdLRy9klKovP51xzFU3LMarx8Mg3kJ3r3CUWSaEd1P0Dpps6sWMlFzkCyNG8TSLDCU3JpQChsYsWqUe0+ltWMvmtUXWIk2FcsvPIowsZPnSiSZ5XW5hH/8GqIiyIFTX65km7pk/AieJj5BVRWVIK9J9RGVRoFJ+aZLLq16Z6YjEb6IoHvjRZjJzXabALcVQ==';
const telegram = async () => {
	let sessionManish = '';
	let client = new TelegramClient(
		new StringSession(''),
		9644173,
		'8f61391076fc9efcec4751a43f1120ca',
		{ connectionRetries: 5 }
	);
	await client.start({
		phoneNumber: '+918770706570',
		phoneCode: async () => await input.text('Code ?'),
		onError: (err) => console.log(err)
	});
	await client.connect();
	// console.log('getMe :: ', await client.getMe());
	console.log('user session', client.session.save());
	// console.log('result1', JSON.stringify(client.session));
	// const result = await client.invoke(
	//  new Api.channels.CreateChannel({
	//      title: 'Title',
	//      about: 'About',
	//      megagroup: false
	//      // forImport: true,
	//      // geoPoint: new Api.InputGeoPoint({
	//      //  lat: 8.24,
	//      //  long: 8.24,
	//      //  accuracyRadius: 43
	//      // }),
	//      // address: 'some string here'
	//  })
	// );
	// console.log(JSON.stringify(result));
	// const channelId = result.updates[1].channelId;
	// const channelAccessHash = result.chats[0].accessHash;
	// let sessionPrateek =
	// 	'1BQANOTEuMTA4LjU2LjE2MQG7Pc99fQdGvu/f06ZtCex68Jr5eTCBA4YUjoj90Ggh5eWQSjSmkOkKMteanKYsu0TTlQGTcXjjpwYiAyyc/kPTaZZOhJ3qpS1pykePQm2zN4xKHAMU3EyVKiKCYOKzZqHHKhB8vR43GeEbIGtytG7EEUYVDZ5VZZ81SL4XjcC8g9+hUo+5K8/zS9k9CBJXC8AeGhG49CfMLRcUmKXqNQWLSJhJ2HnOgAUSp1FUaSvMz6zwPzAdHHNe2nw89V0oN4fLtUQSrXQfxWOCES4/HCq8VgU3gKMXOOOAzxF6NYIvuFCO4VDQisW/dNBhkplCcKyEBUWanvtZVrLxu2j9UvyTtg==';
	// const client1 = new TelegramClient(
	// 	new StringSession(sessionPrateek),
	// 	17455582,
	// 	'de4d16549963fa6b1a40eed62b94070f',
	// 	{}
	// );
	// // await client1.start({
	// // 	phoneNumber: '+919044624143',
	// // 	phoneCode: async () => await input.text('Code ?'),
	// // 	onError: (err) => console.log(err)
	// // });
	// await client1.connect();
	// console.log('You should now be connected.');
	// let user = null;
	// try {
	// 	user = await client1.getEntity('@mayurmadmax');
	// } catch (err) {
	// 	console.error(err);
	// 	return err;
	// }
	// console.log('fetching user info', user);
	// // await client1.connect();
	// // const tutorInfo = await client1.getMe();
	// // console.log('tutorInfo', tutorInfo);
	// const channelResult = await client1.invoke(
	// 	new Api.channels.CreateChannel({
	// 		title: 'Prateek 14th May',
	// 		about: 'Prateek testing channel',
	// 		megagroup: false
	// 	})
	// );
	// const botClient = new TelegramClient(
	//     new StringSession(''),
	//     14320533,
	//     '192db7fb339420314bef52629b25533e',
	//     { connectionRetries: 5 }
	// );
	// await botClient.start({
	//     botAuthToken: BOT_TOKEN
	// });
	// await botClient.connect();
	// // const botUser = await botClient.getMe();
	// console.log('botToken Session', botClient.session.save());
	// // console.log('botToken id', Number(botUser.id));
	// // console.log('botToken accessHash', Number(botUser.accessHash));
	// // console.log(
	// // 	JSON.stringify(channelResult),
	// // 	channelResult.chats[0].id,
	// // 	channelResult.chats[0].accessHash
	// // );
	// // await client1.start({
	// // 	phoneNumber: '+918130038979',
	// // 	phoneCode: async () => await input.text('Code ?'),
	// // 	onError: (err) => console.log(err)
	// // });
	// // await input.text('type anything?');
	// // const user = await botClient.getEntity('918090988980');
	// // console.log('user', user);
	// // console.log(
	// // 	'channelDetails',
	// // 	Number(channelResult.chats[0].id),
	// // 	channelResult.chats[0].accessHash
	// // );
	// await input.text('type anything ?');
	// console.log('fetching user info', Number(user.id), user.accessHash);
	// const result1 = await client1.invoke(
	// 	new Api.channels.InviteToChannel({
	// 		channel: new Api.InputChannel({
	// 			channelId: Number(channelResult.chats[0].id),
	// 			accessHash: channelResult.chats[0].accessHash
	// 		}),
	// 		users: [
	// 			new Api.InputUser({
	// 				userId: Number(user.id),
	// 				accessHash: user.accessHash
	// 			})
	// 		]
	// 	})
	// );
	// console.log('END', result1);
	// await input.text('type anything ?');
	// const result2 = await client1.invoke(
	// 	new Api.channels.EditAdmin({
	// 		channel: new Api.InputChannel({
	// 			channelId: Number(channelResult.chats[0].id),
	// 			accessHash: channelResult.chats[0].accessHash
	// 		}),
	// 		userId: new Api.InputUser({
	// 			userId: Number(user.id),
	// 			accessHash: user.accessHash
	// 		}),
	// 		adminRights: new Api.ChatAdminRights({
	// 			changeInfo: true,
	// 			postMessages: true,
	// 			editMessages: true,
	// 			deleteMessages: true,
	// 			banUsers: true,
	// 			inviteUsers: true,
	// 			pinMessages: true,
	// 			addAdmins: true,
	// 			anonymous: true,
	// 			manageCall: true,
	// 			other: true
	// 		}),
	// 		rank: 'Owner'
	// 	})
	// );
	// console.log('result2', result2);
	// client1.destroy();
	// // await input.text('type anything ?');
	// // const result2 = await client1.invoke(
	// //     new Api.channels.EditBanned({
	// //         channel: new Api.InputChannel({
	// //             channelId: Number(channelResult.chats[0].id),
	// //             accessHash: channelResult.chats[0].accessHash
	// //         }),
	// //         participant: new Api.InputUser({
	// //             userId: Number(user.id),
	// //             accessHash: Number(user.accessHash)
	// //         }),
	// //         bannedRights: new Api.ChatBannedRights({
	// //             viewMessages: true,
	// //             sendMessages: true,
	// //             sendMedia: false,
	// //             sendStickers: false,
	// //             sendGifs: false,
	// //             sendGames: false,
	// //             sendInline: false,
	// //             sendPolls: false,
	// //             changeInfo: false,
	// //             inviteUsers: false,
	// //             pinMessages: false
	// //         })
	// //     })
	// // );
	// // console.log(result2);
	// // await input.text('type anything ?');
	// // const result3 = await client1.invoke(
	// //     new Api.channels.InviteToChannel({
	// //         channel: new Api.InputChannel({
	// //             channelId: Number(channelResult.chats[0].id),
	// //             accessHash: channelResult.chats[0].accessHash
	// //         }),
	// //         users: [
	// //             new Api.InputUser({
	// //                 userId: Number(user.id),
	// //                 accessHash: Number(user.accessHash)
	// //             })
	// //         ]
	// //     })
	// // );
	// await input.text('type anything to send message ?');
	// // const result = await client1.invoke(
	// // 	new Api.channels.GetFullChannel({
	// // 		channel: new Api.InputChannel({
	// // 			channelId: Number(channelResult.chats[0].id),
	// // 			accessHash: channelResult.chats[0].accessHash
	// // 		})
	// // 	})
	// // );
	// // console.log(JSON.stringify(result.chats));
	// await client1.sendMessage(
	// 	new Api.InputChannel({
	// 		channelId: Number(channelResult.chats[0].id),
	// 		accessHash: channelResult.chats[0].accessHash
	// 	}),
	// 	{
	// 		message: 'Hey, Testing msg',
	// 		file: '/Users/prateek-classplus/Desktop/Screenshot 2022-05-12 at 1.16.36 AM.png'
	// 	}
	// 	// new Api.Message({
	// 	// 	id: 245,
	// 	// 	message:
	// 	// 		'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=1000&q=80'
	// 	// 	// id: 242364635453,
	// 	// 	// message: 'Hello Manish',
	// 	// 	// file:
	// 	// })
	// );
	// await client.connect(); // This assumes you have already authenticated with .start()
	// const session = new StringSession(''); // You should put your string session here
	// const client = new TelegramClient(
	//     session,
	//     14320533,
	//     '192db7fb339420314bef52629b25533e',
	//     {}
	// );
	// const msgRes = await client.invoke(
	//     new Api.messages.SendMessage(
	//         new Api.InputChannel({
	//             channelId: Number(channelResult.chats[0].id),
	//             accessHash: channelResult.chats[0].accessHash
	//         }),
	//         // {
	//         // 	message: 'Hey, Testing msg',
	//         // 	file: '/Users/prateek-classplus/Desktop/Screenshot 2022-05-12 at 1.16.36 AM.png'
	//         // }
	//         new Api.Message({
	//             id: 245,
	//             message:
	//                 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=1000&q=80'
	//             // id: 242364635453,
	//             // message: 'Hello Manish',
	//             // file:
	//         })
	//     )
	// );
	// console.log('msgRes :: ', msgRes);
	// // const result = await client.invoke(
	// //     new Api.channels.ExportMessageLink({
	// //         channel: 'username',
	// //         id: 43,
	// //         thread: true
	// //     })
	// );
};
telegram();
