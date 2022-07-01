const https = require("https")
const fs = require("fs")

let retries = 0

let objectIndex = 0
let urlIndex = 0

const fileArrayForDownload = [
	{
		directory: "carpeta de prueba",
		file_name: "serie de prueba",
		containing_page: "",
		format: "mp4",
		url_array: [
			"https://donadeshinobu.art/ani2/F/Fate%20-%20Stay%20Night%20-%20Unlimited%20Blade%20Works%20BD/[HanF]%20Fate%20-%20Stay%20Night%20-%20Unlimited%20Blade%20Works%20-%2000%20(BDRip%201920x1080%20H264%20AAC).mp4",
		],
	}
]

function formatFileName({ path, i, fileName, format }) {
	return `${path}/${i < 10 ? "0" + i : i} - ${fileName}.${format ? format : "mp4"}`
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

	const req = https.get(files.url_array[urlIndex], (res) => {
		const len = parseInt(res.headers["content-length"], 10)
		let cur = ""
		const total = len / 1048576 // amount of bytes in a mb

		if (total == "0.00" || isNaN(total)) {
			if (retries < 5) {
				retries++

				console.log(files.file_name + " - Retry Nº " + retries)

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
				fileName: files.file_name,
				format: files.format,
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

		if (retries < 5) {
			retries++

			console.log(files.file_name + " - Retry Nº " + retries)

			return downloadFile({ files }, callback)
		} else {
			console.error("The download keeps failing...")

			return
		}
	})
}

function updateIndexes(i) {
	retries = 0

	if (i <= fileArrayForDownload[objectIndex].url_array.length - 1) {
		urlIndex = i

		downloadAll()

		return
	} else {
		console.log(" ")
		console.log("- - - - - - - - - - - - - - - - - - - -")
		console.log("Continuing with the next Anime...")

		if (objectIndex + 1 <= fileArrayForDownload.length - 1) {
			objectIndex = objectIndex + 1
			urlIndex = 0

			downloadAll()

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
