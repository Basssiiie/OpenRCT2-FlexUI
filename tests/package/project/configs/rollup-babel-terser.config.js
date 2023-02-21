import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import babel from "@rollup/plugin-babel";


/**
 * @type {import("rollup").RollupOptions}
 */
const config = {
	input: "./index.ts",
	output: {
		file: process.env.OUTPUT || Error("No output path specified"),
		format: "iife"
	},
	plugins: [
		resolve(),
		babel({
			babelrc: false,
			presets: [
				"@babel/preset-env",
				["@babel/preset-typescript", { optimizeConstEnums: true }]
			]
		}),
		terser({
			compress: {
				passes: 5,
				toplevel: true,
				unsafe: true
			},
			mangle: {
				properties: {
					regex: /^_/
				}
			},
		})
	],
	treeshake: "smallest"
};
export default config;