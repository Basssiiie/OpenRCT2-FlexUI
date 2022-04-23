import { Store } from "./stores/store";



/**
 * Internally saved binding information.
 */
export class Binding<TTarget, TKey extends keyof TTarget, TValue>
{
	readonly unsubscribe: () => void;


	constructor(
		readonly id: string,
		readonly key: TKey,
		readonly store: Store<TValue>,
		readonly converter: ((value: TValue) => TTarget[TKey]) | undefined,
		callback: (value: TValue) => void
	){
		this.unsubscribe = store.subscribe(callback);
	}
}
