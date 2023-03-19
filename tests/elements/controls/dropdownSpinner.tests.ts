/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { twoway } from "@src/bindings/twoway/twoway";
import { dropdownSpinner } from "@src/elements/controls/dropdownSpinner";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "tests/helpers";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			dropdownSpinner({ items: [ "a", "b", "c" ], wrapMode: "wrap", tooltip: "spin me" })
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const spinner = created.widgets[0] as SpinnerDesc;
	t.is(spinner.type, "spinner");
	t.is(spinner.text, "0");
	t.is(spinner.tooltip, "spin me");

	const dropdown = created.widgets[1] as DropdownDesc;
	t.is(dropdown.type, "dropdown");
	t.deepEqual(dropdown.items, [ "a", "b", "c" ]);
	t.is(dropdown.selectedIndex, 0);
	t.is(dropdown.tooltip, "spin me");
});


test("Dropdown updates spinner", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			dropdownSpinner({ items: [ "a", "b", "c" ] })
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const spinner = created.widgets[0] as SpinnerDesc;
	const dropdown = created.widgets[1] as DropdownDesc;
	t.is(spinner.text, "0");

	call(dropdown.onChange, 2);
	t.is(spinner.text, "2");

	call(dropdown.onChange, 1);
	t.is(spinner.text, "1");
});


test("Spinner updates dropdown", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			dropdownSpinner({ items: [ "a", "b", "c" ] })
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const spinner = created.widgets[0] as SpinnerDesc;
	const dropdown = created.widgets[1] as DropdownDesc;
	t.is(dropdown.selectedIndex, 0);

	call(spinner.onIncrement);
	t.is(dropdown.selectedIndex, 1);

	call(spinner.onDecrement);
	t.is(dropdown.selectedIndex, 0);

	call(spinner.onDecrement);
	t.is(dropdown.selectedIndex, 2);

	call(spinner.onIncrement);
	t.is(dropdown.selectedIndex, 0);
});


test("Spinner allows empty item list", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			dropdownSpinner({ items: [] })
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const spinner = created.widgets[0] as SpinnerDesc;
	const dropdown = created.widgets[1] as DropdownDesc;
	t.is(dropdown.selectedIndex, 0);

	call(spinner.onIncrement);
	t.is(dropdown.selectedIndex, 0);

	call(spinner.onDecrement);
	t.is(dropdown.selectedIndex, 0);
});


test("Two-way bindings update dropdown spinner", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const selectedIndex = store(1);
	const hits: number[] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			dropdownSpinner({
				items: [ "a", "b", "c", "d" ],
				selectedIndex: twoway(selectedIndex),
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const spinner = created.widgets[0] as SpinnerDesc;
	const dropdown = created.widgets[1] as DropdownDesc;
	t.is(dropdown.selectedIndex, 1);
	t.is(selectedIndex.get(), 1);
	t.deepEqual(hits, []);

	selectedIndex.set(3);
	t.is(dropdown.selectedIndex, 3);
	t.is(selectedIndex.get(), 3);
	t.deepEqual(hits, []);

	call(dropdown.onChange, 1);
	t.is(dropdown.selectedIndex, 1);
	t.is(selectedIndex.get(), 1);
	t.deepEqual(hits, [ 1 ]);

	call(spinner.onIncrement);
	t.is(dropdown.selectedIndex, 2);
	t.is(selectedIndex.get(), 2);
	t.deepEqual(hits, [ 1, 2 ]);

	selectedIndex.set(0);
	t.is(dropdown.selectedIndex, 0);
	t.is(selectedIndex.get(), 0);
	t.deepEqual(hits, [ 1, 2 ]);
});