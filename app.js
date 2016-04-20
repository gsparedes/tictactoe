
(function() {
    'use strict';

    var express = require('express');
    var http = require('http');
    var bodyParser = require('body-parser');
    var methodOverride = require('method-override')    
    var fs = require('fs');

    var app = express();        

    app.set('views', __dirname + '/views');
    app.engine('html', require('ejs').renderFile)
    app.set('view engine', 'html');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(methodOverride('X-HTTP-Method-Override'));
    app.use(express.static(__dirname + '/public'));    

    var server = http.createServer(app);
    server.listen(8080, function() {
      console.log("Tic-Tac-Toe server started on port 8080");
    });

    module.exports = app;

    require("./controllers/game-controller")(app, server);
}());