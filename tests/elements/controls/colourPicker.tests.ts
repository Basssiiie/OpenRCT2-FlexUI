/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { window } from "@src/building/window";
import { colourPicker } from "@src/elements/controls/colourPicker";
import { Colour } from "@src/utilities/colour";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "tests/helpers";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			colourPicker({ colour: Colour.BrightYellow, tooltip: "colourable!" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ColourPickerWidget;
	t.is(widget.type, "colourpicker");
	t.is(widget.colour, Colour.BrightYellow);
	t.is(widget.tooltip, "colourable!");
});


test("Colour is bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const colour = store(Colour.Aquamarine);
	const template = window({
		width: 100, height: 100,
		content: [
			colourPicker({ colour })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ColourPickerWidget;
	t.is(widget.colour, Colour.Aquamarine);

	colour.set(Colour.OliveGreen);
	t.is(widget.colour, Colour.OliveGreen);
});


test("Change event gets called", t =>
{
	const mock = Mock.ui();
	global.ui = mock;
	const hits: Colour[] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			colourPicker({ onChange: colour => hits.push(colour) })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ColourPickerWidget;
	call(widget.onChange, Colour.IcyBlue);
	call(widget.onChange, Colour.Black);
	call(widget.onChange, Colour.LightPink);
	call(widget.onChange, Colour.Teal);

	t.deepEqual(hits, [ Colour.IcyBlue, Colour.Black, Colour.LightPink, Colour.Teal ]);
});
