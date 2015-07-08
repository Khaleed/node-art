(function() {

	'use strict';

	// connect to socket.io 
	var socket = io.connect('http://localhost:3000');
	// get elements
	var canvas = document.getElementBy('canvas'),
		// rendering context
		ctx,
		// mouse pointer
		pointer = document.getElementById('pointer'),
		// rules
		gameRules = document.getElementById('rules'),
		// Generate UUID of 5 characters
		user = Math.random().toString(36).subtr(2, 5),
		today = new Date,
		emittedTime = today.getMilliseconds(),
		// state for drawing activity
		drawing = false,
		players = {},
		pointers = {},
		hist = {};
	// event handler for drawing on canvas
	canvas.addEventListener('mousedown', function(e) {
		e.preventDefault();
		drawing = true;
		hist.x = e.pageX; // X coordinate (in pixels) of mouse pointer
		hist.y = e.pageY; // Y coordinate of mouse pointer
		// hide game rules
		gameRules.style.display = 'none';
	});
	// drawing
	document.addEventListener('mousemove', function(e) {
		// figure out a way to reduce 
	});
	// not drawing
	document.addEventListener('mouseup mouseleave', function(e) {
		drawing = false;
	});
	// each time drawing event from server is triggered
	socket.on('drawing', function(data) {
		console.log("what's in data : " + data);
		var newCursor = pointer.innerHTML += "<span class='pointer'> <span>";
		var moveArrow = pointers[data.user].style;
		// does players obj have data.user (unique id) key
		// as a direct property
		if (players.hasOwnProperty(data.user)) {
			// build new user's drawing pointer
			pointers[data.user] = newCursor;
		}
		// move mouse pointer
		moveArrow.left = data.x;
		moveArrow.top = data.y;
		// draw
		draw(players[data.user].x, players[data.user].y, data.x, data.y);
		// save players states
		players[data.user] = data;

	});
})();
