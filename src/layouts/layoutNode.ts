import { Rectangle } from "../positional/rectangle";


/**
 * A single positional node within the layout tree.
 */
export interface LayoutNode
{
	/**
	 * The children nodes, if the node has any.
	 */
	children?: LayoutNode[];

	/**
	 * The layout function to call to perform a layout (re)calculation.
	 */
	layout(widget: Widget, area: Rectangle): void;
}
