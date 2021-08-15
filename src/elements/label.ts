import { BuildOutput } from "../core/buildOutput";
import type { WidgetFactory } from "../core/widgetFactory";
import { LayoutFactory } from "../layouts/layoutFactory";
import { LayoutFunction } from "../layouts/layoutFunction";
import { Bindable } from "../observables/bindable";
import { TextColour } from "../utilities/colour";
import { Id } from "../utilities/identifier";
import { ElementFactory, ElementParams } from "./element";


export interface LabelParams extends ElementParams
{
	/**
	 * The text to be shown inside the label.
	 */
	text: Bindable<string>;

	/**
	 * The alignment of the label.
	 */
	alignment?: Bindable<TextAlignment>;

	/**
	 * The colour of the text.
	 *
	 * Note: colour can also be inserted mid-text by using `{COLOUR}`.
	 * @todo
	 */
	color?: Bindable<TextColour>;
}


export const LabelFactory: WidgetFactory<LabelParams> =
{
	create(output: BuildOutput, params: LabelParams): LayoutFunction
	{
		const id = Id.new();
		const label = ElementFactory.base<LabelWidget>(output, params, id);
		label.type = "label";

		const binder = output.binder;
		binder.read(label, "text", params.text);
		binder.read(label, "textAlign", params.alignment);

		return (widgets, area): void => LayoutFactory.defaultLayout(widgets, id, area);
	}
};
