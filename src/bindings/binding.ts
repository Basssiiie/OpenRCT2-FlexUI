import { Store } from "./stores/store";



/**
 * Internally saved binding information.
 */
export class Binding<TTarget, TNested, TKey extends keyof TNested, TValue>
{
	readonly _unsubscribe: () => void;


	constructor(
		readonly _id: string,
		readonly _key: TKey,
		readonly _store: Store<TValue>,
		readonly _converter: ((value: TValue) => TNested[TKey]) | undefined,
		readonly _nested: ((target: TTarget) => TNested) | undefined,
		_callback: (value: TValue) => void
	){
		this._unsubscribe = _store.subscribe(_callback);
	}
}
