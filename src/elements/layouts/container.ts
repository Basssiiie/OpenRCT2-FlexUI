import { Rectangle } from "@src/positional/rectangle";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";


/**
 * Represents a simple child element in a container.
 */
export type Child<ParsedPosition> = ParsedPosition & {
	_layoutable: Layoutable;
	_area: Rectangle;
};

/**
 * Constructs a container array that holds one or more child controls.
 */
export function container<Positioning, ParsedPosition>(output: BuildOutput, creators: WidgetCreator<Positioning>[], parse: (position: Positioning) => ParsedPosition): Child<ParsedPosition>[]
{
	const count = creators.length;
	const children = Array<Child<ParsedPosition>>(count);
	let idx = 0;
	let creator: WidgetCreator<Positioning>;
	let layoutable: Layoutable;
	let child: Child<ParsedPosition>;

	for (; idx < count; idx++)
	{
		creator = creators[idx];
		layoutable = creator.create(output); // fixme: the order of these calls matters
		children[idx] = child = <Child<ParsedPosition>>parse(creator.position);
		child._layoutable = layoutable;
		child._area = <Rectangle>{};
	}

	return children;
}
