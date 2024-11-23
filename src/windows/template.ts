import { isFunction } from "@src/utilities/type";
import { BaseWindowControl } from "./baseWindowControl";
import { OpenWindow } from "./openWindow";
import { WindowTemplate } from "./windowTemplate";


/**
 * A base template that can spawn new window controls when a window is opened.
 */
export class Template<TModel, TParams> implements WindowTemplate<TModel>
{
	private readonly _control: new(params: TParams) => BaseWindowControl;
	private readonly _callback: (model: TModel) => TParams;

	private _active?: BaseWindowControl;


	constructor(control: new(params: TParams) => BaseWindowControl, params: ((model: TModel) => TParams) | TParams)
	{
		this._control = control;
		this._callback = isFunction(params)
			? <(model: TModel) => TParams>params
			: (): TParams => <TParams>params;
	}

	open(model: TModel): OpenWindow
	{
		const current = this._active;
		if (current && current._window)
		{
			// Multiple windows currently not supported, just refocus current window.
			current.focus(); // todo: update model?
			return current;
		}

		const params = this._callback(model);
		const window = new this._control(params);
		this._active = window;
		window._open();

		return window;
	}
}
