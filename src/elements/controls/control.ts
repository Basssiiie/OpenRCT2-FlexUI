import { Rectangle } from "@src/positional/rectangle";
import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { BuildOutput } from "@src/windows/buildOutput";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { ElementParams } from "../elementParams";
import { fillLayout } from "../layouts/fillLayout";
import { VisualElement } from "./visualElement";


/**
 * Base control that takes care of the base widget properties.
 */
export abstract class Control<W extends WidgetBaseDesc, Positioning> extends VisualElement implements WidgetBaseDesc
{
	name: string = identifier();
	type: W["type"];
	x: number;
	y: number;
	width: number;
	height: number;

	tooltip?: string;
	isDisabled?: boolean;
	isVisible?: boolean;

	// skip?: Bindable<boolean>;
	// _parent: ParentControl;

	constructor(type: W["type"], output: BuildOutput, params: ElementParams & Positioning)
	{
		const { binder, context } = output;
		const visibility = params.visibility;

		super(context, binder, visibility);
		this.type = type;
		this.x = this.y = this.width = this.height = 0;

		binder.add(this, "tooltip", params.tooltip);
		binder.add(this, "isDisabled", params.disabled);
		binder.add(this, "isVisible", visibility, v => (v === "visible"));

		output.add(this);
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		Log.debug("Control(", this.type, ":", this.name, ") layout() for area:", Log.stringify(area));
		fillLayout(area, widgets, this.name);
	}
}
