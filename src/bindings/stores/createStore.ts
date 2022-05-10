import { ArrayStore } from "./arrayStore";
import { DefaultArrayStore } from "./defaultArrayStore";
import { DefaultStore } from "./defaultStore";
import { Store } from "./store";


/**
 * Create a value that can be observed by the user interface for change detection.
 *
 * Tip: Stores work best if you only use them for binding a model to your user
 * interface, and nowhere else.
 */
export function store<U>(): Store<U | undefined>;
export function store<T>(initialValue: T): Store<T>;
export function store<T>(initialValue?: T): Store<T | undefined>
{
	return new DefaultStore<T | undefined>(initialValue);
}



/**
 * Create an array that can be observed by the user interface for modifications.
 *
 * Tip: Stores work best if you only use them for binding a model to your user
 * interface, and nowhere else.
 */
export function arrayStore<U extends []>(): ArrayStore<U | undefined>;
export function arrayStore<T extends []>(initialValue: T): ArrayStore<T>;
export function arrayStore<T extends []>(initialValue?: T): ArrayStore<T | undefined>
{
	return new DefaultArrayStore<T | undefined>(initialValue || []);
}
