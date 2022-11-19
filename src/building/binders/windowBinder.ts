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

	protected override _createBinding<T extends Window | WindowDesc, K extends keyof T, V>(_target: T, property: K, store: Store<V>, converter: ((value: V) => T[K]) | undefined): Binding<T, K, V>
	{
		const callback = (value: V): void =>
		{
			const control = this._source;
			// Only update if window is open.
			if (!control || !control._window)
				return;

			this._apply(control._window, <keyof Window>property, value, <never>converter);
		};
		return new Binding<T, K, V>("", property, store, converter, callback);
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
				this._apply(window, binding.key, binding.store.get(), binding.converter);
			}
		}
	}
}