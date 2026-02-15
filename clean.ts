import * as fs from 'fs'
import * as path from 'path'

const dirs = ['node_modules', 'dist']

const removeDirs = (): void =>
	dirs
		.map((dir) => path.join(process.cwd(), dir))
		.forEach((dir) => fs.existsSync(dir) && fs.rmSync(dir, { recursive: true, force: true }))

removeDirs()
