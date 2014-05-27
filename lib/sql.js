var mysql = require('mysql');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var bcrypt = require('bcrypt');

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
	this.user_password = connection.escape(bcrypt.hashSync(this.user_password, 12));
	this.user_validate = connection.escape(bcrypt.hashSync(this.user_email, 2));
}

function FS() {

}

util.inherits(Login, EventEmitter);
util.inherits(Register, EventEmitter);
util.inherits(FS, EventEmitter);

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
	} else {
		var query = "INSERT INTO users (user_email, user_password, user_first_name,";
			query = query + "user_last_name, user_organization, user_nickname,";
			query = query + "user_validate) VALUES (" + self.user_email + ",";
			query = query + self.user_password + "," + self.user_first_name + ",";
			query = query + self.user_last_name + "," + self.user_organization + ",";
			query = query + self.user_nickname + "," + self.user_validate + ")";
			connection.query(query, function(err, rows, fields) {
				if (err) throw err;
			});
			self.emit('success', self.user_validate);
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

exports.Command = Command;
exports.Login = Login;
exports.Register = Register;
