import { isFunction, isObject } from "@src/utilities/type";
import { WritableStore } from "./writableStore";
import { Store } from "./store";


/**
 * Returns true if the target is a store or follows the store contract. Returns false if not.
 */
export function isStore(target: unknown): target is Store<unknown>
{
	if (!target || !isObject(target))
		return false;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const any = <any>target;
	return isFunction(any.get) && isFunction(any.subscribe);
}

/**
 * Returns true if the target is a writable store or follows the writable store contract. Returns false if not.
 */
export function isWritableStore(target: unknown): target is WritableStore<unknown>
{
	if (!target || !isObject(target))
		return false;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return isStore(target) && isFunction((target as any).set);
}