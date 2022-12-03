import { Binding } from "@src/bindings/binding";
import { Store } from "@src/bindings/stores/store";
import { BaseWindowControl } from "../baseWindowControl";
import { GenericBinder } from "./genericBinder";


/**
 * Binder for OpenRCT2 windows.
 */
export class WindowBinder extends GenericBinder<BaseWindowControl, Window | WindowDesc>
{
	/**
	 * Bind a window control to this binder.
	 */
	override _bind(control: BaseWindowControl): void
	{
		const window = control._description;
		if (window)
		{
			this._refresh(window);
		}
		this._source = control;
	}

	protected override _createBinding<T extends Window | WindowDesc, N, K extends keyof N, V>(_target: T, property: K, store: Store<V>, converter: ((value: V) => N[K]) | undefined, nested: ((target: T) => N) | undefined): Binding<T, N, K, V>
	{
		const callback = (value: V): void =>
		{
			const control = this._source;
			// Only update if window is open.
			if (!control || !control._window)
				return;

			this._apply(<T>control._window, property, value, <never>converter, nested);
		};
		return new Binding<T, N, K, V>("", property, store, converter, nested, callback);
	}


	/**
	 * Updates the window with the values in registered bindings.
	 */
	private _refresh(window: Window | WindowDesc): void
	{
		const bindings = this._bindings;
		if (bindings)
		{
			for (const binding of bindings)
			{
				this._apply(window, binding._key, binding._store.get(), binding._converter, binding._nested);
			}
		}
	}
}