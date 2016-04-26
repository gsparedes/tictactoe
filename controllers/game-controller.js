'use strict';

var socketio = require("socket.io");

module.exports = function(app, server) {
	var io = socketio.listen(server);
    io.set('log level', 1);

    var xo = 'x';
    var o = false;
    var listOfPlayers = [];
    var playerCounter = 0;
    var moveCounter = 0;
    var listOfSpectatorsHtml = '<tr><th>Pending Players</th></tr>';

    var grid = {
      '0-0': '', '0-1':'', '0-2':'',
      '1-0': '', '1-1':'', '1-2':'',
      '2-0': '', '2-1':'', '2-2': ''
    };

    io.sockets.on('connection', function(socket) {

      	socket.on('client_connected', function(player) {
        	player.id = socket.id;
        	player.mark = xo;
        
        	if (xo == 'x' && o == false)  {
          		xo = 'o';
          		o = true;
        	} else
				xo = 'spectator';

			if (player.mark == 'spectator')
				listOfSpectatorsHtml += '<tr><td>'+ player.name +'</td></tr>';
				

	        listOfPlayers[playerCounter] = player;
	        playerCounter++;
        
	        socket.emit('connect_1', player);
	        io.sockets.emit('load', listOfPlayers, listOfSpectatorsHtml);
    	});
      
    	socket.on('process_move', function(coords, player) {	       
	        coords = coords.replace("#",'');
	        grid[coords] = player.mark;

	        io.sockets.emit('mark', coords);
        
	        if ( 
	        	(grid['0-0'] == grid['0-1'] && grid['0-1'] == grid['0-2'] && grid['0-0'] != '') ||

	        	(grid['1-0'] == grid['1-1'] && grid['1-1'] == grid['1-2'] && grid['1-0'] != '') ||

	        	(grid['2-0'] == grid['2-1'] && grid['2-1'] == grid['2-2'] && grid['2-0'] != '') ||
	        
		        (grid['0-0'] == grid['1-0'] && grid['1-0'] == grid['2-0'] && grid['0-0'] != '') ||

		        (grid['0-1'] == grid['1-1'] && grid['1-1'] == grid['2-1'] && grid['0-1'] != '') ||

		        (grid['0-2'] == grid['1-2'] && grid['1-2'] == grid['2-2'] && grid['0-2'] != '') ||
	        
		        (grid['0-0'] == grid['1-1'] && grid['1-1'] == grid['2-2'] && grid['0-0'] != '') ||

		        (grid['2-0'] == grid['1-1'] && grid['1-1'] == grid['0-2'] && grid['2-0'] != '') 
	        )
	        {
	          io.sockets.emit('gameover', player, false);
	        }

	        moveCounter++;
	        if (moveCounter == 9)
	        	io.sockets.emit('gameover', player, true);
    	});
      
	    socket.on('disconnect', function() {
	        var j = 0;
	        var n = 0;
	        var tmp = [];
	        var spectatorLeft = false;

	        while (n < listOfPlayers.length) {
	        	if (listOfPlayers[j].id == socket.id) {
	            	if(listOfPlayers[j].mark == 'o') {
	               		xo = 'o';
	               		o = false;
	             	}
	             
	            	if(listOfPlayers[j].mark == 'x')
	            		xo = 'x';
	         	  
	         	  	if (listOfPlayers[j].mark == 'spectator')
	         	  		spectatorLeft = true;
	         		n++;
	         	}
	         	 
	         	if (n < listOfPlayers.length) {
	         		tmp[j] = listOfPlayers[n];
	         	   	j++;
	         	   	n++;
	         	}
	        }
	         	
	        listOfPlayers = tmp;
	        playerCounter = j;
	        if (!spectatorLeft) {
	        	// Reset grid
		        grid = {
			      '0-0': '', '0-1':'', '0-2':'',
			      '1-0': '', '1-1':'', '1-2':'',
			      '2-0': '', '2-1':'', '2-2': ''
			    };
		        // Re-initialize players
		        var gameReady = false;
		        for (var y = 0; y < listOfPlayers.length; y++) {
		        	if (gameReady)
		        		io.sockets.emit('reload');
					else if(listOfPlayers[y].mark == 'spectator' && !gameReady) {
		        		listOfPlayers[y].mark = xo;
		        		if(xo == 'x' && o == false)  {
			          		xo = 'o';
			          		o = true;
			        	} else
			        		gameReady = true;
			        	io.sockets.emit('reload');
		        	} else
		        		io.sockets.emit('reload');
		        }	        	        
		        io.sockets.emit('load', listOfPlayers);
	        }
	    });
	});

	app.get('/', function(req, res){
    	res.render('layout');
    });
}