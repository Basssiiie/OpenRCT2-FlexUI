import { isUndefined } from "@src/utilities/type";
import { Bindable } from "../bindable";
import { isStore } from "./isStore";


/**
 * Adds a callback that responds to the state of the bindable.
 * If it's a store, it will subscribe. If it's a constant, it will be immediately applied.
 */
export function on<T>(bindable: Bindable<T> | undefined, callback: (value: T) => void): void
{
	if (isStore(bindable))
	{
		bindable.subscribe(callback);
	}
	else if (!isUndefined(bindable))
	{
		// Write callback straight back to the widget template.
		callback(bindable);
	}
}