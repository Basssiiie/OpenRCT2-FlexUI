import { Layoutable } from "@src/building/layoutable";
import { ParentControl } from "@src/building/parentControl";
import { WidgetMap } from "@src/building/widgetMap";
import { Parsed } from "@src/positional/parsing/parsed";
import { Rectangle } from "@src/positional/rectangle";
import { Positions } from "../layouts/positions";


/**
 * Simple layoutable base class that stores information required for visualizing the control.
 */
export abstract class VisualElement implements Layoutable
{
	skip?: boolean;
	_position: Parsed<Positions>;
	_parent: ParentControl;

	constructor(parent: ParentControl, params: Positions)
	{
		this._position = parent.parse(params);
		this._parent = parent;
	}

	position(): Parsed<Positions>
	{
		return this._position;
	}

	abstract layout(widgets: WidgetMap, area: Rectangle): void;
}