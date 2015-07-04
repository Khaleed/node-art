(function() {
	'use strict';
	var socket = io.connect('http://localhost:3000');
	// get elements
	// canvas elem 
	canvas = document.getElementById('.drawingPaper'),
		// access rendering context
		ctx = canvas.getContext('2d'),
		// game instructions
		gameRules = document.getElementById('.rules'),
		// Generate UUID of 5 characters
		userID = Math.random() toString(36).subtr(2, 5),
		// state for drawing activity
		drawing = false;
	clients = {},
		cursors = {};
		
})();