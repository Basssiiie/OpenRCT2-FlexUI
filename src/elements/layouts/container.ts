import { Rectangle } from "@src/positional/rectangle";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";


/**
 * Base class for a container control that holds one or more child controls.
 */
export abstract class Container<Positioning, ParsedPosition>
{
	_children: Layoutable[];
	_positions: ParsedPosition[];
	_rectangles: Rectangle[];

	constructor(output: BuildOutput, creators: WidgetCreator<Positioning>[], parse: (position: Positioning) => ParsedPosition)
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
			const index = idx;

			children[idx] = creator.create(output);
			positions[index] = parse(creator.position);
			rectangles[idx] = <Rectangle>{};
		}
	}
}
