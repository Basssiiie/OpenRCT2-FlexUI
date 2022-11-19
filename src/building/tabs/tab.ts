import { FlexibleLayoutParams } from "@src/elements/layouts/flexible/flexible";
import { FrameBuilder } from "../frames/frameBuilder";
import { TabCreator } from "./tabCreator";


/**
 * Parameters for configuring a tab inside a window.
 */
export interface TabParams extends FlexibleLayoutParams
{
	/**
	 * Specifies an image sprite to be used as the icon of the tab.
	 */
	image: number | ImageAnimation;

	//width?: number;
	//height?: number;
}


/**
 * Create a tab to split your window content into one or more pages of widgets.
 */
export function tab(params: TabParams): TabCreator
{
	return (output: WindowTabDesc) =>
	{
		const builder = new FrameBuilder(params, [], [], []);

		output.image = params.image;
		output.widgets = builder._widgets;
		return builder.context;
	};
}