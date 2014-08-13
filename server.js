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
var uuid = require('node-uuid'); // use uuid.v4() to generate fresh uuids
// imports from my modules
var fortune = require('./lib/fortune.js'); // light amusing script for testing
var SQL = require('./lib/sql.js'); // provides interface for SQL events
var mail = require('./lib/mail.js'); // used to send email to users

SQL.Pass(passport);

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

// if you don't logout with req.logout first before killing the sql connection
// then passport will horf an ugly looking error.
router.get('/adminLogout', function(req,res) {
	req.logout();
	res.redirect(302, '/');
	//command.end();
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
			console.log(req.session.messages);
			return res.redirect('/login');
		}
		req.login(user, function(err) {
			if (err) return next(err);
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
				mail.sendMail(address, "QuipData email verification", response);
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

router.get('/file', function(req, res) {
	/* uncomment this for production
	if (!req.user) {
		res.redirect('/',302);
	} //*/

	res.render('test', {
		root: req.user.file_uuid
	});
});

// Launch application.
router.get('/app', function(req, res) {

	var fb = SQL.config.firebase.url + "files/" + req.query.fb;
	res.render('./gui/index', {
		auth_token: req.user.fb_token,
		UserUUID: req.user.user_uuid,
		FirebaseRef: fb
	});
});

// This handles all filesystem-related work
router.get('/fs', function(req, res) {
	var fs = new SQL.FS();
	fs.on("error", function(error) {
		res.json( { type: "error", msg: error } );
	});
	fs.on("failure", function(error) {
		res.json( { type: "failure", msg: error } );
	});

	switch (req.query.operation) {
		case "flist":
			fs.on("success", function(data) {
				res.json( {type: "success", msg: data} );
			});
			fs.flist(req.query.file_uuid);
			break;
		case "fnew":
			fs.on("success", function(data) {
				res.json( { type: "success", msg: "New file made"} );
			});
			fs.fnew(req.query.parent_uuid, req.user.user_uuid, req.query.file_name, req.query.file_type );
			break;
		case "fopen":
			var xcl = {};
			fs.on("success", function(data) {
				xcl[req.user.user_uuid] = 1;
				xcl = data;
				fs.loadXCL(req.query.file_uuid, xcl);
				fs.load(req.query.file_uuid, SQL.emptyModel);
			});
			fs.fxcl(req.query.file_uuid);

			fs = new SQL.FS();
			fs.on("error", function(error) {
				res.json( { type: "error", msg: error });
			});
			fs.on("failure", function(error) {
				res.json( { type: "failure", msg: error });
			});
			fs.on("success", function(data) {
				res.json( { type: "success", msg: data } );
				xcl[data.user_uuid] = 4;
				fs.loadXCL(req.query.file_uuid, xcl);
				fs.loaded(req.query.file_uuid);
				//fs.load(req.query.file_uuid, JSON.parse(data.file_json));
			});
			fs.fopen(req.query.file_uuid, req.user.user_uuid);
			break;
		case "fancyXCL":
			fs.on("success", function(data) {
				res.json( {type: "success", msg: data });
			});
			fs.fancyXCL(req.query.file_uuid);
			break;
		case 'fsave':
			console.log("Someone wants to save " + req.query.file_uuid);
			break;
		case 'fdelete':
			fs.on("success", function(data) {
				res.json( { type: "success", msg: "file deleted"} );
			});
			fs.fdelete(req.query.file_uuid, req.user.user_uuid);
			break;
		default:
			res.json( { type: "error", msg: "Unknown Command"} );
			break;
	}
});

// Replace this with a proper success view
router.get('/success', function(req, res) {
	res.send("We've sent you a verification message! Please check your email.");
});

// A way to see the headers data that is sent by the browser to the server
// Kept for posterity; to re-enable, turn the /* into a //*
/*
router.get('/headers', function(req,res) {
	var s = '';
	for (var name in req.headers) s += name + ": " + req.headers[name] + '<p>';
		res.send(s);
});//*/

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
		res.send("Something went wrong on our end.");
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
		res.locals.fb_token = req.user.fb_token;
	}
	next();
});

app.use(express.static(__dirname + '/public'));
app.use('/', router);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express started at ' + app.get('port') + '; press Ctrl-C to terminate.');
});
