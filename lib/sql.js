var mysql = require('mysql');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var uuid = require('node-uuid');
var file = require('fs');
var Firebase = require('firebase');
var addrs = require('email-addresses');
var FirebaseTokenGenerator = require('firebase-token-generator');

// start the initial connection to the sql and firebase servers
var config = null;
var emptymodel = null;

// load up some stuff we need.
try {
	config = JSON.parse(file.readFileSync('configure.json'));
}
catch(err) {
	console.log("configure.json file missing!");
	process.exit();
}

try {
	emptyModel = JSON.parse(file.readFileSync('empty_model.json'));
}
catch (err) {
	console.log("empty_model.json file missing!");
	process.exit();
}

var connection = null;

var tokenGenerator = new FirebaseTokenGenerator(config.firebase.secret);
var fb = new Firebase(config.firebase.url);

function Command() {}

Command.prototype.start = function() {

	connection = mysql.createConnection({
	   host: config.mysql.host,
	   user: config.mysql.user,
	   password: config.mysql.password,
	   database: config.mysql.database
	});

	connection.on('error', function(err) {
		console.log("SQL Error");
		if (err.code == "PROTOCOL_CONNECTION_LOST") {
			console.log("Attempting recovery.");
			command = new Command();
			command.start();
		}
	});

	fb.auth(config.firebase.secret, function(error, result) {
		if (error) {
			console.log("Firebase login failed!", error);
			process.exit();
		} else {
			console.log("Firebase authenticated successfully");
		}
	});

	connection.connect(function(err) {
		if (err) {
			console.error('Error connecting: ' + err.stack);
			process.exit();
		}
		console.log('Connected as id ' + connection.threadId);
	});
};

// Graceful shutdown; server stays up though in case reconnect
// is desired.
Command.prototype.end = function() {
	console.log("SQL Disconnected");
	connection.end(function(err) {
		console.log("Error on SQL shutdown: " + err);
	});
	fb.unauth();
};

// Ungraceful shutdown, like a belly flop off the second balcony
// into a shallow kiddie pool; shuts down the server.
Command.prototype.die = function() {
	console.log("Disconnecting and shutting down server...");
	connection.destroy();
	fb.unauth();
	process.exit();
};

var command = new Command();
command.start();

// Everything after this are objects to handle specific actions that we need
// sql for. The objects all inherit from EventEmitter, which allows us to use
// event-based call backs using emit to send messages. Don't forget to
// start with Command.start first

