/// <reference path="../../lib/duktape.d.ts" />
/* istanbul ignore file */

import * as Environment from "./environment";
import { isArray, isObject } from "./type";


/**
 * The available levels of logging.
 */
type LogLevel = "debug" | "warning" | "error";


/**
 * Returns true if Duktape is available, or false if not.
 */
const isDuktapeAvailable = (typeof Duktape !== "undefined");


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
 * Returns the current call stack as a string.
 */
function stacktrace(): string
{
	if (!isDuktapeAvailable)
	{
		return "  (stacktrace unavailable)\r\n";
	}

	const depth = -4; // skips act(), stacktrace() and the calling method.
	let entry: DukStackEntry | undefined, result = "";

	for (let i = depth; (entry = Duktape.act(i)); i--)
	{
		const functionName = entry.function.name;
		const prettyName = functionName
			? (functionName + "()")
			: "<anonymous>";

		result += `   -> ${prettyName}: line ${entry.lineNumber}\r\n`;
	}
	return result;
}


/**
 * Enable stack-traces on errors in development mode.
 */
if (Environment.isDevelopment && isDuktapeAvailable)
{
	Duktape.errCreate = function onError(error): Error
	{
		error.message += `\r\n${stacktrace()}`;
		return error;
	};
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
 * Prints an error message to the console and an additional stacktrace
 * if the plugin is run in development mode.
 */

export function error(...messages: unknown[]): void
{
	if (Environment.isDevelopment)
	{
		messages.push(`\r\n${stacktrace()}`);
	}
	print("error", messages);
}


/**
 * Throws an error with the specified message.
 */
export function thrown(message: string): never
{
	throw Error(message);
}


/**
 * Prints an error message to the console and an additional stacktrace
 * if the assert fails and the plugin is run in development mode.
 */
export function assert(condition: boolean, ...messages: unknown[]): void
{
	if (Environment.isDevelopment && !condition)
	{
		thrown(`Assertion failed! ${messages.join(" ")}`);
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
		pairs.push(`${String(key)}: ${stringify(obj[key])}`);
	}
	return `{ ${pairs.join(", ")} }`;
}


/**
 * Returns the current time on milliseconds, including fractions. Useful for performance timing.
 */
export function time(): number
{
	if (Environment.isDevelopment)
	{
		return performance.now();
	}
	return 0;
}
