var fortuneCookies = [
	'be as water',
	'reality is an illusion',
	'when your mind speaks, be the one that hears',
	'live the death before death'
];

exports.getFortune = function() {
	var index = Math.floor( Math.random() * fortuneCookies.length );
	return fortuneCookies[index];
}