// Objects: Login, Register, FS for FileSystem, and Verify.

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
			var fileUUID = connection.escape( uuid.v4() );
			var homeFolder = "INSERT INTO files (file_uuid,parent_uuid,user_uuid,file_name,";
				homeFolder += "file_json, file_type) VALUES (" + fileUUID + "," + fileUUID + ",";
				homeFolder += self.user_uuid + "," + self.user_nickname + "," + connection.escape("");
				homeFolder += ", 'folder')";
			connection.query(homeFolder, function(err, rows, fields) {
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

	// this is where stuff is stored on the user; it retrieves the user data
	// -every time- from the DB.
	passport.deserializeUser(function(email, done) {
		email = connection.escape(email);
		var query = "SELECT users.user_uuid, users.user_email, ";
			query += "users.user_nickname, users.user_is_admin, files.file_uuid ";
			query += "FROM users INNER JOIN files ON ";
			query += "users.user_uuid=files.user_uuid WHERE ";
		var post = "file_uuid=parent_uuid AND user_email = " + email;

		connection.query(query + post, function(err, rows) {
			rows[0].fb_token = tokenGenerator.createToken({
				username: rows[0].user_nickname,
				admin: rows[0].user_is_admin,
				uuid: rows[0].user_uuid
			});
			//uncomment to see what's actually being put into the req token:
			//console.log(rows[0]);
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

// Firebase methods
FS.prototype.load = function(file_uuid, data) {
	var self = this;
	self.data = data;
	fb.child('files').child(file_uuid).child('loaded').once("value", function(data) {
		if (data.val()) {
			// do nothing, there's live data; never ever mess with the user.
			return;
		}
		fb.child('files').child(file_uuid).update(self.data);
	});
};

FS.prototype.loadXCL = function(file_uuid, data) {
	fb.child('users').child(file_uuid).update(data);
};

FS.prototype.transferData = function(file_uuid, data) {
	var self = this;
	self.SQLData = JSON.parse(data.file_json);

	fb.child('files').child(file_uuid).child('loaded').once("value", function(data) {
		if ( data.val() ) {
			console.log("Do nothing.");
		} else {
			fb.child('files').child(file_uuid).update(self.SQLData);
			fb.child('files').child(file_uuid).update({'loaded':true});
		}
	});
};

// SQL methods
FS.prototype.checkForErrors = function(error, rows, fields, reason) {
	if (error) {
		this.emit('error', reason + ":" + error);
		return true;
	}
	return false;
};

// Gets a user's home, top-most-level folder.
// This is an entry command.
FS.prototype.froot = function(user_uuid) {
	var self = this;
	self.user_uuid = connection.escape(user_uuid);

	var query = 'SELECT * FROM files WHERE user_uuid = ';
	var post = self.user_uuid + " AND ";
		post += "file_uuid = parent_uuid";
	connection.query(query + post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, "froot")) {
			return false;
		} else if (rows.length === 0) {
			self.emit('failure', 'Root record not found.');
		} else {
			self.emit('success', rows);
		}
	});
};

// Returns a list of all items in a user's folder.
// This is an entry command.
// Note: returning an empty data set is perfectly acceptable; this would be
// an empty folder.
FS.prototype.flist = function(parent_uuid) {
	var self = this;
	self.parent_uuid = connection.escape(parent_uuid);
	var query = "SELECT * FROM files WHERE ";
	var post = "parent_uuid = " + self.parent_uuid;
		post += " AND parent_uuid != file_uuid";
	connection.query(query + post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, "flist")) {
			return false;
		} else {
			data = rows;
			self.emit('success', data);
		}
	});
};

// Delete a file or file tree.
// This is an entry command.
FS.prototype.fdelete = function(file_uuid, user_uuid) {
	var self = this;
	self.user_uuid = connection.escape(user_uuid);
	self.file_uuid = file_uuid;

	var query = "SELECT * FROM files WHERE ";
	var post = "file_uuid=" + connection.escape(file_uuid);
		post += " AND user_uuid=" + self.user_uuid;

	connection.query(query+post, function(err, rows, fields) {
		if (self.checkForErrors( err, rows, fields, "fdelete")) {
			return false;
		} else if (rows.length === 0) {
			self.emit('failure', 'cannot find file to delete');
		} else if (rows[0].file_type == 'symlink') {
			self.emit('failure', 'you cannot delete shared files');
		} else if (rows[0].file_uuid == rows[0].parent_uuid) {
			self.emit('failure', 'you cannot delete root directories');
		}
		self.runDelete(self.file_uuid, self);
		self.emit("success", "file(s) deleted");
	});
};

// This performs the actual deletion task; a seperate function is needed to
// help keep the recursive and emit logic sane.
// This is a helper function
FS.prototype.runDelete = function(file_uuid, self) {
	self.file_uuid = connection.escape(file_uuid);
	var query = "SELECT * FROM files WHERE ";
	var post = "file_uuid=" + self.file_uuid;
		post += " AND user_uuid=" + self.user_uuid;

	connection.query(query + post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, "runDelete")) {
			return false;
		} else if (rows.length === 0) {
			return;
		} else if (rows[0].file_type == 'symlink') {
			return;
		} else if (rows[0].file_uuid == rows[0].parent_uuid) {
			return;
		}

		if (rows[0].file_type == 'folder') {
			self.deleteChildren(file_uuid, self);
		}
		var query = "DELETE FROM files WHERE ";
		var post = "file_uuid=" + connection.escape(rows[0].file_uuid);
		connection.query(query+post, function(err, rows, fields) {
			if (self.checkForErrors(err, rows, fields, "runDelete internal")) {
				return false;
			}
		});
	});
};

