import { store } from "./createStore";
import { isStore } from "./isStore";
import { Store } from "./store";


/**
 * If the specified value is not a store yet, store it into a store.
 * If the value is already a store, return it.
 */
export function storify<T>(value: Store<T> | T): Store<T>
{
	return isStore(value) ? value : store(value);
}