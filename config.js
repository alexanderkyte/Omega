module.exports = {
	interval: 180,
	auth: {
		type: "token",
		token: process.env["GITHUB_TOKEN"]
	},
	user: process.env["GITHUB_USER"],
	repo: process.env["GITHUB_REPO"],
	merge_label: "merge approved",
	jenkins_done_status: {
		name: "Jenkins PR test",
		state: "success"
	},
	process_n_new: 1000
}
