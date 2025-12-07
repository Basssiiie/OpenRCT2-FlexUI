import { Bindable } from "@src/bindings/bindable";
import { Rectangle } from "@src/positional/rectangle";
import { WidgetMap } from "./widgets/widgetMap";


/**
 * Object that can be layout over a specific area.
 */
export interface Layoutable
{
	/**
	 * Whether to skip rendering of the element. If `true`, the element has to be
	 * skipped and `layout()` should not be called. If `false` it will apply the
	 * regular rendering technique.
	 * @default false
	 */
	readonly skip?: Bindable<boolean>;

	/**
	 * Function that can update the positions for a specific set of widgets when the
	 * layout is rendered or re-rendered.
	 */
	layout(widgets: WidgetMap, area: Rectangle): void;
}
