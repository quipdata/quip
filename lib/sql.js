var mysql = require('mysql');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var uuid = require('node-uuid');
// starts the initial connection to the sql server
var connection = mysql.createConnection({
   host: 'us-cdbr-azure-west-a.cloudapp.net',
   user: 'bee741e5969e8c',
   password: '8a2a5909',
   database: 'quiptestdb'
});

// Command starts and ends SQL connections; really should be run before
// any other methods in this file
function Command() {}

Command.prototype.start = function() {
	connection.connect(function(err) {
		if (err) {
			console.error('Error connecting: ' + err.stack);
			return;
		}
		console.log('Connected as id ' + connection.threadId);
	});
};

Command.prototype.end = function() {
	console.log("SQL Disconnected");
	connection.end(function(err) {
		if (err) {
			console.error('Error disconnecting: ' + err.stack);
			return;
		}
		console.log('SQL queue emptied.');
	});
};

// Everything after this are objects to handle specific actions that we need
// sql for. The objects all inherit from EventEmitter, which allows us to use
// event-based call backs using emit to send messages. Don't forget to
// start with Command.start first

// Objects: Login, Register, and FS for FileSystem handling.

function Login(username, password) {
	this.username = username;
	this.password = password;
}

function Register(user_email, user_password, user_first_name, user_last_name,
	user_organization, user_nickname) {

	this.user_email = connection.escape(user_email);
	this.user_password = connection.escape(user_password);
	this.user_first_name = connection.escape(user_first_name);
	this.user_last_name = connection.escape(user_last_name);
	this.user_organization = connection.escape(user_organization);
	this.user_nickname = connection.escape(user_nickname);
	this.user_password = connection.escape(bcrypt.hashSync(this.user_password, bcrypt.genSaltSync(12)));
	this.user_validate = connection.escape(bcrypt.hashSync(this.user_email, bcrypt.genSaltSync(2)));
	this.user_uuid = connection.escape( uuid.v4() );
}

function FS() {

}

function Verify(user_email, user_validate) {
	this.user_email = connection.escape(user_email);
	this.user_validate = connection.escape(user_validate);
}

util.inherits(Verify, EventEmitter);
util.inherits(Login, EventEmitter);
util.inherits(Register, EventEmitter);
util.inherits(FS, EventEmitter);

// Verify prototypes
Verify.prototype.perform = function() {
	var validate = this.validate;
	var self = this;
	var query = 'SELECT user_email, user_validate FROM users where ';
	query = query + 'user_email = ' + this.user_email + ' AND user_validate = ';
	query = query + this.user_validate;
	console.log(query);
	connection.query(query, function(err, rows, fields) {
		validate(err, rows, fields, self);
	});
};

Verify.prototype.checkForErrors = function(error, rows, fields, reason) {
	if (error) {
		this.emit('error', error);
		return true;
	}
	return false;
};

Verify.prototype.validate = function(err, rows, fields, self) {
	if (self.checkForErrors(err, rows, fields, 'Validate')) {
		return false;
	}
	if (rows.length < 1 ) {
		self.emit('failure', 'Validation failed');
		return false;
	}
	query = 'UPDATE users SET user_valid = 0, user_validate = ';
	query = query + connection.escape(bcrypt.hashSync(self.user_email,bcrypt.genSaltSync(2)));
	query = query + " WHERE user_email = " + self.user_email;
	connection.query(query, function(err, rows, fields) {
		self.update(err, rows, fields, self);
	});
};

Verify.prototype.update = function(err, rows, fields, self) {
	if (self.checkForErrors(err, rows, fields, 'update')) {
		return false;
	}
	self.emit('success', 'User validated');
};

// Register prototypes

Register.prototype.perform = function() {
	var checkUserEmail = this.checkUserEmail;
	var self = this;
	var query = 'SELECT user_email FROM users WHERE user_email = ' + this.user_email;
	connection.query(query, function(err, rows, fields) {
		checkUserEmail(err, rows, fields, self);
	});
};

Register.prototype.checkForErrors = function(error, rows, fields, reason) {
	if (error) {
		this.emit('error', error);
		return true;
	}
	return false;
};

Register.prototype.checkUserEmail = function(err, rows, fields, self) {
	if (self.checkForErrors(err, rows, fields, 'UserEmail')) {
		return false;
	} else if (rows.length > 0) {
		self.emit('failure', 'User email already in use');
		return false;
	} else {
		query = 'SELECT user_nickname FROM users WHERE user_nickname = ' + self.user_nickname;
		connection.query(query, function(err, rows, fields) {
			self.checkUserNickname(err, rows, fields, self);
		});
	}
};

Register.prototype.checkUserNickname = function(err, rows, fields, self) {
	if (self.checkForErrors(err, rows, fields, 'UserNickname')) {
		return false;
	} else if (rows.length > 0) {
		self.emit('failure', 'User nickname already in use.');
		return false;
	} else {
		var query = "INSERT INTO users (user_uuid, user_email, user_password, user_first_name,";
			query = query + "user_last_name, user_organization, user_nickname,";
			query = query + "user_validate) VALUES (" + self.user_uuid + "," + self.user_email + ",";
			query = query + self.user_password + "," + self.user_first_name + ",";
			query = query + self.user_last_name + "," + self.user_organization + ",";
			query = query + self.user_nickname + "," + self.user_validate + ")";
			connection.query(query, function(err, rows, fields) {
				if (err) throw err;
			});
			data = "email=" + self.user_email.replace(/'/g,"") + "&validate=";
			data = data + self.user_validate.replace(/'/g,"");
			self.emit('success', data);
	}
};

// Login prototypes
Login.prototype.checkForErrors = function(error, rows, fields, reason) {
	if (error) {
		this.emit('error', error);
		return true;
	}
	if (rows.length < 1) {
		this.emit('failure', reason);
		return true;
	}
	return false;
};

Login.prototype.checkUserName = function(error, rows, fields, self) {
	if (self.checkForErrors(error, rows, fields, 'username')) {
		return false;
	} else {
		self.emit('success', rows[0].solution);
	}
};

Login.prototype.checkPassword = function(error, rows) {

};

Login.prototype.perform = function() {
	var checkUserName = this.checkUserName;
	var self = this;
	connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
		checkUserName(err, rows, fields, self);
	});
};

// The Passport functionality interacts heavily with SQL and so is included
// here. For Passport modules that do not use the local strategy or SQL calls,
// they can be placed in a different module.
var Pass = function(passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.user_email);
	});

	passport.deserializeUser(function(email, done) {
		email = connection.escape(email);
		connection.query("SELECT * FROM users WHERE user_email = " + email, function(err, rows) {
			done(err, rows[0]);
		});
	});

	passport.use('local', new LocalStrategy({
		usernameField: 'user_email',
		passwordField: 'user_password',
		passReqToCallback: true
	},
	function(req, user_email, user_password, done) {
		email = connection.escape(user_email);
		password = connection.escape(user_password);
		connection.query("SELECT * FROM users WHERE user_email = " + email, function(err, rows) {
			if (err) return done(err);
			if (!rows.length || !bcrypt.compareSync(password, rows[0].user_password)) {
				return done(null, false, { message: "Credentials could not be verified." });
			}
			if(rows[0].user_valid < 0 ) {
				return done(null, false, { message: "User email not verified yet." });
			}
			return done(null, rows[0]);
		});
	}
	));

};

exports.Pass = Pass;
exports.Verify = Verify;
exports.Command = Command;
exports.Login = Login;
exports.Register = Register;
