/// <reference path="../../lib/openrct2.d.ts" />

import { tab } from "@src/building/tabs/tab";
import { tabwindow } from "@src/building/tabs/tabWindow";
import { label } from "@src/elements/controls/label";
import { Colour } from "@src/index";
import test from "ava";
import Mock, { UiMock } from "openrct2-mocks";

test("Window with tabs and widgets", t =>
{
	global.ui = Mock.ui();

	const template = tabwindow({
		title: "test tab window",
		colours: [ Colour.Aquamarine, Colour.BrightGreen, Colour.SalmonPink ],
		width: 200, height: 150,
		padding: 10,
		startingTab: 1,

		static: [
			label({ text: "hello world" }),
		],
		tabs: [
			tab({
				image: 456,
				content: [
					label({ text: "tab 1" }),
				]
			}),
			tab({
				image: 123,
				content: [
					label({ text: "tab 2" }),
				]
			})
		]
	});
	template.open();

	const created = (global.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.title, "test tab window");
	t.is(created.width, 200);
	t.is(created.height, 150);
	t.is(created.widgets.length, 2);
	t.is(created.tabIndex, 1);
	t.deepEqual(created.colours, [ Colour.Aquamarine, Colour.BrightGreen, Colour.SalmonPink ]);

	const label1 = created.widgets[0] as LabelWidget;
	t.is(label1.type, "label");
	t.is(label1.text, "hello world");
	t.is(label1.x, 10);
	t.is(label1.y, 10 + 15);
	t.is(label1.width, 200 - (20 + 1));
	t.is(label1.height, 14);

	const label2 = created.widgets[1] as LabelWidget;
	t.is(label2.type, "label");
	t.is(label2.text, "tab 2");
	t.is(label2.x, 10);
	t.is(label2.y, 10 + 44);
	t.is(label2.width, 200 - (20 + 1));
	t.is(label2.height, 14);
});


test("Window and tab events execute", t =>
{
	global.ui = Mock.ui();

	const hits: string[] = [];
	const template = tabwindow({
		width: 200, height: 150, startingTab: 1,
		onOpen() { hits.push("window open"); },
		onUpdate() { hits.push("window update"); },
		onClose() { hits.push("window close"); },
		tabs: [
			tab({
				image: 456, content: [ label({ text: "1" }) ],
				onOpen() { hits.push("tab 1 open"); },
				onUpdate() { hits.push("tab 1 update"); },
				onClose() { hits.push("tab 1 close"); },
			}),
			tab({
				image: 123, content: [ label({ text: "2" }) ],
				onOpen() { hits.push("tab 2 open"); },
				onUpdate() { hits.push("tab 2 update"); },
				onClose() { hits.push("tab 2 close"); },
			}),
			tab({
				image: 884, content: [ label({ text: "3" }) ],
				onOpen() { hits.push("tab 3 open"); },
				onUpdate() { hits.push("tab 3 update"); },
				onClose() { hits.push("tab 3 close"); },
			})
		]
	});
	template.open();

	t.deepEqual(hits, ["window open", "tab 2 open"]);

	const created = (global.ui as UiMock).createdWindows[0];
	created.onUpdate?.();
	t.deepEqual(hits, ["window open", "tab 2 open", "window update", "tab 2 update"]);

	created.tabIndex = 2;
	created.onTabChange?.();
	t.deepEqual(hits, ["window open", "tab 2 open", "window update", "tab 2 update", "tab 2 close", "tab 3 open"]);

	hits.length = 0;
	created.onUpdate?.();
	t.deepEqual(hits, ["window update", "tab 3 update"]);

	hits.length = 0;
	created.tabIndex = 0;
	created.onTabChange?.();
	t.deepEqual(hits, ["tab 3 close", "tab 1 open"]);

	hits.length = 0;
	created.onClose?.();
	t.deepEqual(hits, ["window close", "tab 1 close"]);
});


test("Window and tab events with static content execute", t =>
{
	global.ui = Mock.ui();

	const hits: string[] = [];
	const template = tabwindow({
		width: 200, height: 150, startingTab: 2,
		static: [ label({ text: "static" }) ],
		onOpen() { hits.push("window open"); },
		onUpdate() { hits.push("window update"); },
		onClose() { hits.push("window close"); },
		tabs: [
			tab({
				image: 456, content: [ label({ text: "1" }) ],
				onOpen() { hits.push("tab 1 open"); },
				onUpdate() { hits.push("tab 1 update"); },
				onClose() { hits.push("tab 1 close"); },
			}),
			tab({
				image: 123, content: [ label({ text: "2" }) ],
				onOpen() { hits.push("tab 2 open"); },
				onUpdate() { hits.push("tab 2 update"); },
				onClose() { hits.push("tab 2 close"); },
			}),
			tab({
				image: 884, content: [ label({ text: "3" }) ],
				onOpen() { hits.push("tab 3 open"); },
				onUpdate() { hits.push("tab 3 update"); },
				onClose() { hits.push("tab 3 close"); },
			})
		]
	});
	template.open();

	t.deepEqual(hits, ["window open", "tab 3 open"]);

	const created = (global.ui as UiMock).createdWindows[0];
	created.onUpdate?.();
	t.deepEqual(hits, ["window open", "tab 3 open", "window update", "tab 3 update"]);

	created.tabIndex = 0;
	created.onTabChange?.();
	t.deepEqual(hits, ["window open", "tab 3 open", "window update", "tab 3 update", "tab 3 close", "tab 1 open"]);

	hits.length = 0;
	created.onUpdate?.();
	t.deepEqual(hits, ["window update", "tab 1 update"]);

	hits.length = 0;
	created.tabIndex = 1;
	created.onTabChange?.();
	t.deepEqual(hits, ["tab 1 close", "tab 2 open"]);

	hits.length = 0;
	created.onClose?.();
	t.deepEqual(hits, ["window close", "tab 2 close"]);
});