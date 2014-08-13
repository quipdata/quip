var nodemailer = require('nodemailer');
var file = require('fs');

var config = null;

try {
	config = JSON.parse(file.readFileSync('configure.json'));
}
catch(err) {
	console.log("configure.json file missing!");
	process.exit();
}

var transport = nodemailer.createTransport("SMTP", config.email);

exports.sendMail = function(sendTo, subject, message) {
	var mailOptions = {
		from: "quipdata@uw.edu",
		to: sendTo,
		subject: subject,
		text: message
	};
	transport.sendMail(mailOptions);
};
