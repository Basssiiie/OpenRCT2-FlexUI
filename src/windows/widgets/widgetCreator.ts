import { Parsed } from "@src/positional/parsing/parsed";
import { BuildOutput } from "../buildOutput";
import { Layoutable } from "../layoutable";
import { ParentControl } from "../parentControl";


/**
 * Write all widgets required by the params to the output. Returns an
 * interface that can draw the widgets to a specified area.
 */
export type WidgetCreator<Positioning, ParsedPosition = Parsed<Positioning>>
	= (parent: ParentControl<Positioning, ParsedPosition>, output: BuildOutput) => Layoutable<ParsedPosition>;