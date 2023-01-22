import { on } from "@src/bindings/stores/on";
import { BuildOutput } from "@src/building/buildOutput";
import { ParentControl } from "@src/building/parentControl";
import { WidgetMap } from "@src/building/widgets/widgetMap";
import { Rectangle } from "@src/positional/rectangle";
import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { ElementParams } from "../elementParams";
import { fillLayout } from "../layouts/fillLayout";
import { Positions } from "../layouts/positions";
import { VisualElement } from "./visualElement";


/**
 * Base control that takes care of the base widget properties.
 */
export abstract class Control<T extends WidgetBaseDesc> extends VisualElement implements WidgetBaseDesc
{
	name: string = identifier();
	type: T["type"];
	x: number = 0;
	y: number = 0;
	width: number = 0;
	height: number = 0;

	tooltip?: string;
	isDisabled?: boolean;
	isVisible?: boolean;


	constructor(type: T["type"], parent: ParentControl, output: BuildOutput, params: ElementParams & Positions)
	{
		super(parent, params);
		this.type = type;

		const binder = output.binder, visibility = params.visibility;
		binder.add(this, "tooltip", params.tooltip);
		binder.add(this, "isDisabled", params.disabled);
		binder.add(this, "isVisible", visibility, v => (v === "visible"));

		// Redraw UI if the visibility changes to and from "none"
		const context = output.context;
		on(visibility, v =>
		{
			const oldValue = this.skip;
			const newValue = (v === "none");
			this.skip = newValue;

			if (oldValue || newValue)
			{
				Log.debug("Control(", this.type, ":", this.name, "): skip changed from", oldValue, "to", newValue);
				parent.recalculate();
				context.redraw();
			}
		});

		output.add(this);
	}


	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		Log.debug("Control(", this.type, ":", this.name, ") layout() for area: [", area.x, ",", area.y, ",", area.width, ",", area.height, "]");
		fillLayout(widgets, this.name, area);
	}
}
