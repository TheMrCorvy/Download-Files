const https = require("https")
const fs = require("fs")

let retries = 0

let objectIndex = 0
let urlIndex = 0

const fileArrayForDownload = [
	{
		directory: "Akame Ga Kill",
		fileName: "Akame Ga Kill",
		url_array: ["https://dondon.media/wp-content/uploads/2022/04/episodes-akame-ga-kill.jpg"],
	},
	{
		directory: "To Aru Majutsu No Index/To Aru Majutsu No Index II/Ovas",
		fileName: "To Aru Majutsu No Index III",
		url_array: ["https://dondon.media/wp-content/uploads/2022/04/episodes-akame-ga-kill.jpg"],
	},
]

function formatFileName({ path, i, fileName }) {
	return `${path}/${i < 10 ? "0" + i : i} - ${fileName}.jpg`
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

function downloadFile({ files }, callback) {
	let lastProgress = 0

	console.log({
		files,
		urlIndex,
		objectIndex,
	})

	const req = https.get(files.url_array[urlIndex], (res) => {
		const len = parseInt(res.headers["content-length"], 10)
		let cur = ""
		const total = len / 1048576

		if (total == "0.00" || isNaN(total)) {
			if (retries < 3) {
				retries++

				console.log(files.fileName + " - Retry Nº " + retries)

				return downloadFile({ files }, callback)
			} else {
				console.error("The download keeps failing...")

				return
			}
		}

		console.log("Download Started! Total Size: " + total.toFixed(2) + "mb")

		if (!fs.existsSync(files.directory)) {
			createDirectory(files.directory)
		}

		const fileStream = fs.createWriteStream(
			formatFileName({
				path: files.directory,
				i: urlIndex + 1,
				fileName: files.fileName,
			})
		)

		fileStream.on("error", (err) => {
			console.log(err)

			console.error("There was an error writting the file...")
		})

		res.pipe(fileStream)

		res.on("data", (chunk) => {
			cur += chunk

			const downloadedAmount = ((100.0 * cur.length) / len).toFixed(2)

			if (downloadedAmount % 10 === 0 && downloadedAmount !== lastProgress) {
				console.log(downloadedAmount + "%")

				lastProgress = downloadedAmount
			}
		})

		res.on("end", () => console.log("Download Complete!"))

		fileStream.on("finish", () => {
			fileStream.close()

			console.log("Finished writting document!")
		})

		fileStream.on("close", () => callback(urlIndex + 1))
	})

	req.on("error", (err) => {
		console.log(err)

		console.error("There was an error doing the request...")

		if (retries < 3) {
			retries++

			console.log(files.fileName + " - Retry Nº " + retries)

			return downloadFile({ files }, callback)
		} else {
			console.error("The download keeps failing...")

			return
		}
	})
}

function updateIndexes(i) {
	if (i <= fileArrayForDownload[objectIndex].url_array.length) {
		urlIndex = i

		console.log(fileArrayForDownload)

		downloadAll(
			{
				files: fileArrayForDownload[objectIndex],
			},
			updateIndexes
		)

		return
	} else {
		console.log(" ")
		console.log("- - - - - - - - - - - - - - - - - - - -")
		console.log("Continuing with the next Anime...")

		if (objectIndex + 1 <= files.length) {
			objectIndex = objectIndex + 1
			urlIndex = 0

			downloadAll(
				{
					files: fileArrayForDownload[objectIndex],
				},
				updateIndexes
			)

			return
		}
	}

	console.log(" ")
	console.log("- - - - - - - - - - - - - - - - - - - -")
	console.log("FINISHED ALL DOWNLOADS!!")
	console.log(" ")
	console.log("Daru: Mission Complete!!")
}

function downloadAll() {
	downloadFile(
		{
			files: fileArrayForDownload[objectIndex],
		},
		updateIndexes
	)
}

downloadAll()
