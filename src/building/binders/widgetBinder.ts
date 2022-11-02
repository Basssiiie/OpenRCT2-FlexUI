import { Binding } from "@src/bindings/binding";
import { Store } from "@src/bindings/stores/store";
import { Template } from "@src/building/template";
import { WidgetMap } from "@src/building/widgets/widgetMap";
import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { GenericBinder } from "./genericBinder";


/**
 * Helper that can bind a store from a viewmodel to a widget inside a window.
 */
export class WidgetBinder extends GenericBinder<WidgetBase>
{
	override _bind(template: Template): void
	{
		const widgets = template._templateWidgets;
		if (widgets)
		{
			// Update the template widgets always before the window opens.
			this._refresh(widgets);
		}
		super._bind(template);
	}


	/**
	 * Add a binding between a store and a widget's property. An optional converter can be
	 * supplied if the value needs to be converted from an internal value to a different visual
	 * representation of it.
	 */
	protected override _createBinding<T extends WidgetBase, K extends keyof T, V>(target: T, property: K, store: Store<V>, converter: ((value: V) => T[K]) | undefined): Binding<T, K, V>
	{
		// Ensure the target widget always has a name.
		const targetName = (target.name ||= identifier());

		const callback = (value: V): void =>
		{
			const template = this._template;
			// Only update if window is open.
			if (!template || !template._window)
				return;

			const editor = template.getWidget<T>(targetName);
			if (!editor)
			{
				Log.debug(`Binder: widget '${targetName}' not found on window for updating property '${String(property)}' with value '${value}'.`);
				return;
			}
			editor.set(property, this._convert(value, converter));
		};
		return new Binding<T, K, V>(targetName, property, store, converter, callback);
	}


	/**
	 * Updates all widgets with the values in registered bindings.
	 */
	private _refresh(widgets: WidgetMap): void
	{
		const bindings = this._bindings;
		if (bindings)
		{
			for (const binding of bindings)
			{
				this._apply(widgets[binding.id], binding.key, binding.store.get(), binding.converter);
			}
		}
	}
}
