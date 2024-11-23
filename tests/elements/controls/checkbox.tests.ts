/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { twoway } from "@src/bindings/twoway/twoway";
import { checkbox } from "@src/elements/controls/checkbox";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "tests/helpers";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			checkbox({
				text: "Check me out",
				tooltip: "checkable!",
				isChecked: true
			})
		]
	});
	template.open();

	const widget = <CheckboxWidget>mock.createdWindows[0].widgets[0];
	t.is(widget.type, "checkbox");
	t.is(widget.text, "Check me out");
	t.is(widget.tooltip, "checkable!");
	t.true(widget.isChecked);
});


test("Change event gets called", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const hits: boolean[] = [];
	const template = window({
		width: 100, height: 100,
		content: [
			checkbox({ onChange: v => hits.push(v) })
		]
	});
	template.open();

	const widget = <CheckboxDesc>mock.createdWindows[0].widgets[0];
	call(widget.onChange, true);
	call(widget.onChange, false);
	call(widget.onChange, true);
	call(widget.onChange, false);

	t.deepEqual(hits, [ true, false, true, false ]);
});


test("One-way bindings update checkbox", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const isChecked = store(true);
	const text = store("Hello");

	const template = window({
		width: 100, height: 100,
		content: [
			checkbox({ isChecked, text })
		]
	});
	template.open();

	const widget = <CheckboxDesc>mock.createdWindows[0].widgets[0];
	t.true(widget.isChecked);
	t.is(widget.text, "Hello");
	t.falsy(widget.onChange); // not assigned

	isChecked.set(false);
	t.false(widget.isChecked);
	t.is(widget.text, "Hello");

	text.set("Bye");
	t.false(widget.isChecked);
	t.is(widget.text, "Bye");

	isChecked.set(true);
	t.true(widget.isChecked);
	t.is(widget.text, "Bye");
});


test("Two-way bindings update checkbox", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const isChecked = store(false);
	const hits: boolean[] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			checkbox({
				isChecked: twoway(isChecked),
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = <CheckboxDesc>mock.createdWindows[0].widgets[0];
	t.false(widget.isChecked);
	t.false(isChecked.get());
	t.deepEqual(hits, []);

	isChecked.set(true);
	t.true(widget.isChecked);
	t.true(isChecked.get());
	t.deepEqual(hits, []);

	call(widget.onChange, false);
	t.false(widget.isChecked);
	t.false(isChecked.get());
	t.deepEqual(hits, [ false ]);

	call(widget.onChange, true);
	t.true(widget.isChecked);
	t.true(isChecked.get());
	t.deepEqual(hits, [ false, true ]);

	isChecked.set(false);
	t.false(widget.isChecked);
	t.false(isChecked.get());
	t.deepEqual(hits, [ false, true ]);
});
