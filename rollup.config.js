import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";


const build = process.env.BUILD || "development";
const isDev = (build === "development");


/**
 * @type {import("rollup").RollupOptions}
 */
const config = [
	{
		// Regular ESNext build
		input: "./src/index.ts",
		output: [
			{
				dir: "./dist/esm",
				format: "esm",
				exports: "named",
				preserveModules: true
			},
			{
				file: "./dist/index.min.js",
				format: "cjs"
			}
		],
		plugins: [
			replace({
				include: "./src/utilities/environment.ts",
				preventAssignment: true,
				values: {
					__BUILD_CONFIGURATION__: JSON.stringify(build)
				}
			}),
			typescript({
				tsconfig: "./tsconfig.json",
				include: [
					"./lib/**/*.ts",
					"./src/**/*.ts"
				]
			}),
			terser({
				compress: {
					passes: 5,
					unsafe: true
				},
				format: {
					comments: false,
					quote_style: 1,
					wrap_iife: false,
					preamble: "// Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI",

					beautify: isDev,
				},
				// Useful only for stacktraces:
				keep_fnames: isDev,
			})
		]
	},
	{
		// Declaration file packaging
		input: "./src/index.ts",
		output: {
			file: "./dist/index.d.ts",
		},
		plugins: [
			typescript({ tsconfig: "./tsconfig.dts.json" }),
			dts()
		]
	}
];
export default config;