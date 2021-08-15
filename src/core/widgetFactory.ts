import { LayoutFunction } from "../layouts/layoutFunction";
import { BuildOutput } from "./buildOutput";


/**
 * Standard interface for a factory that creates one or more widgets for a
 * specific element.
 */
export interface WidgetFactory<TParams>
{
	/**
	 * Write all widgets required by the params to the output.
	 */
	create(output: BuildOutput, params: TParams): LayoutFunction;
}