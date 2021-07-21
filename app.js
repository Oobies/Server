const dgram = require('dgram');
const server = dgram.createSocket('udp4');

var Players = [];
var Debug = false;

server.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

server.on('message', (msg, rinfo) => {
	if (Debug)
		console.log(`Client message with ${msg} from ${rinfo.address}:${rinfo.port}`);

	let obj = JSON.parse(msg);
	if (obj.EVENT == 'CONNECT') {
		let Player = {
			id: obj.ID,
			username: obj.USERNAME,
			address: rinfo.address,
			port: rinfo.port,
			position: obj.POSITION,
			level: obj.LEVEL
		}
		Players[Player.id] = Player;

		server.send(JSON.stringify({ EVENT: 'CONNECT' }), rinfo.port, rinfo.address);

		console.log(`Client Connected with ID ${obj.ID} from ${rinfo.address}:${rinfo.port}`);

		for (let id in Players) {
			if (id == Player.id) {
				continue;
			}

			server.send(JSON.stringify({ EVENT: 'JOIN', ID: Players[obj.ID].id, LEVEL: Players[obj.ID].level, POSITION: Players[obj.ID].position }), Players[id].port, Players[id].address);
		};
	}
	if (obj.EVENT == 'DISCONNECT') {
		console.log(`Client Disconnected with ID ${obj.ID} from ${rinfo.address}:${rinfo.port}`);
		if (Players.length > 0) {
			for (let id in Players) {
				if (id == obj.ID) {
					continue;
				}

				server.send(JSON.stringify({ EVENT: 'LEAVE', ID: Players[obj.ID].id }), Players[id].port, Players[id].address);
			};
			delete players[obj.ID];
		}
	}

	if (obj.EVENT == 'LEVEL') {
		for (let id in Players) {
			if (id == obj.ID) {
				Players[id].level = obj.LEVEL;
				Players[id].position = obj.POSITION;
				continue;
			}

			server.send(JSON.stringify({ EVENT: 'LEVEL', ID: Players[obj.ID].id, LEVEL: Players[obj.ID].level, POSITION: Players[obj.ID].position }), Players[id].port, Players[id].address);
		};
	}

	if (obj.EVENT == 'MOVE') {
		for (let id in Players) {
			if (id == obj.ID) {
				Players[id].position = obj.POSITION;
				continue;
			}

			server.send(JSON.stringify({ EVENT: 'MOVE', ID: Players[obj.ID].id, LEVEL: Players[obj.ID].level, POSITION: Players[obj.ID].position }), Players[id].port, Players[id].address);
		};
	}

	if (obj.EVENT == 'CHAT') {
		for (let id in Players) {
			server.send(JSON.stringify({ EVENT: 'CHAT', ID: Players[obj.ID].id, MESSAGE: obj.MESSAGE }), Players[id].port, Players[id].address);
		};
	}
});

server.on('listening', () => {
	const address = server.address();
	console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(41234);