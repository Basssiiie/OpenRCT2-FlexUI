import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { WidgetMap } from "@src/core/widgetMap";
import { applyPadding } from "@src/layouts/flexibleLayout";
import { Layoutable } from "@src/layouts/layoutable";
import { Bindable } from "@src/observables/bindable";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Positions } from "@src/positional/positions";
import { Rectangle } from "@src/positional/rectangle";
import { Control } from "./control";
import { ElementParams } from "./element";


export type BoxParams = WidgetCreator<FlexiblePosition> | (ElementParams &
{
	/**
	 * The content to show within the box.
	 */
	content: WidgetCreator<FlexiblePosition>;

	/**
	 * An optionel label to show at the top of the box.
	 */
	text?: Bindable<string>;
});


/**
 * Create a visual box for grouping one or widgets with the specified parameters.
 */
export function box(params: BoxParams & Positions): WidgetCreator<BoxParams & Positions>
{
	return {
		params: params,
		create: (output: BuildOutput): BoxControl => new BoxControl(output, params)
	};
}


/**
 * A controller class for a groupbox widget.
 */
class BoxControl extends Control<GroupBoxWidget> implements GroupBoxWidget
{
	params: FlexiblePosition;
	child: Layoutable;
	text?: string;

	constructor(output: BuildOutput, params: BoxParams)
	{
		const type = "groupbox";
		let content: WidgetCreator<FlexiblePosition>;
		if ("create" in params)
		{
			// flat params, just a creator
			super(type, output, {});
			content = params;
		}
		else
		{
			// complex params object
			super(type, output, params);
			content = params.content;

			const binder = output.binder;
			binder.add(this, "text", params.text);
		}

		this.params = content.params;
		this.child = content.create(output);
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		const padding = this.params.padding;
		if (padding)
		{
			applyPadding(area, padding);
		}
		this.child.layout(widgets, area);
	}
}
