const https = require("https")
const fs = require("fs")

const files = [
	{
		directory: "To Aru Majutsu No Index/To Aru Majutsu No Index II",
		fileName: "To Aru Majutsu No Index III",
		url_array: ["https://dondon.media/wp-content/uploads/2022/04/episodes-akame-ga-kill.jpg"],
		format: "jpg",
	},
	{
		directory: "To Aru Majutsu No Index/To Aru Majutsu No Index II/Ovas",
		fileName: "To Aru Majutsu No Index III",
		url_array: ["https://dondon.media/wp-content/uploads/2022/04/episodes-akame-ga-kill.jpg"],
		format: "jpg",
	},
]

function formatFileName({ path, index, fileName, format }) {
	//path of the file		numer of file in array			video 1     mp4
	return `${path}/${index < 10 ? "0" + index : index} - ${fileName}.${format}`
}

function createDirectory(directory) {
	const arrDir = directory.split("/")

	let directoriesCreated = "./"

	arrDir.forEach((dir) => {
		if (!fs.existsSync(directoriesCreated + dir)) {
			fs.mkdirSync(directoriesCreated + dir)

			directoriesCreated = directoriesCreated + dir + "/"

			console.log(`Folder ${dir} created!`)
		}
	})
}

function downloadFile({ files, index, format, callback }) {
	const req = https.get(files.url_array[0], (res) => {
		if (!fs.existsSync(files.directory)) {
			createDirectory(files.directory)
		}

		const fileStream = fs.createWriteStream(
			formatFileName({ path: files.directory, index, fileName: files.fileName, format })
		)

		fileStream.on("error", (err) => {
			console.log(err)

			console.error("There was an error writting the file...")
		})

		res.pipe(fileStream)

		fileStream.on("finish", () => {
			fileStream.close()
			console.log("Finished!")
		})
	})

	req.on("error", (err) => {
		console.log(err)

		console.error("There was an error doing the request...")
	})
}

downloadFile({ files: files[1], index: 1, format: files[1].format })
