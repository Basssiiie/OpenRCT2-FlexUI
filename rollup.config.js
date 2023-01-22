/* eslint-disable @typescript-eslint/explicit-function-return-type */
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import { ScriptTarget } from "typescript";


const build = process.env.BUILD || "development";
const isDev = (build === "development");


/**
 * @param {{es5:boolean,minify:boolean}} options
 * @returns {import("rollup").Plugin[]}
 */
function getPlugins(options)
{
	const replacer = replace({
		include: "./src/utilities/environment.ts",
		preventAssignment: true,
		values: {
			__BUILD_CONFIGURATION__: JSON.stringify(build)
		}
	});
	const compiler = typescript({
		tsconfig: "./tsconfig.json",
		target: (options.es5) ? ScriptTarget.ES5 : ScriptTarget.ES2020
	});
	if (!options.minify)
	{
		return [ replacer, compiler ];
	}
	const minifier = terser({
		ecma: (options.es5) ? 5 : 2020,
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
		mangle: {
			properties: {
				regex: /^_/
			}
		},
		// Useful only for stacktraces:
		keep_fnames: isDev,
	});
	return [ replacer, compiler, minifier ];
}


/**
 * @type {import("rollup").RollupOptions}
 */
const config = [
	{
		// Regular ESNext build
		input: "./src/index.ts",
		output: [
			{
				file: "./dist/index.mjs",
				format: "esm",
			},
			{
				file: "./dist/index.js",
				format: "cjs",
			}
		],
		plugins: getPlugins({ es5: false, minify: false }),
	},
	{
		// Minified ESNext build
		input: "./src/index.ts",
		output: [
			{
				file: "./dist/index.min.mjs",
				format: "esm",
			},
			{
				file: "./dist/index.min.js",
				format: "cjs",
			}
		],
		plugins: getPlugins({ es5: false, minify: true })
	},
	{
		// Minified ES5 build
		input: "./src/index.ts",
		output: [
			{
				file: "./dist/index.es5.min.js",
				format: "cjs",
			}
		],
		plugins: getPlugins({ es5: true, minify: true })
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