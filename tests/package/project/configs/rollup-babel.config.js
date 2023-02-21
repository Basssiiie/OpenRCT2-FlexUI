import resolve from "@rollup/plugin-node-resolve";
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
		})
	],
	treeshake: "smallest"
};
export default config;