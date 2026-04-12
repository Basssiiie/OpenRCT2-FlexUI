import { Rectangle } from "@src/positional/rectangle";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";


/**
 * Base class for a container control that holds one or more child controls.
 */
/* export abstract class Container<Positioning, ParsedPosition> // todo remove
{
	_children!: Layoutable[];
	_positions!: ParsedPosition[];
	_rectangles!: Rectangle[];

	protected _bindChildren(output: BuildOutput, creators: WidgetCreator<Positioning>[], parse: (position: Positioning) => ParsedPosition)
	{
		const count = creators.length;
		const children = Array<Layoutable>(count);
		const positions = Array<ParsedPosition>(count);
		const rectangles = Array<Rectangle>(count);
		let idx = 0;

		this._children = children;
		this._positions = positions;
		this._rectangles = rectangles;

		for (; idx < count; idx++)
		{
			const creator = creators[idx];
			children[idx] = creator.create(output);
			positions[idx] = parse(creator.position);
			rectangles[idx] = <Rectangle>{};
		}
	}
} */


export type Child<ParsedPosition> = ParsedPosition & {
	_layoutable: Layoutable;
	_area: Rectangle;
};


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
