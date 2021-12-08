import { DropdownParams } from "./dropdown";


/**
 * A single selectable option in the dropdown button.
 */
export interface DropdownButtonAction
{
	text: string;
	onClick: () => void;
}


/**
 * The parameters for configuring the dropdown button.
 */
export interface DropdownButtonParams extends DropdownParams
{
	/**
	 * All the available buttons in this dropdown button.
	 */
	buttons: DropdownButtonAction[];
}


/**
 * A dropdown with a button on the side.
 */
export default class DropdownButtonComponent// extends DropdownControl
{
}
