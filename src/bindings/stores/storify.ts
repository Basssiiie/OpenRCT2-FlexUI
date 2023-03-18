import { store } from "./createStore";
import { isStore } from "./isStore";
import { WritableStore } from "./writableStore";


/**
 * If the specified value is not a store yet, store it into a store.
 * If the value is already a store, return it.
 */
export function storify<T>(value: WritableStore<T> | T): WritableStore<T>
{
	return isStore(value) ? value : store(value);
}