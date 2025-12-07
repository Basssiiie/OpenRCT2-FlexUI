import { noop } from "@src/utilities/noop";
import { Store } from "./stores/store";
import { subscribe } from "./stores/subscribe";


/**
 * Internally saved binding information.
 */
export class Binding<TValue, TSource = unknown, TTarget = unknown>
{
	private _unsubscribe: () => void = noop;

	constructor(
		private readonly _store: Store<TValue>,
		private readonly _callback: (target: TTarget | undefined, value: TValue, isStore: boolean) => void,
		private readonly _getTarget?: (source: TSource) => TTarget | null
	)
	{
	}

	_bind(source: TSource)
	{
		const store = this._store;
		const getTarget = this._getTarget;
		const target = source && getTarget ? (getTarget(source) || undefined) : undefined;
		this._callback(target, store.get(), true);
		this._unsubscribe = subscribe(store, value =>
		{
			this._callback(target, value, true);
		});
	}

	_unbind()
	{
		this._unsubscribe();
		this._unsubscribe = noop;
	}
}
