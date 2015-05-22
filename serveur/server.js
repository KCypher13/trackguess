var app = require('http').createServer();
var io = require('socket.io')(app);
var fs = require('fs');
var clients=[];

io.use(function(socket, next) {
	
	clients[socket.id] = {};
	clients[socket.id].tracks = [];
  next();
});

io.on('connection', function(socket){
	console.log('connection');

	socket.on('join', function(data){


		if(io.sockets.adapter.rooms[data.room] == undefined){
			clients[socket.id].role = "admin";
			clients[socket.id].number = 1;
			socket.emit('game',{role : "admin", username : clients[socket.id].spotifyId})
		}
		else{

			clients[socket.id].role = "player";
			clients[socket.id].number = Object.keys(io.sockets.adapter.rooms[data.room]).length+1;
			players = []
			for(key in io.sockets.adapter.rooms[data.room]){
				var player = {}
				player.number = clients[key].number;
				player.id = clients[key].spotifyId;
				player.image = clients[key].image;
				players.push(player)
			}

			socket.emit('game', {role : "player", players:players, username : clients[socket.id].spotifyId, number: clients[socket.id].number});
			socket.broadcast.to(data.room).emit('newPlayer', { spotifyId : clients[socket.id].spotifyId, number: clients[socket.id].number, image: clients[socket.id].image});
		}

		socket.join(data.room);
		clients[socket.id].room = data.room;
	});

	socket.on('initUser', function(data){

		clients[socket.id].spotifyId = data.id;
		if(data.images.length > 0){

                clients[socket.id].image = data.images[0].url;
           }
          else{
          	app.image = null;
          }
		
	});

	socket.on('track', function(data){
		for(key in data.items){
			clients[socket.id].tracks.push(data.items[key]);
		}
		

	});

	socket.on('leaveRoom', function(data){

	});


	socket.on('launchgame', function(data){

		var players = Object.keys(io.sockets.adapter.rooms[clients[socket.id].room]);
		var tracks = [];

		for(var i = 0; i<5; i++){
				var client = clients[players[Math.round(Math.random() * (players.length-1 - 0) + 0)]];
				var clientTracks = client.tracks;
				var track = clientTracks[Math.round(Math.random() * (clientTracks.length - 0) + 0)];
				track.owner = client.number;
				tracks.push(track);
				
		}
		
		io.sockets.in( clients[socket.id].room ).emit('quizz', tracks);
	});

	socket.on('result', function(data){
		socket.broadcast.to(clients[socket.id].room).emit('result', {number: clients[socket.id].number, result: data.result})
	});

	socket.on('reload', function(data){
		io.sockets.in( clients[socket.id].room ).emit('reload', {});
	});

	socket.on('leaveRoom', function(data){

	})
});

app.listen(3000);