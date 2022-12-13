/* eslint-disable @typescript-eslint/no-explicit-any */
import { identifier } from "./identifier";


/**
 * Add a handler
 */
export function proxy<T, K extends keyof T>(obj: T, key: K, onSet: (value: T[K]) => void): void
{
	const proxyKey = `<${identifier()}>__${String(key)}`;
	(<any>obj)[proxyKey] = obj[key];

	Object.defineProperty(obj, key, {
		get: () => (<any>obj)[proxyKey],
		set: (v) => { (<any>obj)[proxyKey] = v; onSet(v); }
	});
}