/*

Client-side JavaScript for Real-Time Drawing App.
The below code runs in a player's browser and uses
socket.io to link up with the server-side in order
to notify when an event happens. The event tells us
the mouse coordinates, id for user, and the drawing
state of the user in each particular moment.
*/

(function() {
    // connect to socket.io
    var socket = io.connect('http://localhost:3000');
    // get main elements 
    var canvas = document.getElementById('canvas'),
        ctx,
        cursors = document.getElementById('cursors'),
        room = window.location.pathname.split('/').pop(),
        rules = document.getElementById('rules');
    // check if canvas is supported by user's browser
    if (canvas.getContext) {
        // define rendering context
        ctx = canvas.getContext('2d');
    } else {
        alert('Canvas not supported by browser');
    }
    // generate UIID
    var id = Math.random().toString(36).substr(2, 5);
    // drawing state
    var drawing = false;
    // main game objects
    var clients = {};
    var cursors = {};
    // once connected emit room event
    socket.on('connect', function(room) {
        socket.emit('room', room);
    });
    // node relays back to us the mouse coordinates, unique id of user
    // and drawing states emitted by other sockets
    socket.on('moving', function(data) {
        // simplest form of abstraction to hide appending of cursors to cursors
        var appendCursor = cursors.innerHTML += '<div class="cursor">';
        // does clients obj not have data.id property
        if (!clients.hasOwnProperty(data.id)) {
            // build a cursors for each user 
            cursors[data.id] = appendCursor;
            console.log("cursors: " + cursors[data.id]);
        }
        // move mouse left and right
        // debug here because cursors[data.id] somehow becomes undefined
        // is whatever in cursors[data.id] a collection?
        cursors[data.id].style.left = data.x;
        console.log("cursors move left: " + cursors[data.id]);
        cursors[data.id].style.right = data.y;
        console.log("cursors move left: " + cursors[data.id]);
        // if the id is drawing and id has unique ID
        if (data.drawing && clients[data.id]) {
            // draw line
            // clients[data.id] hold previous id position
            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
        }
        // save current player state
        clients[data.id] = data;
    });
    var current = {};
    // canvas mousedown handler
    canvas.addEventListener('mousedown', function(e) {
        e.preventDefault();
        drawing = true;
        current.x = e.pageX;
        current.y = e.pageY;
        // hide game rules
        rules.style.display = 'none';
        // render drawing paper
        renderGrid(5, '#C0C0C0');
    });
    // bind mouseup and mouseleave events and set drawing state to false
    // timing and order of mouse events cannot be predicted in advance
    addMultiListeners(document, 'mouseup mouseleave', function() {
        drawing = false;
    });
    // set lastEmit time in milliseconds
    var lastEmit = Date.now();
    // mousemove event handler
    document.addEventListener('mousemove', function(e) {
        // limit packets sent to 30 miliseconds
        if (Date.now() - lastEmit > 30) {
            // event emitted by other sockets that contains
            // mouse coordinates, UUID, and drawing state on every mouse movement
            socket.emit('mousemove', {
                'x': e.pageX,
                'y': e.pageY,
                'drawing': drawing,
                'id': id
            });
            lastEmit = Date.now();
        }
        // Drawline based on current user movement as not 
        // received from socket.on('moving') 
        if (drawing) {
            drawLine(current.x, current.y, e.pageX, e.pageY);
            current.x = e.pageX;
            current.y = e.pageY;
        }
    });
    // remove inactive users after 10 seconds of logging on
    setInterval(function() {
        // loop through clients 
        for (var key in clients) {
            if (Date.now() - clients[key].updated > 10000) {
                delete cursors[key];
                delete clients[key];
            }
        }
    }, 10000);
    // helper functions to drawLine
    function drawLine(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
    }
    // to draw grid
    function renderGrid(pxl, color) {
        // save current state of canvas
        ctx.save();
        // set thickness of lines
        ctx.lineWidth = 0.5;
        // specify color or style for lines 
        ctx.strokeStyle = color;
        // horizontal lines
        for (var i = 0; i <= canvas.height; i += pxl) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.closePath();
            ctx.stroke();
        }
        // vertical lines
        for (var j = 0; j <= canvas.width; j += pxl) {
            ctx.beginPath();
            ctx.moveTo(j, 0);
            ctx.lineTo(j, canvas.height);
            ctx.closePath();
            ctx.stroke();
        }
        // restore most recent saved canvas to default state
        ctx.restore();
    }
    // to handle multiple events 
    function addMultiListeners(elem, str, cb) {
        // split events into substrings in an array 
        var events = str.split(' '),
            len = events.length,
            i;
        // loop & handle any multi events
        for (i = 0; i < len; i += 1) {
            elem.addEventListener(events[i], cb);
        }
    }
})();