import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { FrameControl } from "../frames/frameControl";
import { GenericBinder } from "./genericBinder";


/**
 * Helper that can bind a store from a viewmodel to a widget inside a window.
 */
export class WidgetBinder extends GenericBinder<FrameControl, Widget | WidgetBaseDesc>
{
	/**
	 * Bind a source frame to this binder and specify which set of widgets to refresh.
	 */
	override _bind(frame: FrameControl): void
	{
		const bindings = this._bindings;
		for (const binding of bindings)
		{
			binding._bind(frame);
		}
		this._source = frame;
	}


	/**
	 * Add a binding between a store and a widget's property. An optional converter can be
	 * supplied if the value needs to be converted from an internal value to a different visual
	 * representation of it.
	 */
	protected override _getBindTarget<T extends Widget | WidgetBaseDesc>(target: T): (source: FrameControl) => T | null
	{
		// Ensure the target widget always has a name.
		const targetName = (target.name ||= identifier()); // todo does this assign now execute too late?

		return (source: FrameControl): T | null =>
		{
			Log.assert(source.isOpen(), "WidgetBinder: widget", targetName, "not active and cannot be updated");

			const widget = source.getWidget(targetName);
			Log.assert(!!widget, "WidgetBinder: widget", targetName, "not found on window for updating property");
			return <T>widget;
		};
	}
}
