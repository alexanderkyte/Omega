var async = require("async");
var GitHub = require("github");

var ghHandle;
var config;

var isSuccess = function(statuses) {
	for (var i=0; i < statuses.Length; i++) {
		var stat = statuses [i];
		if (stat.state == config.jenkins_done_status.state &&
				stat.context == config.jenkins_done_status.name) {
				return true;
		}
	}
	return false;
}

var PullRequest = function(pr, done) {
	return async.waterfall([
		function(next) {
			get_label(pr.number, function(err, labels) {
				var approved = false;
				for (var i=0; i in labels; i++) {
					if (labels[i].name == config.merge_label) {
						approved = true;
					}
				}
				next(err, approved);
			})
		},
		function(labels, next) {
			ghHandle.statuses.get({ 
				user: config.user,
				repo: config.repo,
				sha: pr.head.sha 
			}, function(err, statuses){
				var success = isSuccess (statuses)
				return next(err, labels, success);
			});
		},
		function(approved, success, next) {
			if (success) {
				done(err, null);
			} else {
				done(null, {
					pr: pr.number,
					approved: approved,
					success: success
				});
			}
		}], done);
};

var get_label = function(pr_num, cb) {
	return ghHandle.issues.getIssueLabels({
		user: config.user,
		repo: config.repo,
		number: pr_num
	}, cb);
}

var config_all_open_prs;
var create_config_all_open_prs = function() {
	return {
		user: config.user,
		repo: config.repo,
		state: "open",
		sort: "updated",
		direction: "desc",
		per_page: config.process_n_new
	};
};

var create_gh_config = function() {
	return {
		version: "3.0.0",
	};
};

var construct_pull_requests = function(cb){
	return function (op_err, prs) {
		if (op_err) {
			console.dir(op_err);
			return cb(op_err, null);
		}
		async.map (prs, PullRequest, cb);
	};
};

var get_pull_requests = function(cb) {
	return ghHandle.pullRequests.getAll(config_all_open_prs, construct_pull_requests(cb));
}

var try_merge = function(pr_number, cb){
	return ghHandle.pullRequests.merge({ 
		user: config.user,
		repo: config.repo,
		number: pr_number, 
	}, function(err, data) {
		return cb(err, null);
	});
};

module.exports = function(cfg) {
	if (!config){
		config = cfg
		config_all_open_prs = create_config_all_open_prs();
		ghHandle = new GitHub(create_gh_config());
		ghHandle.authenticate(cfg.auth);
	}

	return {
		get_pull_requests: get_pull_requests,
		try_merge: try_merge,
	};
}
