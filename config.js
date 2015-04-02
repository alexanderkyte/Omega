module.exports = {
	interval: 180,
	auth: {
		type: "token",
		token: process.env["GITHUB_TOKEN"]
	},
	user: process.env["GITHUB_USER"],
	repo: process.env["GITHUB_REPO"],
}
