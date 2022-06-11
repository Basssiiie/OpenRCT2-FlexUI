import { Parsed } from "@src/positional/parsing/parsed";



export interface ParentControl<TPos extends object = object>
{
	/**
	 *
	 */
	parse(position: TPos): Parsed<TPos>;

	/**
	 * @todo
	 */
	//redraw(): void;
}
