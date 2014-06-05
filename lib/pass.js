var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;

// starts the initial connection to the sql server
var connection = mysql.createConnection({
   host: 'us-cdbr-azure-west-a.cloudapp.net',
   user: 'bee741e5969e8c',
   password: '8a2a5909',
   database: 'quiptestdb'
});

module.exports = function(passport) {

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
			console.log("From pass.js:");
			console.log(rows[0]);
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