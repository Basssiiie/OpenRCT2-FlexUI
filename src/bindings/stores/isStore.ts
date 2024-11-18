import { isFunction, isObject } from "@src/utilities/type";
import { Store } from "./store";
import { WritableStore } from "./writableStore";


/**
 * Returns true if the target is a store or follows the store contract. Returns false if not.
 */
export function isStore(target: unknown): target is Store<unknown>
{
	if (!target || !isObject(target))
		return false;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
	return isFunction((<any>target).get) && isFunction((<any>target).subscribe);
}

/**
 * Returns true if the target is a writable store or follows the writable store contract. Returns false if not.
 */
export function isWritableStore(target: unknown): target is WritableStore<unknown>
{
	if (!target || !isObject(target))
		return false;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
	return isStore(target) && isFunction((<any>target).set);
}
