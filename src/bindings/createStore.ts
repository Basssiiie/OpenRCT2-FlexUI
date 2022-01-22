import { DefaultStore } from "./defaultStore";
import { Store } from "./store";


/**
 * Create a value that can be observed by the user interface for change detection.
 */
export function store<U>(): Store<U | undefined>;
export function store<T>(initialValue: T): Store<T>;
export function store<T>(initialValue?: T): Store<T | undefined>
{
	return new DefaultStore<T | undefined>(initialValue);
}