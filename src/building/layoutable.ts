import { Positions } from "@src/elements/layouts/positions";
import { Parsed } from "@src/positional/parsing/parsed";
import { Rectangle } from "@src/positional/rectangle";
import { WidgetMap } from "./widgetMap";


/**
 * Object that can be layout over a specific area.
 */
export interface Layoutable<TPos extends Positions>
{
	/**
	 * Whether to skip rendering of the element. If `true`, the element will be
	 * skipped and `layout()` shall not be called. If `false` it will apply the
	 * regular rendering technique.
	 * @default false
	 */
	readonly skip?: boolean;

	position(): Parsed<TPos>;

	/**
	 * Function that can update the positions for a specific set of widgets
	 * when the layout is rendered or re-rendered.
	 */
	layout(widgets: WidgetMap, area: Rectangle): void;
}
