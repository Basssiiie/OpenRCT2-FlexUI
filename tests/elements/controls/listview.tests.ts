/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { twoway } from "@src/bindings/twoway/twoway";
import { listview } from "@src/elements/controls/listview";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			listview({
				columns: [
					<ListViewColumn>{
						canSort: true,
						sortOrder: "ascending",
						header: "Classic header",
						headerTooltip: "Classic tooltip",
						width: 40,
						ratioWidth: 2,
						minWidth: 75,
						maxWidth: 155
					},
					<ListViewColumn>{
						sortOrder: "descending",
						header: "Header 2",
						headerTooltip: "Tooltip 2",
						width: 25,
					}
				],
				items: [
					[ "1.", "top entry" ],
					{ type: "seperator", text: "central entry" },
					[ "2.", "bottom entry" ]
				],
				scrollbars: "both",
				selectedCell: { row: 2, column: 1 },
				canSelect: true,
				isStriped: true
			})
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ListViewWidget;
	t.is(widget.type, "listview");
	t.is(widget.scrollbars, "both");
	t.deepEqual(widget.selectedCell, { row: 2, column: 1 });
	t.true(widget.showColumnHeaders);
	t.true(widget.canSelect);
	t.true(widget.isStriped);

	const columns = widget.columns;
	t.is(columns.length, 2);
	t.true(columns[0].canSort);
	t.is(columns[0].sortOrder, "ascending");
	t.is(columns[0].header, "Classic header");
	t.is(columns[0].headerTooltip, "Classic tooltip");
	t.is(columns[0].width, 40);
	t.is(columns[0].ratioWidth, 2);
	t.is(columns[0].minWidth, 75);
	t.is(columns[0].maxWidth, 155);

	t.falsy(columns[1].canSort);
	t.is(columns[1].sortOrder, "descending");
	t.is(columns[1].header, "Header 2");
	t.is(columns[1].headerTooltip, "Tooltip 2");
	t.is(columns[1].width, 25);
	t.falsy(columns[1].ratioWidth);
	t.falsy(columns[1].minWidth);
	t.falsy(columns[1].maxWidth);

	const items = widget.items;
	t.is(items.length, 3);
	t.deepEqual(items[0], [ "1.", "top entry" ]);
	t.deepEqual(items[1], { type: "seperator", text: "central entry" });
	t.deepEqual(items[2], [ "2.", "bottom entry" ]);
});

test("Simple column names get converted", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			listview({
				columns: [ "First", "Second", "Third" ],
				items: [
					[ "1.", "top entry" ],
					{ type: "seperator", text: "central entry" },
					[ "2.", "bottom entry" ]
				],
				scrollbars: "vertical"
			})
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ListViewWidget;
	t.is(widget.type, "listview");
	t.is(widget.scrollbars, "vertical");
	t.true(widget.showColumnHeaders);
	t.falsy(widget.selectedCell);
	t.falsy(widget.canSelect);
	t.falsy(widget.isStriped);

	const columns = widget.columns;
	t.is(columns.length, 3);

	t.is(columns[0].header, "First");
	t.is(columns[0].ratioWidth, 1);
	t.falsy(columns[0].headerTooltip);
	t.falsy(columns[0].sortOrder);
	t.falsy(columns[0].canSort);
	t.falsy(columns[0].width);
	t.falsy(columns[0].minWidth);
	t.falsy(columns[0].maxWidth);

	t.is(columns[1].header, "Second");
	t.is(columns[1].ratioWidth, 1);
	t.falsy(columns[1].headerTooltip);
	t.falsy(columns[1].sortOrder);
	t.falsy(columns[1].canSort);
	t.falsy(columns[1].width);
	t.falsy(columns[1].minWidth);
	t.falsy(columns[1].maxWidth);

	t.is(columns[2].header, "Third");
	t.is(columns[2].ratioWidth, 1);
	t.falsy(columns[2].headerTooltip);
	t.falsy(columns[2].sortOrder);
	t.falsy(columns[2].canSort);
	t.falsy(columns[2].width);
	t.falsy(columns[2].minWidth);
	t.falsy(columns[2].maxWidth);
});

