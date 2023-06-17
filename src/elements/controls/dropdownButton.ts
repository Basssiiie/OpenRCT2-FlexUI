import { store } from "@src/bindings/stores/createStore";
import { Rectangle } from "@src/positional/rectangle";
import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { SizeParams } from "../../positional/size";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { fillLayout } from "../layouts/fillLayout";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { ButtonControl, ButtonParams } from "./button";
import { DropdownControl, DropdownParams } from "./dropdown";


/**
 * A single selectable option in the dropdown button.
 */
export interface DropdownButtonAction
{
	/**
	 * The text on the button.
	 */
	text: string;

	/**
	 * Triggers when the button is pressed.
	 */
	onClick?: () => void;
}


/**
 * The parameters for configuring the dropdown button.
 */
export interface DropdownButtonParams extends ElementParams
{
	/**
	 * All the available buttons in this dropdown button.
	 */
	buttons: DropdownButtonAction[];
}


/**
 * Create a button widget with multiple selectable options, which can be selected from
 * a dropdown on the right side of the button.
 */
export function dropdownButton(params: DropdownButtonParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function dropdownButton(params: DropdownButtonParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function dropdownButton<I extends SizeParams, P>(params: DropdownButtonParams & I): WidgetCreator<I, P>
{
	ensureDefaultLineHeight(params);

	return (parent, output) => new DropdownButtonControl(parent, output, params);
}


/**
 * A button with a dropdown on the side for more options.
 */
class DropdownButtonControl<I, P> extends DropdownControl<I, P>
{
	_button: ButtonControl<I, P>;
	_selectedButton: number;


	constructor(parent: ParentControl<I, P>, output: BuildOutput, params: DropdownButtonParams & I)
	{
		// Split button actions into labels and seperate actions
		const
			buttons = params.buttons,
			count = buttons.length,
			labels = Array<string>(count),
			actions = Array<(() => void) | undefined>(count);

		for (let i = 0; i < count; i++)
		{
			const button = buttons[i];
			labels[i] = button.text;
			actions[i] = button.onClick;
		}

		const buttonText = store(labels[0] || "");

		// Setup dropdown part, reusing params object
		const dropdownParams = <DropdownParams & I><never>params;
		dropdownParams.items = labels;
		dropdownParams.onChange = (idx): void =>
		{
			this._selectedButton = idx;
			buttonText.set(labels[idx] || "");
		};
		super(parent, output, dropdownParams);

		// Setup button part, reusing params object
		const buttonParams = <ButtonParams & I>params;
		buttonParams.text = buttonText;
		buttonParams.onClick = (): void =>
		{
			const action = actions[this._selectedButton];
			if (action)
			{
				action();
			}
		};
		this._button = new ButtonControl<I, P>(parent, output, buttonParams);
		this._selectedButton = 0;
	}


	/**
	 * Positions the two widgets in the proper location.
	 */
	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		// Position dropdown (take all space in behind button)
		fillLayout(widgets, this.name, area);

		// Position button (leave space for dropdown control)
		area.x++;
		area.y++;
		area.width -= 13;
		area.height -= 2;
		fillLayout(widgets, this._button.name, area);
	}
}
