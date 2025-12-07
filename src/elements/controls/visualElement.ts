import { Bindable } from "@src/bindings/bindable";
import { Binder } from "@src/bindings/binder";
import { store } from "@src/bindings/stores/createStore";
import { isStore } from "@src/bindings/stores/isStore";
import { WritableStore } from "@src/bindings/stores/writableStore";
import { Rectangle } from "@src/positional/rectangle";
import * as Log from "@src/utilities/logger";
import { FrameContext } from "@src/windows/frames/frameContext";
import { Layoutable } from "@src/windows/layoutable";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { ElementVisibility } from "../elementParams";


/**
 * Simple layoutable base class that stores information required for visualizing the control.
 */
export abstract class VisualElement implements Layoutable
{
	skip: Bindable<boolean>;

	constructor(context: FrameContext, binder: Binder<WidgetBaseDesc>, visibility: Bindable<ElementVisibility> | undefined)
	{
		const noneKey = "none";
		if (!isStore(visibility))
		{
			this.skip = (visibility === noneKey);
			return;
		}

		// Redraw UI if the visibility changes to and from "none"
		this.skip = store(false);
		binder.on(visibility, v =>
		{
			const oldValue = this.skip;
			const newValue = (v === noneKey);
			(<WritableStore<boolean>>this.skip).set(newValue);

			if (oldValue || newValue)
			{
				// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
				Log.debug("Visual element", (<any>this).name, "skip changed from", oldValue, "to", newValue);
				//parent.recalculate();
				context.redraw();
			}
		});
	}

	abstract layout(widgets: WidgetMap, area: Rectangle): void;
}
