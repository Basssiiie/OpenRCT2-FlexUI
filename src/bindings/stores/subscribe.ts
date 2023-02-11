import { Store } from "./store";

/**
 * Shorthand for `store.subscribe()` that can be minified.
 */
export function subscribe<T>(store: Store<T>, callback: (value: T) => void): () => void
{
	return store.subscribe(callback);
}