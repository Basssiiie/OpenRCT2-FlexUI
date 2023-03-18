import { Store } from "./stores/store";
import { subscribe } from "./stores/subscribe";


/**
 * Internally saved binding information.
 */
export class Binding<TTarget, TValue>
{
	readonly _unsubscribe: () => void;

	constructor(
		readonly _id: string,
		readonly _store: Store<TValue>,
		readonly _callback: (target: TTarget, value: TValue) => void,
		_apply: (value: TValue) => void
	){
		this._unsubscribe = subscribe(_store, _apply);
	}
}
