import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { WidgetMap } from "@src/core/widgetMap";
import { applyPadding } from "@src/layouts/flexibleLayout";
import { Layoutable } from "@src/layouts/layoutable";
import { Bindable } from "@src/observables/bindable";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Padding } from "@src/positional/padding";
import { Positions } from "@src/positional/positions";
import { Rectangle } from "@src/positional/rectangle";
import { Control } from "./control";
import { ElementParams } from "./element";


export type BoxContainer = WidgetCreator<FlexiblePosition>;


/**
 * The parameters for configuring a visual box in the user interface.
 */
export interface BoxParams extends ElementParams
{
	/**
	 * The content to show within the box.
	 */
	content: BoxContainer;

	/**
	 * An optionel label to show at the top of the box.
	 */
	text?: Bindable<string>;
}


/**
 * Create a visual box for grouping one or widgets with the specified parameters.
 */
export function box<TPos extends Positions>(params: (BoxParams | BoxContainer) & TPos): WidgetCreator<(BoxParams | BoxContainer) & TPos>
{
	return {
		params: params,
		create: (output: BuildOutput): BoxControl => new BoxControl(output, params)
	};
}


const defaultPadding: Padding = 5;


/**
 * A controller class for a groupbox widget.
 */
class BoxControl extends Control<GroupBoxWidget> implements GroupBoxWidget
{
	text?: string;

	child: Layoutable;
	innerPadding: Padding;

	constructor(output: BuildOutput, params: (BoxParams | BoxContainer) & FlexiblePosition)
	{
		const type = "groupbox";
		let content: WidgetCreator<FlexiblePosition>;
		let padding: Padding;
		if ("create" in params)
		{
			// flat params, just a creator
			super(type, output, {});
			content = params;
			padding = defaultPadding;
		}
		else
		{
			// complex params object
			super(type, output, params);
			content = params.content;

			// padding should be applied after widget sizing, not before, thus remove specified padding
			const supplied = params.padding;
			padding = (supplied !== undefined) ? supplied : defaultPadding;
			params.padding = undefined;

			const binder = output.binder;
			binder.add(this, "text", params.text);
		}

		this.child = content.create(output);
		this.innerPadding = padding;
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		super.layout(widgets, area);

		const padding = this.innerPadding;
		if (padding)
		{
			applyPadding(area, padding);
		}
		this.child.layout(widgets, area);
	}
}