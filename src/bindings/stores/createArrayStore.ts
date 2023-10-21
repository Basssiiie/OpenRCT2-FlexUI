import { ArrayStore } from "./arrayStore";
import { DefaultArrayStore } from "./defaultArrayStore";


/**
 * Create an array that can be observed by the user interface for modifications.
 *
 * Tip: Stores work best if you only use them for binding a model to your user
 * interface, and nowhere else.
 */
export function arrayStore<T>(): ArrayStore<T>;
export function arrayStore<T>(initialValue: T[]): ArrayStore<T>;
export function arrayStore<T>(initialValue?: T[]): ArrayStore<T>
{
	return new DefaultArrayStore<T>(initialValue || []);
}
