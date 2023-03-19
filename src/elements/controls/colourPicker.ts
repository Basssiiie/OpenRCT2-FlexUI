import { TwoWayBindable } from "@src/bindings/twoway/twowayBindable";
import { Rectangle } from "@src/positional/rectangle";
import { Colour } from "@src/utilities/colour";
import { decorateWithSilencer, setPropertyAndSilenceOnChange } from "@src/utilities/silencer";
import { isUndefined } from "@src/utilities/type";
import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { Control } from "./control";


const defaultColorSize = 12;


/**
 * The parameters for configuring the colour picker.
 */
export interface ColourPickerParams extends ElementParams
{
	/**
	 * The selected colour in the dropdown.
	 * @default Colour.Black
	 */
	colour?: TwoWayBindable<Colour>;

	/**
	 * Triggers when the colour picker is pressed.
	 * @default undefined
	 */
	onChange?: (colour: Colour) => void;
}


/**
 * Create a colour picker that can pick one from many colours.
 */
export function colourPicker(params: ColourPickerParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function colourPicker(params: ColourPickerParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function colourPicker(params: ColourPickerParams & Positions): WidgetCreator<Positions>
{
	if (isUndefined(params.width))
	{
		params.width = defaultColorSize;
	}
	if (isUndefined(params.height))
	{
		params.height = defaultColorSize;
	}
	return (parent, output) => new ColourPickerControl(parent, output, params);
}


/**
 * A controller class for a colour picker widget.
 */
class ColourPickerControl extends Control<ColourPickerDesc> implements ColourPickerDesc, ColourPickerParams
{
	colour?: number;
	onChange?: (colour: number) => void;

	_silenceOnChange?: boolean;


	constructor(parent: ParentControl, output: BuildOutput, params: ColourPickerParams)
	{
		super("colourpicker", parent, output, params);

		const colour = params.colour;
		const binder = output.binder;
		binder.on(this, colour, (target, value) =>
		{
			setPropertyAndSilenceOnChange(this, target, "colour", value);
		});
		binder.callback(this, "onChange", colour, decorateWithSilencer(this, params.onChange));
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		area.y += 1;
		super.layout(widgets, area);
	}
}