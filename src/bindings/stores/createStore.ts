import { DefaultWritableStore } from "./defaultWritableStore";
import { WritableStore } from "./writableStore";


/**
 * Create a value that can be observed by the user interface for change detection.
 *
 * Tip: Stores work best if you only use them for binding a model to your user
 * interface, and nowhere else.
 */
export function store<U>(): WritableStore<U | undefined>;
export function store<T>(initialValue: T): WritableStore<T>;
export function store<T>(initialValue?: T): WritableStore<T | undefined>
{
	return new DefaultWritableStore<T | undefined>(initialValue);
}