test("Items is bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const items = store([ "Hello", "world" ]);
	const template = window({
		width: 100, height: 100,
		content: [
			listview({ items })
		]
	});

	const instance1 = template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewWidget;
	t.deepEqual(listview1.items, [ "Hello", "world" ]);

	items.set([ "Bye", "friendly", "friend" ]);
	t.deepEqual(listview1.items, [ "Bye", "friendly", "friend" ]);

	instance1.close();
	items.set([ "Still", "there" ]);
	template.open();

	const listview2 = mock.createdWindows[0].widgets[0] as ListViewWidget;
	t.deepEqual(listview2.items, [ "Still", "there" ]);
});

test("Show column headers is false without columns", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			listview({
				items: [ "Hello", "world" ]
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewWidget;
	t.false(listview1.showColumnHeaders);
	t.falsy(listview1.columns);
});

test("Show column headers is true with empty column array", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			listview({
				columns: [],
				items: [ "Hello", "world" ]
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewWidget;
	t.true(listview1.showColumnHeaders);
	t.deepEqual(listview1.columns, []);
});

test("Built-in ratio width colums map correctly", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 110, height: 100,
		content: [
			listview({
				columns: [
					{ ratioWidth: 3 },
					{ ratioWidth: 2 },
					{ ratioWidth: 5 }
				],
				items: []
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewWidget;
	t.true(listview1.showColumnHeaders);

	const columns = listview1.columns;
	t.is(columns[0].ratioWidth, 3);
	t.is(columns[1].ratioWidth, 2);
	t.is(columns[2].ratioWidth, 5);
});

test("Custom colum params with mixed widths map correctly", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 110, height: 100,
		content: [
			listview({
				columns: [
					{ header: "First", tooltip: "Aa", canSort: true, width: "20px" },
					{ header: "Second", tooltip: "Bb", canSort: false, width: "35%" },
					{ tooltip: "Third" },
					{ header: "Fourth", width: "3w" },
				],
				items: []
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewWidget;
	t.true(listview1.showColumnHeaders);

	const columns = listview1.columns;
	t.is(columns[0].header, "First");
	t.is(columns[0].headerTooltip, "Aa");
	t.true(columns[0].canSort);
	t.is(columns[0].width, 20);
	t.falsy(columns[0].ratioWidth);

	t.is(columns[1].header, "Second");
	t.is(columns[1].headerTooltip, "Bb");
	t.false(columns[1].canSort);
	t.is(columns[1].width, 28);
	t.falsy(columns[1].ratioWidth);

	t.falsy(columns[2].header);
	t.is(columns[2].headerTooltip, "Third");
	t.falsy(columns[2].canSort);
	t.is(columns[2].width, 13); // mixed missing uses 1w in custom scaling
	t.falsy(columns[2].ratioWidth);

	t.is(columns[3].header, "Fourth");
	t.falsy(columns[3].headerTooltip);
	t.falsy(columns[3].canSort);
	t.is(columns[3].width, 39); // mixed uses `width` instead of `ratioWidth` in custom scaling
	t.falsy(columns[3].ratioWidth);
});

test("Custom columns with unspecified width", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			listview({
				columns: [
					{ header: "First" },
					{ header: "Second" },
				],
				items: [ "Hello", "world" ]
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewWidget;
	t.true(listview1.showColumnHeaders);

	const columns = listview1.columns;
	t.is(columns[0].header, "First");
	t.falsy(columns[0].width);
	t.is(columns[0].ratioWidth, 1);
	t.falsy(columns[0].minWidth);
	t.falsy(columns[0].maxWidth);

	t.is(columns[1].header, "Second");
	t.falsy(columns[1].width);
	t.is(columns[1].ratioWidth, 1);
	t.falsy(columns[1].minWidth);
	t.falsy(columns[1].maxWidth);
});

test("All pixel widths is built-in scaling", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			listview({
				columns: [
					{ width: 25 },
					{ width: "35px" },
					{ width: 12 },
				],
				items: []
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewWidget;
	const columns = listview1.columns;
	t.is(columns[0].width, 25);
	t.is(columns[1].width, 35);
	t.is(columns[2].width, 12);
	t.falsy(columns[0].ratioWidth);
	t.falsy(columns[1].ratioWidth);
	t.falsy(columns[2].ratioWidth);
});

test("All weighted widths is built-in scaling", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 190, height: 100,
		content: [
			listview({
				columns: [
					{ width: "1w" },
					{ width: "3w" },
					{ width: "2w" },
				],
				items: []
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewWidget;
	const columns = listview1.columns;
	t.is(columns[0].ratioWidth, 1);
	t.is(columns[1].ratioWidth, 3);
	t.is(columns[2].ratioWidth, 2);
	t.falsy(columns[0].width);
	t.falsy(columns[1].width);
	t.falsy(columns[2].width);
});

test("All percentage widths is custom scaling", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 210, height: 100,
		content: [
			listview({
				columns: [
					{ width: "25%" },
					{ width: "35%" },
					{ width: "10%" },
				],
				items: []
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewWidget;
	const columns = listview1.columns;
	t.is(columns[0].width, 50);
	t.is(columns[1].width, 70);
	t.is(columns[2].width, 20);
	t.falsy(columns[0].ratioWidth);
	t.falsy(columns[1].ratioWidth);
	t.falsy(columns[2].ratioWidth);
});

test("On click callback is propagated and skips duplicate clicks", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const calls: string[] = [];
	const template = window({
		width: 210, height: 100,
		content: [
			listview({
				items: [ "First", "Second", "Third", "Fourth" ],
				onClick: (r, c) => calls.push(`R${r}/C${c}`)
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewDesc;
	listview1.onClick!(2, 1);
	listview1.onClick!(1, 0);
	listview1.onClick!(1, 1);
	listview1.onClick!(1, 1);
	listview1.onClick!(2, 1);

	t.deepEqual(calls, ["R2/C1", "R1/C0", "R1/C1", "R1/C1", "R2/C1"]);
});

test("Selected cell can be bound", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const selected = store<RowColumn | null>({ row: 2, column: 0 });
	const updates: (RowColumn | null)[] = [];
	selected.subscribe(c => updates.push(c));
	const template = window({
		width: 210, height: 100,
		content: [
			listview({
				items: [ "First", "Second", "Third", "Fourth" ],
				selectedCell: selected
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as ListViewWidget;

	t.deepEqual(listview1.selectedCell, { row: 2, column: 0 });
	t.deepEqual(updates, []);

	selected.set({ row: 0, column: 0 });
	t.deepEqual(listview1.selectedCell, { row: 0, column: 0 });
	t.deepEqual(updates, [{ row: 0, column: 0 }]);

	selected.set(null);
	t.is(listview1.selectedCell, null);
	t.deepEqual(updates, [{ row: 0, column: 0 }, null]);

	selected.set({ row: 1, column: 1 });
	t.deepEqual(listview1.selectedCell, { row: 1, column: 1 });
	t.deepEqual(updates, [{ row: 0, column: 0 }, null, { row: 1, column: 1 }]);
});

test("Selected cell can be bound with separate on click event", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const selected = store<RowColumn | null>(null);
	const updates: (RowColumn | null)[] = [];
	const calls: [number, number][] = [];
	selected.subscribe(c => updates.push(c));
	const template = window({
		width: 210, height: 100,
		content: [
			listview({
				items: [ "First", "Second", "Third", "Fourth" ],
				selectedCell: selected,
				onClick: (r, c) => calls.push([r, c])
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as (ListViewWidget & ListViewDesc);

	t.deepEqual(listview1.selectedCell, null);
	t.deepEqual(calls, []);

	selected.set({ row: 2, column: 1 });
	t.deepEqual(listview1.selectedCell, { row: 2, column: 1 });
	t.deepEqual(updates, [{ row: 2, column: 1 }]);
	t.deepEqual(calls, []);

	listview1.onClick!(0, 0);
	t.deepEqual(updates, [{ row: 2, column: 1 }]); // No change due to not being two-way binding
	t.deepEqual(calls, [[0, 0]]);

	selected.set({ row: 0, column: 0 });
	t.deepEqual(listview1.selectedCell, { row: 0, column: 0 });
	t.deepEqual(updates, [{ row: 2, column: 1 }, { row: 0, column: 0 }]); // No changes due to same object
	t.deepEqual(calls, [[0, 0]]);

	listview1.onClick!(0, 0);
	t.deepEqual(updates, [{ row: 2, column: 1 }, { row: 0, column: 0 }]); // No changes due to same object
	t.deepEqual(calls, [[0, 0], [0, 0]]);
});

test("Selected cell can be two-way bound", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const selected = store<RowColumn | null>({ row: 2, column: 0 });
	const updates: (RowColumn | null)[] = [];
	selected.subscribe(c => updates.push(c));
	const template = window({
		width: 210, height: 100,
		content: [
			listview({
				items: [ "First", "Second", "Third", "Fourth" ],
				selectedCell: twoway(selected)
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as (ListViewWidget & ListViewDesc);

	t.deepEqual(listview1.selectedCell, { row: 2, column: 0 });
	t.deepEqual(updates, []);

	selected.set({ row: 0, column: 0 });
	t.deepEqual(listview1.selectedCell, { row: 0, column: 0 });
	t.deepEqual(updates, [{ row: 0, column: 0 }]);

	listview1.onClick!(2, 1);
	t.deepEqual(updates, [{ row: 0, column: 0 }, { row: 2, column: 1 }]);

	selected.set({ row: 1, column: 1 });
	t.deepEqual(listview1.selectedCell, { row: 1, column: 1 });
	t.deepEqual(updates, [{ row: 0, column: 0 }, { row: 2, column: 1 }, { row: 1, column: 1 }]);
});

test("Selected cell can be two-way bound with extra on click event", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const selected = store<RowColumn | null>({ row: 2, column: 0 });
	const calls: [number, number][] = [];
	const updates: (RowColumn | null)[] = [];
	selected.subscribe(c => updates.push(c));
	const template = window({
		width: 210, height: 100,
		content: [
			listview({
				items: [ "First", "Second", "Third", "Fourth" ],
				selectedCell: twoway(selected),
				onClick: (r, c) => calls.push([r, c])
			})
		]
	});

	template.open();

	const listview1 = mock.createdWindows[0].widgets[0] as (ListViewWidget & ListViewDesc);

	t.deepEqual(listview1.selectedCell, { row: 2, column: 0 });
	t.deepEqual(calls, []);
	t.deepEqual(updates, []);

	selected.set({ row: 0, column: 0 });
	t.deepEqual(listview1.selectedCell, { row: 0, column: 0 });
	t.deepEqual(calls, []);
	t.deepEqual(updates, [{ row: 0, column: 0 }]);

	listview1.onClick!(2, 1);
	t.deepEqual(calls, [[2, 1]]);
	t.deepEqual(updates, [{ row: 0, column: 0 }, { row: 2, column: 1 }]);

	selected.set({ row: 1, column: 1 });
	t.deepEqual(listview1.selectedCell, { row: 1, column: 1 });
	t.deepEqual(calls, [[2, 1]]);
	t.deepEqual(updates, [{ row: 0, column: 0 }, { row: 2, column: 1 }, { row: 1, column: 1 }]);

	listview1.onClick!(0, 0);
	t.deepEqual(calls, [[2, 1], [0, 0]]);
	t.deepEqual(updates, [{ row: 0, column: 0 }, { row: 2, column: 1 }, { row: 1, column: 1 }, { row: 0, column: 0 }]);

	listview1.onClick!(0, 0);
	t.deepEqual(calls, [[2, 1], [0, 0], [0, 0]]);
	t.deepEqual(updates, [{ row: 0, column: 0 }, { row: 2, column: 1 }, { row: 1, column: 1 }, { row: 0, column: 0 }]); // No changes
});
