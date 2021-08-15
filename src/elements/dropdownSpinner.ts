import { DropdownParams } from "./dropdown";
import { SpinnerParams } from "./spinner";


/**
 * The parameters for configuring the spinner.
 */
export type DropdownSpinnerParams = DropdownParams & Partial<SpinnerParams>;


/**
 * A dropdown with a spinner control on the side.
 */
export default class DropdownSpinnerControl //extends DropdownControl
{
}
