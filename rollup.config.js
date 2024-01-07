/* @ts-check */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";


const build = process.env.BUILD || "development";
const isDev = (build === "development");


/**
 * Builds a cache of all properties that should be mangled.
 * @param {Record<string, string>} cache
 * @returns {import("rollup").Plugin}
 */
function precache(cache)
{
	const leading = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";
    const all = (leading+"0123456789");
	let mangleId = 0;

	function getName(index)
	{
		let result = leading[index % leading.length];
		index = Math.floor(index / leading.length) - 1;
		while (index >= 0)
		{
			result += all[index % all.length];
			index = Math.floor(index / all.length) - 1;
		}
		return result;
	}

	return {
		name: "Prepare property mangle cache",
		renderChunk(code)
		{
			[...code.matchAll(/(?:\.prototype|this)\.(_[\w\d]+)\s*=/g)]
				.map(m => `$${m[1]}`)
				.filter(m => !(m in cache))
				.forEach(m => cache[m] = getName(mangleId++));
		}
	};
}

// Cache for mangled property names
const cache = {
	props: { props: {} }
};


/**
 * @type {(import("rollup").RollupOptions)[]}
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
				entryFileNames: "[name].mjs",
				preserveModules: true
			},
			{
				file: "./dist/index.min.js",
				format: "cjs"
			}
		],
		plugins: [
			replace({
				preventAssignment: true,
				values: {
					__BUILD_CONFIGURATION__: JSON.stringify(build),
					...(isDev ? {} : { "Log.debug": "//" })
				}
			}),
			typescript(),
			precache(cache.props.props),
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
				mangle: isDev ? {} : {
					cache: false,
					properties: {
						regex: /^_/
					},
				},
				nameCache: cache,

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
			format: "esm"
		},
		plugins: [
			dts({
				tsconfig: "./tsconfig.json",
				compilerOptions: {
					declaration: true,
					declarationDir: "./@types",
					emitDeclarationOnly: true,
					target: "ESNext"
				},
				exclude: [
					"./src/**/*.d.ts",
					"./tests/**/*"
				]
			})
		]
	}
];
export default config;
