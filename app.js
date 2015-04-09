var config = require("./config");
var async = require("async");

var GitHub = require("./github")(config);

var run = function() {
	GitHub.get_pull_requests(function(prs, err) {

		if (err) {
			console.dir(err);
			return err;
		}

		console.dir(prs);

		async.each(prs, try_merge, function(err){
			if (err)
				console.dir(err);
				return err;
		})

	});
};

setInterval(run, config.interval);
