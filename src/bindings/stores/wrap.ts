import { store } from "./createStore";
import { isStore } from "./isStore";
import { Store } from "./store";
import { subscribe } from "./subscribe";

/**
 * Creates a store for the specified value. If the value is a store already, a subscribed copy will be returned.
 * If the value is already a store, return it.
 */
export function wrap<T>(value: Store<T> | T): Store<T>
{
	if (isStore(value))
	{
		const copy = store(value.get());
		subscribe(value, v => copy.set(v));
		return copy;
	}
	return store(value);
}