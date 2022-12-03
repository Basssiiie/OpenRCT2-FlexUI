import { FlexibleDirectionalLayoutParams } from "@src/elements/layouts/flexible/flexible";
import { Paddable } from "@src/positional/paddable";
import { FrameBuilder } from "../frames/frameBuilder";
import { TabCreator } from "./tabCreator";


/**
 * Parameters for configuring a tab inside a window.
 */
export interface TabParams extends FlexibleDirectionalLayoutParams, Paddable
{
	/**
	 * Specifies an image sprite to be used as the icon of the tab.
	 */
	image: number | ImageAnimation;

	/**
	 * Event that gets triggered when the tab is opened.
	 */
	onOpen?: () => void;

	/**
	 * Event that gets triggered for every tick the tab is open.
	 */
	onUpdate?: () => void;

	/**
	 * Event that gets triggered when the tab gets closed by either the
	 * user or a plugin.
	 */
	onClose?: () => void;


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
		const builder = new FrameBuilder(params, params, params.padding, [], [], []);

		output.image = params.image;
		output.widgets = builder._widgets;
		return builder.context;
	};
}