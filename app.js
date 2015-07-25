(function() {
	// get express
	var express = require('express');
	var app = express();
	// Server creates a new server 
	// and app obj supplied as an option  
	var server = require('http').Server(app);
	// socket.io and htpp sharing the same server
	var io = require('socket.io')(server);
	var path = require('path');
	var colors = require('colors');
	var port = process.env.port || 3000;
	// routes
	app.get('/', function(req, res) {
		res.sendFile(__dirname + '/index.html');
	});
	// static route
	app.use('/static', express.static('static'));

	// listen to connection event for socket.io
	io.on('connection', function(socket) {
		console.log('socket.io established');
		// listen to mousemove event
		socket.on('mousemove', function(data) {
			socket.broadcast.emit('moving', data);
			console.log('inside data.x : ' .green + data.x);
			console.log('inside data.y: ' .red + data.y);
			console.log('inside data.drawing ' .yellow + data.drawing);
			console.log('inside data.id ' .blue + data.id);
		});
		socket.on('disconnection', function() {
			console.log('user logged out');
		});
	});
	// app listen same as http.Server.listen
	server.listen(port, function() {
		console.log('listening on port ' + port);
	});
})();