import { Binding } from "@src/bindings/binding";
import { Store } from "@src/bindings/stores/store";
import { Template } from "@src/building/template";
import { GenericBinder } from "./genericBinder";
import { WidgetBinder } from "./widgetBinder";


/**
 * Binder for OpenRCT2 windows.
 */
export class WindowBinder extends GenericBinder<Window | WindowDesc>
{
	readonly _widgets: WidgetBinder = new WidgetBinder();


	override _bind(template: Template): void
	{
		this._widgets._bind(template);

		const window = template._description;
		if (window)
		{
			this._refresh(window);
		}
		super._bind(template);
	}


	override _unbind(): void
	{
		this._widgets._unbind();
		super._unbind();
	}


	override _hasBindings(): boolean
	{
		return (this._widgets._hasBindings() || super._hasBindings());
	}


	protected override _createBinding<T extends Window | WindowDesc, K extends keyof T, V>(_target: T, property: K, store: Store<V>, converter: ((value: V) => T[K]) | undefined): Binding<T, K, V>
	{
		const callback = (value: V): void =>
		{
			const template = this._template;
			// Only update if window is open.
			if (!template || !template._window)
				return;

			this._apply(template._window, <keyof Window>property, value, <never>converter);
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