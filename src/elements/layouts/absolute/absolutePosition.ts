import { Bindable } from "@src/bindings/bindable";
import { Scale } from "@src/positional/scale";
import { Hideable } from "@src/positional/visibility";


/**
 * Specifies an absolute position relative to the parent area.
 */
export interface AbsolutePosition extends Hideable
{
	/**
	 * The position on the horizontal axis of the top-left corner of the widget,
	 * relative to the top-left corner of the parent area.
	 * @see {@link Scale} for examples of allowed values.
	 */
	x: Bindable<Scale>;

	/**
	 * The position on the vertical axis of the top-left corner of the widget,
	 * relative to the top-left corner of the parent area.
	 * @see {@link Scale} for examples of allowed values.
	 */
	y: Bindable<Scale>;

	/**
	 * The width of this widget on the horizontal axis.
	 * @see {@link Scale} for examples of allowed values.
	 */
	width: Bindable<Scale>;

	/**
	 * The height of this widget on the vertical axis.
	 * @see {@link Scale} for examples of allowed values.
	 */
	height: Bindable<Scale>;
}