// this helps traverse the deletion graph for folders
// this is a helper function
FS.prototype.deleteChildren = function(parent_uuid, self) {
	self.parent_uuid = connection.escape(parent_uuid);
	var query = "SELECT * FROM files WHERE ";
	var post = "parent_uuid=" + self.parent_uuid;

	connection.query(query+post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, "deleteChildren")) {
			return false;
		}
		for (var child in rows) {
			self.runDelete(rows[child].file_uuid, self);
		}
	});
};

// If you call this without file_type or file_name, it makes a new folder.
// if you call this with three arguments, the third one will be file_name,
// not file_type, and you'll get a new folder!
// This is an entry command.
FS.prototype.fnew = function(parent_uuid, user_uuid, file_name, file_type) {
	var self = this;

	file_type = (typeof file_type === 'undefined') ? 'folder' : file_type;

	file_name = (typeof file_name === 'undefined') ? 'Untitled' : file_name;

	self.parent_uuid = connection.escape(parent_uuid);
	self.user_uuid = connection.escape(user_uuid);
	self.file_type = connection.escape(file_type);
	self.file_name = connection.escape(file_name);

	// This first query is to make sure we're writing to a folder and not
	// to a file or to nowhere
	var query = "SELECT * FROM files WHERE ";
	var post = "file_uuid = " + self.parent_uuid;
		post += " AND file_type = 'folder'";

	connection.query(query + post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, "fnew")) {
			return false;
		} else if (rows.length === 0) {
			self.emit('failure', 'Bad parent_uuid');
		} else {
			// The three here is access level, in this case edit.
			self.checkXCL(err, rows, fields, self, 3, self.finalizeNew);
		}
	});
};

// This gets file data out of the database, won't work with folders.
// If you want folder contents, use list with the desired folder's file_uuid
// as the parent_uuid.
// This is an entry command.
FS.prototype.fopen = function(file_uuid, user_uuid) {
	var self = this;
	self.file_uuid = connection.escape(file_uuid);
	self.user_uuid = connection.escape(user_uuid);

	var query = "SELECT * FROM files WHERE ";
	var post = "file_uuid = " + self.file_uuid;
		post += " AND file_type != 'folder'";

	connection.query(query + post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, "fnew")) {
			return false;
		} else if (rows.length === 0) {
			self.emit('failure', 'Bad file_uuid');
		} else  {
			// The one here is access level, in this case view.
			self.checkXCL(err, rows, fields, self, 1, self.finalizeOpen);
		}
	});
};

// Finishes the opening process.
// This is a helper command.
FS.prototype.finalizeOpen = function(err, rows, fields, self) {
	var query = 'SELECT user_uuid, file_json FROM files WHERE ';
	var post = "file_uuid = " + self.file_uuid;

	connection.query(query + post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, "finalizeOpen")) {
			return false;
		}
		self.emit('success', rows[0]);
	});
};

// Verifies a user's access rights.
// This is a helper command.
FS.prototype.checkXCL = function(err, rows, fields, self, level, finish) {
	if (connection.escape(rows[0].user_uuid) == self.user_uuid) {
		finish(err, rows, fields, self);
	} else {
		var query = "SELECT * FROM xcl WHERE ";
		var post = "user_uuid = " + self.user_uuid + " AND ";
			post += "file_uuid = " + self.file_uuid;
		connection.query(query + post, function(err, rows, fields) {
			if (self.checkForErrors(err, rows, fields, "checkXCL")) {
				return false;
			} else if (rows.length === 0) {
				self.emit('failure', 'Access denied: No XCL Entry');
			} else if (rows[0].access_level < level) {
				self.emit('failure', 'Access denied: Insufficient Privilege Level');
			} else {
				finish(err, rows, fields, self);
			}
		});
	}
};

