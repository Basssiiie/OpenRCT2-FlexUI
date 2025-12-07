import { BuildOutput } from "../buildOutput";
import { Layoutable } from "../layoutable";


/**
 * Write all widgets required by the params to the output. Returns an
 * interface that can draw the widgets to a specified area.
 */
export interface WidgetCreator<Positioning>
{
	/**
	 * Get the preferred position for this widget.
	 */
	position: Readonly<Positioning>;

	/**
	 * Creates the drawable control for this widget.
	 */
	create(output: BuildOutput): Layoutable;
}

/**
 * Construct a widget creator with the specified control and parameters.
 */
export function toWidgetCreator<Positioning, Additional>(
	control: new (output: BuildOutput, parameters: Positioning, additional?: Additional) => Layoutable,
	parameters: Positioning,
	additional?: Additional
): WidgetCreator<Positioning>
{
	return {
		position: parameters,
		create: output => new control(output, parameters, additional)
	};
}
