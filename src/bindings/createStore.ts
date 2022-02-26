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