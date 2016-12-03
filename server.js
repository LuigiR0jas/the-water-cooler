//First, we define the variables we're gonna use given the libraries we will use, and specify a port.
var express = require('express'),
    app = express(),
    path = require('path'),
    favicon = require('serve-favicon');
    morgan = require('morgan')
    port = process.env.PORT || 8080; //means port will be whatever it's in the environmental variable PORT,
    //or 8080 if there's nothing there.

//Here, Express will now that whatever is up on this level of the path, can be used by the application.
app.use(express.static(__dirname + '/app'));

// configure our app to handle CORS requests
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \
    Authorization');
    next();
});

// log all requests to the console
app.use(morgan('dev'));

//Simply put, we set the favicon
app.use(favicon(__dirname + '/app/assets/favicon.ico'));

//We define a homepage, a file we are going to send our clients should they ask for our root route.
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/app/welcomepage.html'));
});

app.get('/index', function(req, res) {
    res.sendFile(path.join(__dirname + '/app/fuck.html'));
});

//We tell our express app which port we're going to work with.
app.listen(port);

//And a last but not least mandatory console.log so we can know what we're doing.
console.log(port + ' is the magic port!');
