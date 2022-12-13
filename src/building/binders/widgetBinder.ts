import { Binding } from "@src/bindings/binding";
import { Store } from "@src/bindings/stores/store";
import { WidgetMap } from "@src/building/widgets/widgetMap";
import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { FrameControl } from "../frames/frameControl";
import { GenericBinder } from "./genericBinder";


/**
 * Helper that can bind a store from a viewmodel to a widget inside a window.
 */
export class WidgetBinder extends GenericBinder<FrameControl, WidgetBaseDesc>
{
	/**
	 * Bind a source frame to this binder and specify which set of widgets to refresh.
	 */
	override _bind(frame: FrameControl): void
	{
		const widgets = frame._activeWidgets;
		if (widgets)
		{
			// Update the active widgets when the frame opens
			this._refresh(widgets);
		}
		this._source = frame;
	}


	/**
	 * Add a binding between a store and a widget's property. An optional converter can be
	 * supplied if the value needs to be converted from an internal value to a different visual
	 * representation of it.
	 */
	protected override _createBinding<T extends WidgetBaseDesc, V, C>(target: T, property: string, store: Store<V>, converter: ((value: V) => C) | undefined, setter: ((target: T, key: string, value: V | C) => void) | undefined): Binding<T, V, C>
	{
		// Ensure the target widget always has a name.
		const targetName = (target.name ||= identifier());

		const callback = (value: V): void =>
		{
			const source = this._source;
			// Only update if source frame is active.
			if (!source || !source.isOpen())
			{
				Log.debug(`WidgetBinder: widget '${targetName}' not active, thus not updated '${String(property)}' with value '${value}'.`);
				return;
			}

			const widget = source.getWidget(targetName);
			if (!widget)
			{
				Log.debug(`WidgetBinder: widget '${targetName}' not found on window for updating property '${String(property)}' with value '${value}'.`);
				return;
			}

			this._apply(<never>widget, property, value, converter, setter);
		};
		return new Binding<T, V, C>(targetName, property, store, converter, setter, callback);
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
				this._apply(widgets[binding._id], binding._key, binding._store.get(), binding._converter, binding._setter);
			}
		}
	}
}
