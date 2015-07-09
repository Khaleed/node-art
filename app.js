(function() {
	var express = require('express');
	var app = express();
	// Server creates a new server 
	// and app obj supplied as an option  
	var server = require('http').Server(app);
	// socket.io and htpp sharing the same server
	var io = require('socket.io')(server);
	var port = process.env.port || 3000;

	// routes
	app.get('/', function(req, res) {
		res.sendFile(__dirname + '/index.html');
	});
	// static routes
	app.use('/assets', express.static('assets'));

	// listen to connection event for socket.io
	io.on('connection', function(socket) {
		console.log('socket.io established');
		// listen to mousemove event
		socket.on('onMouseMove', function(data) {
			socket.broadcast.emit('drawing', data);
		});
	});
	server.listen(port, function() {
		console.log('listening on port ' + port);
	});
})();