var phases = {
	approved: require("./approved"),
	unreviewed: require("./unreviewed"),
	pending: require("./pending"),
	tested: require("./tested"),
};

phases.process = function(pr, cb) {
	phases[pr.process].process(pr, cb);
}

module.exports = phases;
