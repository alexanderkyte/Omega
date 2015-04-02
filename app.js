var config = require("./config");
var async = require("async");

var GitHub = require("./github")(config);
var Phases = require("./phases");

var run = function() {
	GitHub.get_pull_requests(function(prs, err) {

		if (err)
			return err;
			//return console.dir(err);

		async.each(prs, Phases.Process, function(err){
			if (err)
				return err;
				//return console.log(err);
		})

	});
};

//setInterval(run, config.interval);
run();
