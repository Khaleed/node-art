(function() {
    // connect to socket.io
    var socket = io.connect('http://localhost:3000'),
        // get main elements
        canvas = document.getElementById('canvas'),
        cursors = document.getElementById('cursors'),
        ctx,
        room = window.location.pathname.split('/').pop(),
        rules = document.getElementById('rules'),
        // generate UIID
        id = Math.random().toString(36).substr(2, 5),
        // drawing state
        drawing = false,
        // main objects to hold each client and each cursors
        clients = {},
        mousePointers = {},
        current = {},
        // lastEmit in millisecs
        lastEmit = Date.now();
    // check if canvas is supported by user's browser
    if(canvas.getContext) {
        ctx = canvas.getContext('2d');
    } else {
        alert('Canvas not supported by your browser');
    }
    // once connected emit room event
    // to ensure clients start from same state
    socket.on('connect', function() {
        socket.emit('room', room);
    });
    // canvas mousedown handler
    canvas.addEventListener('mousedown', function(e) {
        e.preventDefault();
        drawing = true;
        // current player's vertical coordinate relative to whole doc
        current.x = e.pageX;
        // current player's horizontal coordinate relative to whole doc
        current.y = e.pageY;
        // hide game rules
        rules.style.display = 'none';
        // draw grid lines
        renderGrid(5, '#C0C0C0');
    });
    // mousemove event handler on document
    document.addEventListener('mousemove', function(e) {
        // send packets every 30 millisecs
        if (Date.now() - lastEmit > 30) {
            // event emitted by other sockets that contain
            // mouse coordinates, UUID, and drawing state
            socket.emit('moving', {
                'x': e.pageX,
                'y': e.pageY,
                'drawing': drawing,
                'id': id
            });
            // re-initialise
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
    // node relays back to us the mouse coordinates, unique id of user
    // and drawing states emitted by other sockets
    socket.on('moving', function(data) {
        // create DOM obj
        var newCursor = document.createElement('div');
        // add cursor class
        newCursor.className = 'cursor';
        // append newCurso to cursors div
        cursors.appendChild(newCursor);
        // does clients obj have data.id (unique id) key
        // as a direct property?
        if (!clients.hasOwnProperty(data.id)) {
            // build a mousePointers for each user with unique id
            mousePointers[data.id] = newCursor;
            console.log("cursors: " + mousePointers[data.id]);
        }
        // move mouse left and right
        mousePointers[data.id].style.left = data.x;
        mousePointers[data.id].style.right = data.y;
        // if the id is drawing and id has unique ID
        if (data.drawing && clients[data.id]) {
            // draw line
            // clients[data.id] hold previous id position
            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
        }
        // save current player state
        clients[data.id] = data;
        clients[data.id].updated = Date.now();
    });
    // bind mouseup and mouseleave events and set drawing state to false
    // timing and order of mouse events cannot be predicted in advance
    addMultiListeners(document, 'mouseup mouseleave', function() {
        drawing = false;
    });
    // helper functions to drawLine on canvas
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
})();