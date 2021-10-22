/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import fui from "@src/fui";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.dropdown({ items: [ "a", "b", "c" ], selectedIndex: 2, tooltip: "drop me" })
	});
	template.open();

	const dropdown = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.is(dropdown.type, "dropdown");
	t.deepEqual(dropdown.items, [ "a", "b", "c" ]);
	t.is(dropdown.selectedIndex, 2);
	t.is(dropdown.tooltip, "drop me");
});


test("Items are bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const items = fui.observable([ "a", "b", "c" ]);
	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.dropdown({ items: items, selectedIndex: 2 })
	});
	template.open();

	const dropdown = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(dropdown.items, [ "a", "b", "c" ]);

	items.set([ "q", "p" ]);
	t.deepEqual(dropdown.items, [ "q", "p" ]);
});


test("Selected index is bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const selected = fui.observable(2);
	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.dropdown({ items: [ "a", "b", "c" ], selectedIndex: selected })
	});
	template.open();

	const dropdown = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.is(dropdown.selectedIndex, 2);

	selected.set(1);
	t.is(dropdown.selectedIndex, 1);

	selected.set(0);
	t.is(dropdown.selectedIndex, 0);
});


test("Select event gets called", t =>
{
	const mock = Mock.ui();
	global.ui = mock;
	const hits: number[] = [];

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.dropdown({ items: [ "a", "b", "c" ], selectedIndex: 2, onSelect: (i) => hits.push(i) })
	});
	template.open();

	const dropdown = mock.createdWindows[0].widgets[0] as DropdownWidget;
	dropdown.onChange?.(1);
	dropdown.onChange?.(2);
	dropdown.onChange?.(0);
	dropdown.onChange?.(2);

	t.deepEqual(hits, [ 1, 2, 0, 2 ]);
});


test("Disable message shows when disabled", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const disabled = fui.observable(false);
	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.dropdown({ items: [ "a", "b" ], disabled: disabled, disabledMessage: "Sorry!" })
	});
	template.open();

	const dropdown = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(dropdown.items, [ "a", "b" ]);

	disabled.set(true);
	t.deepEqual(dropdown.items, [ "Sorry!" ]);

	disabled.set(false);
	t.deepEqual(dropdown.items, [ "a", "b" ]);
});


test("Disable message shows when always disabled", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.dropdown({ items: [ "a", "b" ], disabled: true, disabledMessage: "Sorry!" })
	});
	template.open();

	const dropdown = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(dropdown.items, [ "Sorry!" ]);
});


test("Disable message doesn't show when always enabled", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.dropdown({ items: [ "a", "b" ], disabled: false, disabledMessage: "Sorry!" })
	});
	template.open();

	const dropdown = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(dropdown.items, [ "a", "b" ]);
});


test("Disable single item disables when just one item", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.dropdown({ items: [ "a" ], disableSingleItem: true })
	});
	template.open();

	const dropdown = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.true(dropdown.isDisabled);
});


test("Disable single item enabled when more than one item", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.dropdown({ items: [ "a", "b" ], disableSingleItem: true })
	});
	template.open();

	const dropdown = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.false(dropdown.isDisabled);
});