import { Store } from "./stores/store";
import { subscribe } from "./stores/subscribe";



/**
 * Internally saved binding information.
 */
export class Binding<TTarget, TValue, TConverted>
{
	readonly _unsubscribe: () => void;


	constructor(
		readonly _id: string,
		readonly _key: string,
		readonly _store: Store<TValue>,
		readonly _converter: ((value: TValue) => TConverted) | undefined,
		readonly _setter: ((target: TTarget, key: string, value: TValue | TConverted) => void) | undefined,
		_callback: (value: TValue) => void
	){
		this._unsubscribe = subscribe(_store, _callback);
	}
}
