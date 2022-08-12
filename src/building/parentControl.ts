import { Positions } from "@src/elements/layouts/positions";
import { Parsed } from "@src/positional/parsing/parsed";


/**
 * An interface to interact with the parent of this control.
 */
export interface ParentControl<TPos extends Positions = Positions>
{
	/**
	 * Parses a position according to the positional context of the parent.
	 */
	parse(position: TPos): Parsed<TPos>;

	/**
	 * Indicate to the parent that it should recalculate its own required area, because (for example)
	 * one of its children has changed their size.
	 */
	recalculate(): void;
}
