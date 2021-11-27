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
import { isUndefined } from "@src/utilities/type";
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


const defaultPadding: Padding = 6;
const trimTop: number = 4;


/**
 * A controller class for a groupbox widget.
 */
class BoxControl extends Control<GroupBoxWidget> implements GroupBoxWidget
{
	text?: string;

	_child: Layoutable;
	_innerPadding: Padding;
	_childPadding?: Padding;

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
			padding = (!isUndefined(supplied)) ? supplied : defaultPadding;
			params.padding = undefined;

			const binder = output.binder;
			binder.add(this, "text", params.text);
		}

		this._innerPadding = padding;
		this._child = content.create(output);
		this._childPadding = content.params.padding;
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		area.y -= trimTop;
		area.height += trimTop;
		super.layout(widgets, area);
		area.y += trimTop;
		area.height -= trimTop;

		const innerPadding = this._innerPadding;
		if (innerPadding)
		{
			applyPadding(area, innerPadding);
		}
		const childPadding = this._childPadding;
		if (childPadding)
		{
			applyPadding(area, childPadding);
		}
		const child = this._child;
		child.layout(widgets, area);
	}
}