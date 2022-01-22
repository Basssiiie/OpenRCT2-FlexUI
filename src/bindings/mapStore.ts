import { DefaultStore } from "./defaultStore";
import { Store } from "./store";


/**
 * Creates a new store based on the current store that will dispatch notifications
 * as a one-way binding when the parent value has changed.
 */
export function map<T, U>(store: Store<T>, callback: (value: T) => U): Store<U>
{
	const dependant = new DefaultStore(callback(store.get()));
	store.subscribe(v =>
	{
		return dependant.set(callback(v));
	});
	return dependant;
}