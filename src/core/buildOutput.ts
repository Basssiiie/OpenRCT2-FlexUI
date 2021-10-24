import { Binder } from "@src/observables/binder";
import { Template } from "@src/templates/template";
import { Event } from "@src/utilities/event";


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