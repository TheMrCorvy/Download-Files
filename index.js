const https = require("https")
const fs = require("fs")

let retries = 0

const files = [
	{
		directory: "Kaguya-Sama",
		fileName: "Kaguya-Sama",
		url_array: [
			"https://descarga-directa.fukou-da.net/0:/Anime/K/Kaguya-sama%20wa%20Kokurasetai%20S2%20BD/[HanF]%20Kaguya-sama%20wa%20Kokurasetai%20S2%20-%2008%20(BDRip%201920x1080%20H264%20AAC).mp4",
		],
		format: "mp4",
	},
	{
		directory: "To Aru Majutsu No Index/To Aru Majutsu No Index II/Ovas",
		fileName: "To Aru Majutsu No Index III",
		url_array: ["https://dondon.media/wp-content/uploads/2022/04/episodes-akame-ga-kill.jpg"],
		format: "jpg",
	},
]

function formatFileName({ path, i, fileName, format }) {
	return `${path}/${i < 10 ? "0" + i : i} - ${fileName}.${format}`
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

function downloadFile({ files, index, format }, callback) {
	let lastProgress = 0

	const req = https.get(files.url_array[0], (res) => {
		const len = parseInt(res.headers["content-length"], 10)
		let cur = ""
		const total = len / 1048576

		if (total == "0.00" || isNaN(total)) {
			if (retries < 3) {
				retries++

				console.log("Retry Nº " + retries)

				return downloadFile({ files, index, format }, callback)
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
			formatFileName({ path: files.directory, i: index, fileName: files.fileName, format })
		)

		fileStream.on("error", (err) => {
			console.log(err)

			console.error("There was an error writting the file...")
		})

		res.pipe(fileStream)

		res.on("data", (chunk) => {
			cur += chunk

			const downloadedAmount = ((100.0 * cur.length) / len).toFixed(2)

			if (downloadedAmount % 5 === 0 && downloadedAmount !== lastProgress) {
				console.log(downloadedAmount + "%")

				lastProgress = downloadedAmount
			}
		})

		res.on("end", () => console.log("Download Complete!"))

		fileStream.on("finish", () => {
			fileStream.close()

			console.log("Finished writting document!")
		})

		fileStream.on("close", () => callback(index))
	})

	req.on("error", (err) => {
		console.log(err)

		console.error("There was an error doing the request...")
	})
}

downloadFile(
	{
		files: files[0],
		index: 1,
		format: files[0].format,
	},
	(i) => console.log(i)
)
