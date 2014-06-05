// server.js

// basic setup
var express = require('express'); // webserver
var http = require('http');	// node
var bodyParser = require('body-parser'); // for POST and JSON
var cookieParser = require('cookie-parser'); // parses cookies
var session = require('cookie-session'); // sets up cookie-based sessions
var addrs = require('email-addresses'); // verifies emails as valid format
var app = express();		// main server loop
var port = process.env.PORT || 1337;  // port to listen on
var passport = require('passport'); // authenitcation shim

// imports from my modules
var fortune = require('./lib/fortune.js'); // light amusing script for testing
var SQL = require('./lib/sql.js'); // provides interface for SQL events
var mail = require('./lib/mail.js'); // used to send email to users
var pass = require('./lib/pass.js'); // passport support
pass(passport);

// Globals for modules
// Don't remove this! The other SQL commands will still work, but they'll be
// creating new connections as they do so, rapidly filling the connection queue
var command = new SQL.Command();
command.start();
// handlebars is our current view engine, and res.render calls will be routed
// to the handlebars engine
var handlebars = require('express3-handlebars').create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');


app.set('port', port );
app.use(cookieParser('warp5oh'));
app.use(session({ secret: 'sessionNow'}));
app.use(passport.initialize() );
app.use(passport.session() );

// The default (and only) router
var router = express.Router();

router.get('/', function(req,res) {
	res.render('home');
});

router.get('/adminLogout', function(req,res) {
	command.end();
	res.redirect(302, '/');
});

// note that router.get handles GET requests and
// router.post handles POST requests.
router.get('/login', function(req,res) {
	res.render('login');
});

router.post('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) return next(err);
		if (!user) {
			req.session.messages = info.message;
			console.log("Login:");
			console.log(req.session.messages);
			return res.redirect('/login');
		}
		req.login(user, function(err) {
			if (err) return next(err);
			//console.log(req.user);
			return res.redirect('/');
		});
	})(req, res, next);
});

router.get('/logout', function(req,res) {
	req.logout();
	res.redirect(302, '/');
});

router.get('/register', function(req,res) {
	res.render('register');
});

router.post('/register', function(req,res) {
	if (req.xhr || req.accepts('json')==='json') {
		var address;
		if (addrs.parseOneAddress(req.body.user_email)) {
			address = addrs.parseOneAddress(req.body.user_email).address;
		}
		if (!address) {
			res.render('register', {
				err: "You must enter a valid email address."
			});
		} else if (!req.body.user_password) {
			res.render('register', {
				err: "You must enter a password."
			});
		} else if (!req.body.user_nickname) {
			res.render('register', {
				err: "You need to enter a nickname."
			});
		} else {
			var register = new SQL.Register(address, req.body.user_password,
				req.body.user_first_name, req.body.user_last_name,
				req.body.user_organization, req.body.user_nickname);

			register.on('error', function(error) {
				console.log("Error: " + error);
				res.redirect('/', 302);
			});
			register.on('failure', function(error) {
				res.render('register', {
					err: error
				});
			});
			register.on('success', function(data) {
				var response;
				response = "Click this link to finish registration: ";
				response = response + "http://localhost:1337/verify?" + data;
				mail.sendMail(address, response);
				res.redirect('/success', 302);
			});
			register.perform();
		}
	} else {
		res.send('We cannot process your registration at this time.');
	}
});

router.get('/sql', function(req,res) {
	var login = new SQL.Login('test','pointless');
	login.on('error', function (error) {
		console.log("An error occured");
		res.redirect('/', 302);
	});
	login.on('failure', function(reason) {
		console.log("Failed to retrieve SQL response");
		res.redirect('/', 302);
	});
	login.on('success', function(data) {
		res.send("Got: " + data);
	});
	login.perform();
});

// Here we see an example of templating in action - we swap our getFortune for
// the appropriate handlebar code in about.handlebars, go check that out
// also note that the fortune.getFortune is in an external user module in /lib
router.get('/about', function(req,res) {
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});

// Replace this with a proper success view
router.get('/success', function(req, res) {
	res.send("Please check your email for verification.");
});

// A way to see the headers data that is sent by the browser to the server
router.get('/headers', function(req,res) {
	var s = '';
	for (var name in req.headers) s += name + ": " + req.headers[name] + '<p>';
		res.send(s);
});

router.get('/verify', function(req, res) {
	if ( req.query.email && req.query.validate ) {
		var verify = new SQL.Verify(req.query.email, req.query.validate);
		verify.on('error', function (error) {
			console.log("An error occured.");
			res.redirect('/', 302);
		});
		verify.on('failure', function(reason) {
			console.log("Failure at: " + reason);
			res.redirect('/', 302);
		});
		verify.on('success', function(data) {
			res.send("Success! :" + data);
		});
		verify.perform();
	} else {
		res.send("Oops.");
	}
});

router.use(function(req,res,next){
	res.status(404);
	res.render('404');
});

// this is needed to get POST and GET results!
app.use(bodyParser());

// This activates our test scripts when ?test=1 is at the end of the base url
app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});

app.use(function(req,res,next) {
	if (req.user) {
		res.locals.name = req.user.user_nickname;
	}
	next();
});

app.use(express.static(__dirname + '/public'));
app.use('/', router);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express started at ' + app.get('port') + '; press Ctrl-C to terminate.');
});
