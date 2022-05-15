const https = require("https")

function getHtml(url) {
	const req = https.get(url, (res) => {})

	req.on("error", (err) => {
		console.error("Request failed to get the page " + url)

		console.log(err)
	})
}
