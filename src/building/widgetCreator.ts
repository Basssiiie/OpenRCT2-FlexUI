import { BuildOutput } from "./buildOutput";
import { Layoutable } from "./layoutable";
import { ParentControl } from "./parentControl";


/**
 * Standard interface for a function that creates one or more widgets for a
 * specific element.
 */
export interface WidgetCreator<TPos extends object>
{
	/**
	 * The parameters that were specified for these widgets.
	 * @deprecated
	 */
	//readonly params: Readonly<TPos>;

	/**
	 * Write all widgets required by the params to the output. Returns an
	 * interface that can draw the widgets to a specified area.
	 */
	create(parent: ParentControl, output: BuildOutput): Layoutable<TPos>;
}
