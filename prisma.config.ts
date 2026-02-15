import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

const POSTGRES_USER = env('POSTGRES_USER')
const POSTGRES_PASSWORD = env('POSTGRES_PASSWORD')
const POSTGRES_HOST = env('POSTGRES_HOST')
const POSTGRES_PORT = env('POSTGRES_PORT')
const POSTGRES_DB = env('POSTGRES_DB')

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
	},
})
