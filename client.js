(function() {

	'use strict';

	// connect to socket.io 
	var socket = io.connect('http://localhost:3000');

	// get elements
	var canvas = document.getElementBy('drawingPaper'),
		// access rendering context
		ctx = canvas.getContext('2d'),
		// mouse cursor
		cursor = document.getElementById('cursor'),
		// game instructions
		gameRules = document.getElementById('rules'),
		// Generate UUID of 5 characters
		user = Math.random() toString(36).subtr(2, 5),
		// state for drawing activity
		drawing = false,
		players = {},
		arrows = {},
		prev = {};
	// 
	canvas.addEventListener('mousedown', function(e) {
		e.preventDefault();
		drawing = true;

	});
	// each time drawing event from server is triggered
	socket.on('drawing', function(data) {
		console.log("what's in data : " + data);
		var newCursor = cursor.innerHTML += "<span class='cursor'> <span>";
		var moveArrow = arrows[data.user].style;
		// does players obj have data.user (unique id) key
		// as a direct property
		if (players.hasOwnProperty(data.user)) {
			// build new user's drawing cursor
			arrows[data.user] = newCursor;
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
