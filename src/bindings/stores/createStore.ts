import { ArrayStore } from "./arrayStore";
import { DefaultArrayStore } from "./defaultArrayStore";
import { DefaultStore } from "./defaultStore";
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
	return new DefaultStore<T | undefined>(initialValue);
}



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
