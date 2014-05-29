var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport("SMTP", {
   host: "smtp.washington.edu",
   port: 587,
   auth: {
      user: "quipdata@uw.edu",
      pass: "Barn!burner"
   }
});

exports.sendMail = function(sendTo, message) {
	var mailOptions = {
		from: "quipdata@uw.edu",
		to: sendTo,
		subject: "Email address verification",
		text: message
	};
	transport.sendMail(mailOptions);
};
