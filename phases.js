var GitHub = require("./github.js");

var approved = function(number, command, cb) {
	if (state == "pending" ){
		return cb(null);
	} else if (state == "failed") {
		return GitHub.post_message(number, "This", cb);
	} else if (state == "success" && command == "merge") {
		GitHub.try_merge(number, function(err){
			if(err) {
				GitHub.post_message(number, "Could not merge repo for the following reasons: " + err.message, cb);
			}
		});
	} else {
		console.dir("Unknown command reached.");
	}
};

var disapproved = function(number, command, cb) {
	if (command == "approve"){
		return async.series([
			function(next){
				GitHub.set_status(number, "approved", next);
			}, function(){
				GitHub.post_message(number, "Build", cb);
			}
		]);
	}
}

var phases = {
	approved: approved,
	disapproved: disapproved
};

phases.process = function(pr, cb) {
	phases[pr.phase](pr.number, pr.command, state, cb);
}

module.exports = phases;
