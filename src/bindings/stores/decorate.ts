import { DefaultStoreDecorator } from "./defaultStoreDecorator";
import { Store } from "./store";


/**
 * Decorates an existing store to change its setter behaviour. When the inner store is
 * updated, the decorator will be called through the `updater` callback. The decorator
 * can then decide whether it should update itself or not, and with what value. If the
 * setter is called, subscribers of the decorator will then be informed with the new
 * value.
 */
export function decorate<T>(store: Store<T>, updater: (value: T, set: (value: T) => void) => void): Store<T>
{
	return new DefaultStoreDecorator(store, updater);
}