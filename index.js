const https = require("https")
const fs = require("fs")
const path = require("path")

const https = require("https")
const fs = require("fs")
const path = require("path")

const files = [
	{
		directory: "To Aru Majutsu No Index/To Aru Majutsu No Index II",
		fileName: "To Aru Majutsu No Index III",
		url_array: ["https://dondon.media/wp-content/uploads/2022/04/episodes-akame-ga-kill.jpg"],
	},
	{
		directory: "To Aru Majutsu No Index/To Aru Majutsu No Index II/Ovas",
		fileName: "To Aru Majutsu No Index III",
		url_array: ["https://dondon.media/wp-content/uploads/2022/04/episodes-akame-ga-kill.jpg"],
	},
]

function formatFileName({ path, index, fileName, format }) {
	//	   path of file		numer of file in array			video 1     mp4
	return `${path}/${index < 10 ? "0" + index : index} - ${fileName}.${format}`
}

function downloadFile({ files, index, format, callback }) {
	https.get(files.url_array[0], (res) => {
		if (!fs.existsSync(files.directory)) {
			createDirectory(files.directory)
		}

		const fileStream = fs.createWriteStream(
			formatFileName({ path: files.directory, index, fileName: files.fileName, format })
		)
		res.pipe(fileStream)

		fileStream.on("finish", () => {
			fileStream.close()
			console.log("Finished!")
		})
	})
}

downloadFile({ files: files[1], index: 1, format: "jpg" })
