import child_process from "child_process";
import util from "util";
import fs from "fs/promises";


const exec = util.promisify(child_process.exec);
const cache: Record<string, string> = {};


/**
 * Gets the path to the root of the integration test project.
 */
export const projectPath = "./tests/package/project";


/**
 * Run a specific rollup configuration on the integration test project.
 * @param config Name of the rollup script.
 */
export async function rollup(config: string): Promise<string>
{
	await exec(`rollup --config ./configs/${config}.config.js --environment OUTPUT:./dist/${config}.js`, { cwd: projectPath });
	return await getFile(config);
}


/**
 * Run a specific rollup configuration on the integration test project.
 * @param config Name of the babel script.
 */
export async function babel(config: string): Promise<string>
{
	await exec(`npx babel index.ts --config-file ./configs/${config}.config.js --out-file ./dist/${config}.js`, { cwd: projectPath });
	return await getFile(config);
}



/**
 * Gets the output file for the specified rollup configuration.
 * @param script Name of the script.
 * @returns The content of the file.
 */
export async function getFile(script: string): Promise<string>
{
	if (script in cache)
	{
		return cache[script];
	}

	const code = await fs.readFile(`${projectPath}/dist/${script}.js`, { encoding: 'utf8' });
	cache[script] = code;
	return code;
}