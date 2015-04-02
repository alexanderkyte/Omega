var Github = require("github");
var ghHandle;

var PullRequest = function(input, cb) {
	console.dir(arguments);
};

var config_all_open_prs = {};

var construct_pull_requests = function(cb){
	return function (prs, op_err) {
		if (op_err) {
			cb(null, op_err);
		}
		async.each (prs, PullRequest, cb);
	};
};

var get_pull_requests = function(cb) {
	ghHandle.pullRequests.getAll(all_open_prs, construct_pull_requests(cb));
}

module.exports = function(cfg) {
	gh_handle = new GitHubApi();
	return gh_wrapper;
}
