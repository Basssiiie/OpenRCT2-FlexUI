import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
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
export function graphics<I, P>(params: GraphicsParams & I): WidgetCreator<I, P>
{
    return (parent, output) => new GraphicsControls<I, P>(parent, output, params);
}

/**
 * A controller class for a graphics drawing widget.
 */
export class GraphicsControls<I, P> extends Control<CustomDesc, I, P> implements CustomDesc, GraphicsParams
{
    onDraw?: ((g: GraphicsContext) => void);

    constructor(parent: ParentControl<I, P>, output: BuildOutput, params: GraphicsParams & I)
    {
        super("custom", parent, output, params);
        this.onDraw = params.onDraw;
    }
}
