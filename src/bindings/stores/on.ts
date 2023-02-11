import { isUndefined } from "@src/utilities/type";
import { Bindable } from "../bindable";
import { isStore } from "./isStore";
import { subscribe } from "./subscribe";


/**
 * Adds a callback that responds to the state of the bindable. The callback will be
 * applied immediately. If it's a store, it will subscribe and any future changes
 * will trigger the callback as well.
 */
export function on<T>(bindable: Bindable<T> | undefined, callback: (value: T) => void): void
{
	if (isStore(bindable))
	{
		subscribe(bindable, callback);
		callback(bindable.get());
	}
	else if (!isUndefined(bindable))
	{
		callback(bindable);
	}
}