import { isObject } from "@src/utilities/type";
import { isWritableStore } from "../stores/isStore";
import { TwoWayBindable } from "./twowayBindable";
import { TwoWayBinding } from "./twowayBinding";


/**
 * Returns true if the target is a two-way binding or follows the two-way binding contract. Returns false if not.
 */
export function isTwoWay<T>(target: TwoWayBindable<T> | undefined): target is TwoWayBinding<T>;
export function isTwoWay(target: unknown): target is TwoWayBinding<unknown>;
export function isTwoWay(target: unknown): target is TwoWayBinding<unknown>
{
	if (!target || !isObject(target))
		return false;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
	return isWritableStore((<any>target).twoway);
}
