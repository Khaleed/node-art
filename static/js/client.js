(function() {

    'use strict';
    // connect to socket.io 
    var socket = io.connect('http://localhost:3000');
    // mouse pointer
    var cursor = document.getElementById('cursor');
    var canvas = document.getElementById('canvas');
    // rules
    var gameRules = document.getElementById('rules');
    // Generate UUID of 5 characters
    var user = Math.random().toString(36).substr(2, 5);
    // state for drawing activity
    var drawing = false;
    // objects
    var players = {},
        cursors = {};
    // drawLine helper function
    function drawLine(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
    }
    // each time drawing event from server is triggered
    socket.on('moving', function(data) {
        var newCursor = pointer.innerHTML += "<div class='pointer'> <div>";
        var moveMouse = cursors[data.user].style;
        // does players obj have data.user (unique id) key
        // as a direct property
        if (players.hasOwnProperty(data.user)) {
            // build new user's drawing pointer
            cursors[data.user] = newCursor;
        }
        // move mouse pointer
        moveMouse.left = data.x;
        moveMouse.top = data.y;
        // if the user is drawing and has an ID
        if (data.drawing && players[data.user]) {
            // draw line
            drawLine(players[data.user].x, players[data.user].y, data.x, data.y);
        }
        // save players states
        players[data.user] = data;
    });
    var current = {};
    // event handler for drawing on canvas
    if (canvas.getContext) {
        canvas.addEventListener('mousedown', function(e) {
            e.preventDefault();
            drawing = true;
            current.x = e.pageX; // X coordinate (in pixels) of mouse pointer
            current.y = e.pageY; // Y coordinate of mouse pointer
            // hide game rules
            gameRules.style.display = 'none';
        });
    } else {
        console.error('canvas not supported on your browser');
    }
    // bind mouseup and mousleave events and set drawing state to false
    document.documentElement.bind('mouseup mouseleave', function(e) {
        drawing = false;
    });
    // mousemove event
    var prevEmitTime = Date.now();
    document.documentElement.addEventListener('mousemove', function(e) {
        // figure out a way to reduce packets of info being sent
        if (Date.now() - prevEmitTime > 30) {
            // emit onMouseMove event
            socket.emit('mousemove', {
                // return x y cordinates, user, and drawing state
                'x': e.pageX,
                'y': e.pageY,
                'drawing': drawing,
                'user': user
            });
            prevEmitTime = Date.now();
        }
        // draw line for the current user's movement because it's not
        // captured by onMouseMove event
        if (drawing) {
            drawLine(current.x, current.y, e.pageX, e.pageY);
        }
    });
})();

/* 

document.body.onload = function() {
    var canvas = document.getElementById('canvas');
    if(canvas.getContext) {
        var ctx = canvas.getContext('2d');
        // Filled Triangle
        ctx.beginPath();
        ctx.moveTo(25, 25);
        ctx.lineTo(105, 25);
        ctx.lineTo(25, 105);
        ctx.fill();
        // Stroked Triangle
        ctx.beginPath();
        ctx.moveTo(125, 125);
        ctx.lineTo(125, 45);
        ctx.lineTo(45, 125);
        ctx.closePath();
        ctx.stroke();
    } else {
        console.error('canvas not supported by browser');
    }
};


*/