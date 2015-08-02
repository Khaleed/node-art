// node is wrapped around with a function with arguments:
// require, exports, module, __filename, __dirname
// get express
var express = require('express');
// initialise express app
var app = express();
// create HTTP server and have it dispatch
// requests to express  
var server = require('http').Server(app);
// socket.io and  sharing the same http server as express
// to listen for requests
var io = require('socket.io')(server);
var colors = require('colors');
var randomString = require('randomstring');
var port = process.env.port || 3000;
var roomName;
// routes
// once you get to homepage/root re-direct
app.get('/', function(req, res) {
	//create unique ID
	var id = randomString.generate(5);
	// re-direct to dynamic route
	res.redirect('/draw/' + id);
});
// dynamically create routes for unique game rooms
// dynamic route same as static but placeholders used
// to name arguments part of the URL Path
// :id creates id property on the request.params obj
app.get('/draw/:id', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});
// route to static file
app.use('/static', express.static('static'));
// listen to connection event for socket.io
io.on('connection', function(socket) {
	console.log('socket.io established');
	// listen for room event
	socket.on('room', function(room) {
		// add socket to room
		socket.join(room);
		// assign roomName
		roomName = room;
		console.log('connected to room '.gray + roomName);
	});
	// listen to mousemove event from client.js
	socket.on('mousemove', function(data) {
		io.to(roomName).emit('moving', data);
	});
	socket.on('disconnection', function() {
		console.log('user logged out');
		// upon disconnection leave room
		socket.leave(roomName);
	});
});
// app listen same as http.Server.listen
server.listen(port, function() {
	console.log('listening on port ' + port);
});