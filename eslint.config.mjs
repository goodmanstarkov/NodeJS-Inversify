// @ts-check
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import nodePlugin from 'eslint-plugin-n'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'

export default defineConfig(
	{
		ignores: ['**/*', '!src/**'],
	},

	// Базовые конфиги
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	nodePlugin.configs['flat/recommended'],

	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node,
			},
		},
		plugins: {
			import: importPlugin,
			prettier: prettierPlugin,
		},
		rules: {
			// Must-have Node.js правила
			'n/no-path-concat': 'error',
			'n/handle-callback-err': ['error', '^(err|error)$'],
			'import/order': [
				'error',
				{
					// 1. Порядок групп (сверху вниз в файле)
					groups: [
						'builtin', // Node (path, fs, etc.)
						'external', // npm-пакеты
						'internal', // алиасы (@/, ~/, etc.)
						'parent', // ../
						'sibling', // ./
						'index', // ./index
						'type', // import type (если разделяете type-импорты)
					],

					// 2. Пустая строка между группами — стандарт в сообществе
					'newlines-between': 'always',

					// 3. Алфавит внутри каждой группы
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},

					// 4. Алиасы — в группу "internal", выше parent/sibling
					pathGroups: [
						{ pattern: '@/**', group: 'internal', position: 'before' },
						{ pattern: '~/**', group: 'internal', position: 'before' },
					],
					pathGroupsExcludedImportTypes: ['builtin'],

					// 5. Неизвестные импорты — в конец (например, типы в старых настройках)
					warnOnUnassignedImports: false,
				},
			],

			// TypeScript правила
			'@typescript-eslint/no-empty-object-type': 'warn',
			'@typescript-eslint/no-unused-vars': ['warn', { args: 'all', argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'warn',

			// Общие правила
			'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],

			'prettier/prettier': 'warn',
		},
		settings: {
			n: {
				tryExtensions: ['.ts', '.js', '.mjs', '.cjs', '.json', '.node'],
			},
		},
	},

	// Применяем Prettier в самом конце, чтобы он перекрыл конфликты
	prettierConfig,
)