// This saves firebase data to the database, making a new version checkpoint.
// This is an entry command.
FS.prototype.fsave = function(file_uuid, user_uuid) {
	var self = this;
	self.file_uuid = connection.escape(file_uuid);
	self.user_uuid = connection.escape(user_uuid);

	// check version table, save latest to big front-end,
	// and also make a new version
	var query = "SELECT * FROM files WHERE ";
	var post = "file_uuid = " + self.file_uuid;

	connection.query(query + post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, "fsave")) {
			return false;
		} else if (rows.length === 0) {
			self.emit('failure', 'Bad file_uuid');
		} else {
			// The 2 here is access level, in this case comment
			// (because commenters need to be able to save comments)
			self.checkXCL(err, rows, fields, self, 2, self.fsaveHelper);
		}
	});
};

// This does the actual saving for fsave.
// This is a helper command.
FS.prototype.fsaveHelper = function(err, rows, fields, self) {
	// strip escape characters from file_uuid first before FB will take them
	var file_uuid = self.file_uuid.replace(/'/g, '');
	fb.child('files').child(file_uuid).once("value", function(data) {
		if (!data.val() ) return;
		self.fdata = connection.escape(JSON.stringify(data.val()));
		var query = "UPDATE FILES SET ";
		var post = "file_json = " + self.fdata;
			post += " WHERE file_uuid = " + self.file_uuid;

		connection.query(query+post, function(err, rows, fields) {
			if (self.checkForErrors(err, rows, fields, "fsaveHelper")) {
				return false;
			}
			self.finalizeFSave(err, rows, fields, self);
		});
	});
};

// This updates version histroy for fsave.
// This is a helper command.
FS.prototype.finalizeFSave = function(err, rows, fields, self) {
	var query = "SELECT MAX(version_number) AS MAX ";
		query += " FROM VERSIONS WHERE ";
	var post = "file_uuid = " +  self.file_uuid;

	connection.query(query+post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, 'finalizeFSave - select')) {
			return false;
		}
		var maxNum = 0;
		if (typeof rows[0].MAX === 'number') {
			maxNum = rows[0].MAX + 1;
		}

		var query = "INSERT INTO VERSIONS ";
			query += "(file_uuid, version_number, version_json) VALUES ";
		var post = "(" + self.file_uuid;
			post += ", " + maxNum;
			post += ", " + self.fdata + ")";
		connection.query(query+post, function(err, rows, fields) {
			if (self.checkForErrors(err, rows, fields, 'finalizeFSave - version')) {
				return false;
			}
			self.emit("success", null);
		});
	});
};

// This function will copy all the XCL entries from parent to file. Should only
// be used when making a new file.
FS.prototype.copyXCL = function(parent_uuid, file_uuid, self) {

	var query = "SELECT * FROM xcl WHERE file_uuid = ";
	var post = connection.escape(parent_uuid);

	connection.query(query + post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, 'copyXCL')) {
			return false;
		}
		if (rows.length === 0 ) {
			self.emit('success', self.new_uuid);
			return true;
		}
		var arrXCL = [];
		for (var record in rows) {
			var tempArr = [rows[record].user_uuid, file_uuid, rows[record].access_level];
			arrXCL[record] = tempArr;
		}
		var query = "INSERT INTO xcl (user_uuid, file_uuid, access_level) VALUES ";
		var post = connection.escape(arrXCL);

		connection.query(query + post, function(err, rows, fields) {
			if (self.checkForErrors(err, rows, fields, 'copyXCL')) {
				return false;
			}
			self.emit('success', self.new_uuid);
			return true;
		});
	});
};

// This actually creates the new file
// This is a helper command
FS.prototype.finalizeNew = function(err, rows, fields, self) {
	self.new_uuid = uuid.v4();

	var query = "INSERT INTO files SET ";
	var post = "file_uuid=" + connection.escape(self.new_uuid);
		post += ",parent_uuid=" + self.parent_uuid;
		post += ",user_uuid=" + self.user_uuid;
		post += ",file_name=" + self.file_name;
		post += ",file_type=" + self.file_type;
		post += ",file_json=" + ((self.file_type == "'file'") ? "'{}'":"''");

	connection.query(query + post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, 'finalizeNew')) {
			return false;
		}
		self.copyXCL(post.parent_uuid, post.file_uuid, self);
	});
};

