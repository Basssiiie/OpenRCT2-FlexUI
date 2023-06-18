import { Parsed } from "@src/positional/parsing/parsed";

/**
 * An interface to interact with the parent of this control.
 */
export interface ParentControl<Positioning, ParsedPosition = Parsed<Positioning>>
{
	/**
	 * Parses a position according to the positional context of the parent.
	 */
	parse(position: Positioning): ParsedPosition;

	/**
	 * Indicate to the parent that it should recalculate its own required area, because (for example)
	 * one of its children has changed their size.
	 */
	recalculate(): void;
}
