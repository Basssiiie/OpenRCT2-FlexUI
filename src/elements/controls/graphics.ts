import { BuildOutput } from "@src/windows/buildOutput";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Control } from "./control";

/**
 * The parameters for configuring the custom graphics drawing widget.
 */
export interface GraphicsParams extends ElementParams
{
	/**
	 * Use for drawing custom graphics. See {@link GraphicsContext} for more information.
	 * @default undefined
	 */
	onDraw?: (g: GraphicsContext) => void;
}

/**
 * Create a custom widget for drawing.
 */
export function graphics(params: GraphicsParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function graphics(params: GraphicsParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function graphics<Position>(params: GraphicsParams & Position): WidgetCreator<Position>
{
	return toWidgetCreator(GraphicsControls, params);
}

/**
 * A controller class for a graphics drawing widget.
 */
export class GraphicsControls<Position> extends Control<CustomDesc, Position> implements CustomDesc, GraphicsParams
{
	onDraw?: ((g: GraphicsContext) => void);

	constructor(output: BuildOutput, params: GraphicsParams & Position)
	{
		super("custom", output, params);
		this.onDraw = params.onDraw;
	}
}
