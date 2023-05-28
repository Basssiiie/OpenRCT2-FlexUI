import { Rectangle } from "@src/positional/rectangle";
import { Layoutable } from "@src/windows/layoutable";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetMap } from "@src/windows/widgets/widgetMap";


/**
 * Simple layoutable base class that stores information required for visualizing the control.
 */
export abstract class VisualElement<Positioning, ParsedPosition> implements Layoutable<ParsedPosition>
{
	skip?: boolean;
	position: ParsedPosition;
	_parent: ParentControl<Positioning, ParsedPosition>;

	constructor(parent: ParentControl<Positioning, ParsedPosition>, params: Positioning)
	{
		this.position = parent.parse(params);
		this._parent = parent;
	}

	abstract layout(widgets: WidgetMap, area: Rectangle): void;
}