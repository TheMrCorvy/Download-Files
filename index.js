const https = require("https")
const fs = require("fs")

let retries = 0

let objectIndex = 0
let urlIndex = 0

const fileArrayForDownload = [
	{
		directory: "Akame Ga Kill",
		file_name: "Akame Ga Kill",
		containing_page: "",
		format: "mp4",
		url_array: [
			"https://descarga-directa.fukou-da.net/0:/Anime/A/Akame%20ga%20Kill!%20/[WZF]Akame_ga_Kill!_-_Capitulo_01[HD][X264-AAC][1280X720][Sub_Esp].mp4",
		],
	},
	{
		directory: "Bakuman!/Bakuman! I",
		file_name: "Bakuman!",
		containing_page: "",
		format: "mp4",
		url_array: [],
	},
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
	if (i <= fileArrayForDownload[objectIndex].url_array.length - 1) {
		urlIndex = i

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

		if (objectIndex + 1 <= fileArrayForDownload.length - 1) {
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
