import { FlexibleDirectionalLayoutParams } from "@src/elements/layouts/flexible/flexible";
import { Paddable } from "@src/positional/paddable";
import { FrameBuilder } from "../frames/frameBuilder";
import { TabCreator } from "./tabCreator";
import { WindowScale } from "../windowScale";


/**
 * Parameters for configuring a tab inside a window.
 */
export interface TabParams extends FlexibleDirectionalLayoutParams, Paddable
{
	/**
	 * A custom width for this specific tab, to override the window width.
	 * @default "inherit"
	 */
	width?: number | WindowScale | "auto" | "inherit";

	/**
	 * A custom height for this specific tab, to override the window height.
	 * @default "inherit"
	 */
	height?: number | WindowScale | "auto" | "inherit";

	/**
	 * Specifies an image sprite to be used as the icon of the tab.
	 */
	image: number | ImageAnimation | IconName;

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
}


/**
 * Create a tab to split your window content into one or more pages of widgets.
 */
export function tab(params: TabParams): TabCreator
{
	return (parent, output) =>
	{
		const builder = new FrameBuilder(parent, params, params);

		output.image = params.image;
		output.widgets = builder._widgets;
		return builder.context;
	};
}