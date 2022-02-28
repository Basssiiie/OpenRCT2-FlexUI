/// <reference path="../../../lib/openrct2.d.ts" />

import { window } from "@src/building/window";
import { dropdownButton } from "@src/elements/controls/dropdownButton";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "tests/helpers";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			dropdownButton({
				tooltip: "hello!",
				buttons: [ { text: "a" }, { text: "b" } ]
			})
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const dropdown = created.widgets[0] as DropdownWidget;
	t.is(dropdown.type, "dropdown");
	t.deepEqual(dropdown.items, [ "a", "b" ]);
	t.is(dropdown.tooltip, "hello!");

	const button = created.widgets[1] as ButtonWidget;
	t.is(button.type, "button");
	t.is(button.text, "a");
	t.is(button.tooltip, "hello!");
});


test("Dropdown updates button", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			dropdownButton({
				buttons: [ { text: "a" }, { text: "b" }, { text: "c" } ]
			})
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const dropdown = created.widgets[0] as DropdownWidget;
	const button = created.widgets[1] as ButtonWidget;
	t.is(button.text, "a");

	call(dropdown.onChange, 2);
	t.is(button.text, "c");

	call(dropdown.onChange, 1);
	t.is(button.text, "b");
});


test("Button onClick's are called", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const hits: string[] = [];
	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			dropdownButton({
				buttons: [
					{ text: "a", onClick: (): unknown => hits.push("a") },
					{ text: "b", onClick: (): unknown => hits.push("b") },
					{ text: "c", onClick: (): unknown => hits.push("c") }
				]
			})
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const dropdown = created.widgets[0] as DropdownWidget;
	const button = created.widgets[1] as ButtonWidget;
	call(button.onClick);
	t.deepEqual(hits, [ "a" ]);

	call(dropdown.onChange, 1);
	call(button.onClick);
	t.deepEqual(hits, [ "a", "b" ]);

	call(dropdown.onChange, 2);
	call(button.onClick);
	t.deepEqual(hits, [ "a", "b", "c" ]);

	call(dropdown.onChange, 1);
	call(button.onClick);
	t.deepEqual(hits, [ "a", "b", "c", "b" ]);
});


test("Dropdown allows empty list", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			dropdownButton({ buttons: [] })
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const dropdown = created.widgets[0] as DropdownWidget;
	const button = created.widgets[1] as ButtonWidget;
	t.is(button.text, "");
	call(button.onClick);

	call(dropdown.onChange, 2);
	t.is(button.text, "");
	call(button.onClick);

	call(dropdown.onChange, 1);
	t.is(button.text, "");
	call(button.onClick);
});