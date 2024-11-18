import { identifier } from "./identifier";


type AnyObject = Record<string, unknown>;

/**
 * Add a handler to trigger callbacks for when the setter is called.
 */
export function proxy<T, K extends keyof T>(obj: T, key: K, onSet: (value: T[K]) => void): void
{
	const proxyKey = `<${identifier()}>__${String(key)}`;
	(<AnyObject>obj)[proxyKey] = obj[key];

	Object.defineProperty(obj, key, {
		get: () => (<AnyObject>obj)[proxyKey],
		set: (v: T[K]) => { (<AnyObject>obj)[proxyKey] = v; onSet(v); }
	});
}
