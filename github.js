var async = require("async");
var GitHub = require("github");
var phases = require("./commands");

var ghHandle;
var config;

var extract_bot_commands = function(comments, cb) {
	return async.map(comments, [], function(accum, comment, next){
		var user = comment.user.login
		if (!(user in config.reviewers))
			next(null, accum);

		for(var i=0; i < commands.Length; i++){
			if (comment.body.match(commands[i].regex)) {
				accum.push({
					time: comment.update_at,
					command: commands[i].name
				});
				return next(null, accum);
			}
		}
	}, cb);
}

var PullRequest = function(pr, cb) {
	return async.waterfall([
		function(next) {
			ghHandle.statuses.get({ 
				user: config.user,
				repo: config.repo,
				sha: pr.head.sha 
			}, next);
		},
		function(stat, next) {
			ghHandle.pullRequests.getComments({ 
				user: config.user,
				repo: config.repo,
				number: pr.number 
			}, function(err, comments) {
				extract_bot_commands(comments, function(commands, err){
					return next(err, {
						status: stat,
						commands: commands
					});
				}); 
			});
		}], cb);
};

var config_all_open_prs;
var create_config_all_open_prs = function() {
	return {
		user: config.user,
		repo: config.repo,
		state: "open",
		sort: "updated",
		direction: "desc"
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

var change_state = function(pr, state, cb){
	return ghHandle.statuses.create({ 
		user: config.user,
		repo: config.repo,
		number: pr.number, 
		sha: pr.head.sha,
		state: state,
		description: "Set by merge bot."
	}, function(err, data) {
		return cb(err, null);
	});
};

var post_message = function(pr, message, cb){
	return ghHandle.issues.createComment({
		user: config.user,
		repo: config.repo,
		number: pr.number,
		body: message
	}, function(err, data) {
		return cb(err, null);
	});
};

var try_merge = function(pr, cb){
	return ghHandle.pullRequests.merge({ 
		user: config.user,
		repo: config.repo,
		number: pr.number, 
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
		change_state: change_state,
		post_message: post_message,
		try_merge: try_merge,
	};
}
