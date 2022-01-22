import { isFunction, isObject } from "@src/utilities/type";
import { DefaultStore } from "./defaultStore";
import { Store } from "./store";


/**
 * Returns true if the target is a store or follows the store contract. Returns false if not.
 */
export function isStore(target: unknown): target is Store<unknown>
{
	return (target instanceof DefaultStore || hasStoreContact(target));
}


function hasStoreContact(target: unknown): target is Store<unknown>
{
	if (!target || !isObject(target))
		return false;

	const record = <Record<string, unknown>>target;
	return isFunction(record["get"]) && isFunction(record["set"]) && isFunction(record["subscribe"]);
}