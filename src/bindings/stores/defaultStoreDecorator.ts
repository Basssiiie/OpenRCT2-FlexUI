import { DefaultStore } from "./defaultStore";
import { Store } from "./store";


/**
 * Default implementation of a store that decorates another store.
 */
export class DefaultStoreDecorator<T> extends DefaultStore<T>
{
	constructor(
		private _store: Store<T>,
		private _updater: (value: T, set: (value: T) => void) => void
	){
		super(_store.get());
		_store.subscribe(v => this._updater(v, p => super.set(p)));
	}

	override set(value: T): void
	{
		this._store.set(value);
	}
}