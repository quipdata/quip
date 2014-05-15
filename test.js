var fs = require('fs');

// read in password data for our database
var data = [];
fs.readFile('./password.dat', 'utf-8', function(err,data) {
      if (err) {
         return console.log(err);
      } else {
         data = data.replace(/(\r\n|\n|\r)/gm,"").split(',');
         console.log(data);
      }
   });
