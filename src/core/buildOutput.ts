import { Binder } from "../observables/binder";
import { Template } from "../templates/template";
import { Event } from "../utilities/event";


/**
 * Object that holds components required to build the final window.
 */
export class BuildOutput
{
	widgets: Widget[] = [];
	binder: Binder = new Binder();
	template: Template;

	open: Event = [];
	update: Event = [];
	close: Event = [];

	constructor(window: WindowDesc)
	{
		this.template = new Template(window, this.binder);
	}
}