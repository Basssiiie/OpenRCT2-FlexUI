import { Layoutable } from "@src/layouts/layoutable";
import { BuildOutput } from "./buildOutput";


/**
 * Standard interface for a function that creates one or more widgets for a
 * specific element.
 */
export interface WidgetCreator<TParams>
{
	/**
	 * The parameters that were specified for these widgets.
	 */
	readonly params: Readonly<TParams>;

	/**
	 * Write all widgets required by the params to the output. Returns an
	 * interface that can draw the widgets to a specified area.
	 */
	create(output: BuildOutput): Layoutable;
}