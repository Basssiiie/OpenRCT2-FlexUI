import { Bindable } from "../bindable";
import { isStore } from "./isStore";


/**
 * Reads the value of a bindable property.
 * @param bindable A property that is bindable.
 * @returns If the bindable is a store, it returns the stored value. If it's a
 * regular value, that value will be returned as is.
 */
export function read<T>(bindable: Bindable<T>): T
{
	return (isStore(bindable) ? bindable.get() : bindable);
}