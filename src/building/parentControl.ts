import { Positions } from "@src/elements/layouts/positions";
import { Parsed } from "@src/positional/parsing/parsed";



export interface ParentControl<TPos extends Positions = Positions>
{
	readonly depth: number;

	/**
	 *
	 */
	parse(position: TPos): Parsed<TPos>;

	/**
	 * @todo
	 */
	redraw(): void;
}
