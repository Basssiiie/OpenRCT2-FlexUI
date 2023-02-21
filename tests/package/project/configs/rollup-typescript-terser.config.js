import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";


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
		typescript(),
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