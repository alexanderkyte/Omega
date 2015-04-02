var config = require("./config");
var async = require("async");

var Github = require("./github");
var Phases = require("./phases/phases");

var run = function() {
	Github.get_pull_requests(function(prs, err) {

		if (err)
			return console.dir(err);

		async.each(prs, Phases.Process, function(err){
			if (err) {
				console.log(err);
			}
		})

	});
};

setInterval(run, config.interval);
