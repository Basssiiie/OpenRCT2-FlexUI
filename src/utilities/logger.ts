/* istanbul ignore file */

import * as Environment from "./environment";
import { isArray, isObject } from "./type";


/**
 * The available levels of logging.
 */
type LogLevel = "debug" | "warning" | "error";


/**
 * Prints a message with the specified logging and plugin identifier.
 */
function print(level: LogLevel, messages: unknown[]): void
{
	const message = messages
		// eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
		.map(v => (isArray(v) ? `[${v}]` : isObject(v) ? String(v) : v))
		.join(" ");

	console.log(`\x1b[95m<FUI/${level}>\x1b[37m ${message}`);
}


/**
 * Prints a debug message if the plugin is run in development mode.
 */
export function debug(...messages: unknown[]): void
{
	if (Environment.isDevelopment)
	{
		print("debug", messages);
	}
}


/**
 * Prints a warning message to the console.
 */
export function warning(...messages: unknown[]): void
{
	print("warning", messages);
}


/**
 * Throws an error with the specified message.
 */
export function error(message: string): never
{
	throw Error(message);
}


/**
 * Prints an error message to the console and an additional stacktrace
 * if the assert fails and the plugin is run in either development or testing mode.
 */
export function assert(condition: boolean | null | undefined, ...messages: unknown[]): void
{
	if (!Environment.isProduction && !condition)
	{
		error(`Assertion failed! ${messages.join(" ")}`);
	}
}


/**
 * Stringifies the object to json in a compact fashion, useful for logging.
 */
export function stringify(obj: unknown): string
{
	if (typeof obj !== "object" || obj === null)
		return JSON.stringify(obj);

	if (Array.isArray(obj))
		return `[${obj.map(stringify).join(", ")}]`;

	const pairs = [];
	for (const key in obj)
	{
		// @ts-expect-error key is fine for indexing object
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
		pairs.push(`${String(key)}: ${stringify(obj[key])}`);
	}
	return `{ ${pairs.join(", ")} }`;
}