// This retrieves the access control list for a file.
// This is an entry command.
FS.prototype.fxcl = function(file_uuid) {
	var self = this;
	self.file_uuid = connection.escape(file_uuid);

	var query = "SELECT user_uuid, access_level FROM xcl WHERE ";
	var post = "file_uuid = " + self.file_uuid;

	connection.query(query+post, function(err, rows, fields) {
		var xcl_obj = {};

		if (self.checkForErrors(err, rows, fields, 'fxcl')) {
			return false;
		} else if (rows.length === 0 ) {
			self.emit('success', xcl_obj);
			return false;
		} else {
			for (var item in rows) {
				xcl_obj[rows[item].user_uuid] = rows[item].access_level;
			}
			data = xcl_obj;
			self.emit('success', data);
		}
	});
};

// This retrieves a fancy access control list for a file for the UI to use
// This is an entry command.
FS.prototype.fancyXCL = function(file_uuid) {
	var self = this;
	self.file_uuid = connection.escape(file_uuid);

	var query = "SELECT user_nickname, user_email, users.user_uuid, access_level FROM ";
		query += "xcl INNER JOIN users on users.user_uuid=xcl.user_uuid ";
	var post = "WHERE file_uuid=" + self.file_uuid;

	connection.query(query + post, function(err, rows, fields) {

		if (self.checkForErrors(err, rows, fields, 'fancyXCL')) {
			return false;
		} else {
			self.emit("success", rows);
		}
	});
};

// Below here is everything that handles setting sharing options.
// These methods break the usual pattern of immediately escaping values;
// make sure everything gets escaped before talking to the SQL database.

// This first part just verifies that the user is allowed to change
// share settings.
FS.prototype.fshare = function(data, user_uuid) {
	var self = this;
	self.data = data;
	self.user_uuid = user_uuid;
	var query = "SELECT * FROM files WHERE ";
	var post = "file_uuid = " + connection.escape(data.file_uuid);

	connection.query(query+post, function(err, rows, fields) {
		if (self.checkForErrors(err, rows, fields, "fshare")) {
			return false;
		} else {
			// if we can edit...
			if (rows[0].file_edit_level === 1 || rows[0].user_uuid == self.user_uuid) {
				// only update edit level if it's necessary.
				if (rows[0].file_edit_level != self.data.edit_level) {
					self.updateEdit(self);
				}
				if (data.user_list) {
					self.checkUsers(self);
					// for item in data.user_list, find them in the db
					// if they don't exist, make them new, send verify email
					// if they do exist, add XCL entries for them.
				}
			} else {
				self.emit('failure', 'Access denied');
			}
		}
	});
};

FS.prototype.updateEdit = function(self) {
	var query = "UPDATE files SET ";
	var post = "file_edit_level=" + connection.escape(self.data.edit_level);
		post += " WHERE file_uuid=" + connection.escape(self.data.file_uuid);
	connection.query(query+post, function(err, rows, fields) {
		// do nothing. don't emit - there's too much going on.
	});
};

// This is to see which users we already have in the DB, and which we don't.
// users which already exist can just have symlinks and XCL updates;
// users which don't exist need to be added and verified
FS.prototype.checkUsers = function(self) {
	var keys = [];
	self.keys = Object.keys(self.data.user_list);

	var query = "SELECT user_email FROM users WHERE ";
	var post = "";
	console.log( Object.keys(self.data.user_list) );

	// this part goes through, verifies emails, and builds our post
	for ( var i in self.keys ) {
		if (addrs.parseOneAddress(self.keys[i])) {
			post += "user_email=" + connection.escape(self.keys[i]) + " OR ";
		}
	}
	// This is necessary to remove a trailing 'or' that would exist otherwise
	post = post.substring(0, post.length-3);
	// todo: replace console.log with connection.query and continue with logic.
	console.log(query+post);
};

exports.FS = FS;
exports.Pass = Pass;
exports.Verify = Verify;
exports.Command = Command;
exports.Login = Login;
exports.Register = Register;
exports.emptyModel = emptyModel;
exports.config = config;
