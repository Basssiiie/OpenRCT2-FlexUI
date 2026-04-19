/**
 * Similar to LayoutDirection, but const. Used for internal directional checking.
 */
export const enum Axis
{
	Vertical = 0,
	Horizontal = 1
}

/**
 * Keys identifying which side of the axis to look at, for example for padding.
 */
export const enum AxisSide
{
	Start = 0,
	End = 2
}
