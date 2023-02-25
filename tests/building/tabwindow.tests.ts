/// <reference path="../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { tab } from "@src/building/tabs/tab";
import { tabwindow } from "@src/building/tabs/tabWindow";
import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Colour } from "@src/utilities/colour";
import test from "ava";
import Mock, { UiMock } from "openrct2-mocks";

test("Window with tabs and widgets", t =>
{
	globalThis.ui = Mock.ui();

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

	const created = (globalThis.ui as UiMock).createdWindows[0];
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
	t.is(label1.y, 10 + 2 + 15);
	t.is(label1.width, 200 - (20 + 1));
	t.is(label1.height, 14);

	const label2 = created.widgets[1] as LabelWidget;
	t.is(label2.type, "label");
	t.is(label2.text, "tab 2");
	t.is(label2.x, 10);
	t.is(label2.y, 10 + 2 + 44);
	t.is(label2.width, 200 - (20 + 1));
	t.is(label2.height, 14);
});


test("Window and tab events execute", t =>
{
	globalThis.ui = Mock.ui();

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

	const created = (globalThis.ui as UiMock).createdWindows[0];
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
	globalThis.ui = Mock.ui();

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

	const created = (globalThis.ui as UiMock).createdWindows[0];
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


test("Window layouts with tabs", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 200, height: 150, padding: 30, startingTab: 1,
		tabs: [
			tab({
				image: 456, padding: 5, spacing: 10, direction: LayoutDirection.Horizontal, content: [ label({ text: "label 1", width: 40 }), button({ text: "button 1" }) ]
			}),
			tab({
				image: 123, padding: 2, spacing: 22, direction: LayoutDirection.Vertical, content: [ label({ text: "label 2" }), button({ text: "button 2" }) ]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	const secondTab = <LabelWidget[]>created.widgets;
	t.is(secondTab[0].text, "label 2");
	t.is(secondTab[0].x, 30 + 2);
	t.is(secondTab[0].y, 30 + 2 + 2 + 44); // 44px topbar
	t.is(secondTab[0].width, (200 - (1 + 60 + 4)));
	t.is(secondTab[0].height, 14);
	t.is(secondTab[1].text, "button 2");
	t.is(secondTab[1].x, 30 + 2);
	t.is(secondTab[1].y, 30 + 2 + 14 + 22 + 44); // 44px topbar
	t.is(secondTab[1].width, (200 - (1 + 60 + 4)));
	t.is(secondTab[1].height, (150 - (1 + 60 + 4 + 22 + 14 + 44)));

	created.tabIndex = 0;
	created.onTabChange?.();

	const firstTab = <LabelWidget[]>created.widgets;
	t.is(firstTab[0].text, "label 1");
	t.is(firstTab[0].x, 30 + 5);
	t.is(firstTab[0].y, 30 + 2 + 5 + 44); // 44px topbar
	t.is(firstTab[0].width, 40);
	t.is(firstTab[0].height, 14);
	t.is(firstTab[1].text, "button 1");
	t.is(firstTab[1].x, 30 + 5 + 40 + 10);
	t.is(firstTab[1].y, 30 + 5 + 44); // 44px topbar
	t.is(firstTab[1].width, (200 - (1 + 60 + 10 + 40 + 10)));
	t.is(firstTab[1].height, (150 - (1 + 60 + 10 + 44)));

	created.tabIndex = 1;
	created.onTabChange?.();

	const secondTabAgain = <LabelWidget[]>created.widgets;
	t.is(secondTabAgain[0].text, "label 2");
	t.is(secondTabAgain[0].x, 30 + 2);
	t.is(secondTabAgain[0].y, 30 + 2 + 2 + 44); // 44px topbar
	t.is(secondTabAgain[0].width, (200 - (1 + 60 + 4)));
	t.is(secondTabAgain[0].height, 14);
	t.is(secondTabAgain[1].text, "button 2");
	t.is(secondTabAgain[1].x, 30 + 2);
	t.is(secondTabAgain[1].y, 30 + 2 + 14 + 22 + 44); // 44px topbar
	t.is(secondTabAgain[1].width, (200 - (1 + 60 + 4)));
	t.is(secondTabAgain[1].height, (150 - (1 + 60 + 4 + 22 + 14 + 44)));
});


test("Window layouts with tabs and static", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 200, height: 150, padding: 30, startingTab: 1,
		static: { padding: 12, spacing: 25, direction: LayoutDirection.Horizontal, content: [ label({ text: "static label", width: 35 }), button({ text: "static button" }) ] },
		tabs: [
			tab({
				image: 456, padding: 5, spacing: 10, direction: LayoutDirection.Horizontal, content: [ label({ text: "label 1", width: 40 }), button({ text: "button 1" }) ]
			}),
			tab({
				image: 123, padding: 2, spacing: 22, direction: LayoutDirection.Vertical, content: [ label({ text: "label 2" }), button({ text: "button 2" }) ]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	function assertStaticWidgets(widgets: LabelWidget[]): void
	{
		t.is(widgets[0].text, "static label");
		t.is(widgets[0].x, 30 + 12);
		t.is(widgets[0].y, 30 + 2 + 12 + 15); // 15px topbar
		t.is(widgets[0].width, 35);
		t.is(widgets[0].height, 14);
		t.is(widgets[1].text, "static button");
		t.is(widgets[1].x, 30 + 12 + 35 + 25);
		t.is(widgets[1].y, 30 + 12 + 15); // 15px topbar
		t.is(widgets[1].width, (200 - (1 + 60 + 24 + 25 + 35)));
		t.is(widgets[1].height, (150 - (1 + 60 + 24 + 15)));
	}

	const secondTab = <LabelWidget[]>created.widgets;
	assertStaticWidgets(secondTab);
	t.is(secondTab[2].text, "label 2");
	t.is(secondTab[2].x, 30 + 2);
	t.is(secondTab[2].y, 30 + 2 + 2 + 44); // 44px topbar
	t.is(secondTab[2].width, (200 - (1 + 60 + 4)));
	t.is(secondTab[2].height, 14);
	t.is(secondTab[3].text, "button 2");
	t.is(secondTab[3].x, 30 + 2);
	t.is(secondTab[3].y, 30 + 2 + 14 + 22 + 44); // 44px topbar
	t.is(secondTab[3].width, (200 - (1 + 60 + 4)));
	t.is(secondTab[3].height, (150 - (1 + 60 + 4 + 22 + 14 + 44)));

	created.tabIndex = 0;
	created.onTabChange?.();

	const firstTab = <LabelWidget[]>created.widgets;
	assertStaticWidgets(firstTab);
	t.is(firstTab[2].text, "label 1");
	t.is(firstTab[2].x, 30 + 5);
	t.is(firstTab[2].y, 30 + 2 + 5 + 44); // 44px topbar
	t.is(firstTab[2].width, 40);
	t.is(firstTab[2].height, 14);
	t.is(firstTab[3].text, "button 1");
	t.is(firstTab[3].x, 30 + 5 + 40 + 10);
	t.is(firstTab[3].y, 30 + 5 + 44); // 44px topbar
	t.is(firstTab[3].width, (200 - (1 + 60 + 10 + 40 + 10)));
	t.is(firstTab[3].height, (150 - (1 + 60 + 10 + 44)));

	created.tabIndex = 1;
	created.onTabChange?.();

	const secondTabAgain = <LabelWidget[]>created.widgets;
	assertStaticWidgets(secondTabAgain);
	t.is(secondTabAgain[2].text, "label 2");
	t.is(secondTabAgain[2].x, 30 + 2);
	t.is(secondTabAgain[2].y, 30 + 2 + 2 + 44); // 44px topbar
	t.is(secondTabAgain[2].width, (200 - (1 + 60 + 4)));
	t.is(secondTabAgain[2].height, 14);
	t.is(secondTabAgain[3].text, "button 2");
	t.is(secondTabAgain[3].x, 30 + 2);
	t.is(secondTabAgain[3].y, 30 + 2 + 14 + 22 + 44); // 44px topbar
	t.is(secondTabAgain[3].width, (200 - (1 + 60 + 4)));
	t.is(secondTabAgain[3].height, (150 - (1 + 60 + 4 + 22 + 14 + 44)));
});


test("Window and tab rebind to stores on each tab change", t =>
{
	globalThis.ui = Mock.ui();

	const tooltipStore = store("hello");
	const template = tabwindow({
		width: 200, height: 150,
		static: [ label({ text: "static", tooltip: tooltipStore }) ],
		tabs: [
			tab({
				image: 456, content: [ label({ text: "1", tooltip: tooltipStore }) ]
			}),
			tab({
				image: 123, content: [ label({ text: "2", tooltip: tooltipStore }) ]
			}),
			tab({
				image: 884, content: [ label({ text: "3", tooltip: tooltipStore }) ]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	const firstTab = <LabelWidget[]>created.widgets;
	t.is(firstTab[0].text, "static");
	t.is(firstTab[0].tooltip, "hello");
	t.is(firstTab[1].text, "1");
	t.is(firstTab[1].tooltip, "hello");

	created.tabIndex = 2;
	const thirdTab = <LabelWidget[]>created.widgets;
	t.is(thirdTab[1].text, "3");
	t.is(thirdTab[1].tooltip, "hello"); // from creation

	created.onTabChange?.();
	t.is(thirdTab[0].text, "static");
	t.is(thirdTab[0].tooltip, "hello");
	t.is(thirdTab[1].text, "3");
	t.is(thirdTab[1].tooltip, "hello");

	tooltipStore.set("wow new");
	t.is(thirdTab[0].text, "static");
	t.is(thirdTab[0].tooltip, "wow new");
	t.is(thirdTab[1].text, "3");
	t.is(thirdTab[1].tooltip, "wow new");
	t.is(firstTab[0].text, "static");
	t.is(firstTab[0].tooltip, "wow new");
	t.is(firstTab[1].text, "1");
	t.is(firstTab[1].tooltip, "hello");

	created.tabIndex = 1;
	const secondTab = <LabelWidget[]>created.widgets;
	t.is(secondTab[0].text, "static");
	t.is(secondTab[0].tooltip, "wow new");
	t.is(secondTab[1].text, "2");
	t.is(secondTab[1].tooltip, "hello"); // from creation

	tooltipStore.set("excite");
	created.onTabChange?.();
	t.is(firstTab[0].text, "static");
	t.is(firstTab[0].tooltip, "excite");
	t.is(firstTab[1].text, "1");
	t.is(firstTab[1].tooltip, "hello");
	t.is(secondTab[0].text, "static");
	t.is(secondTab[0].tooltip, "excite");
	t.is(secondTab[1].text, "2");
	t.is(secondTab[1].tooltip, "excite");
	t.is(thirdTab[0].text, "static");
	t.is(thirdTab[0].tooltip, "excite");
	t.is(thirdTab[1].text, "3");
	t.is(thirdTab[1].tooltip, "excite");

	created.close();
	tooltipStore.set("no one will see this");

	t.is(firstTab[0].text, "static");
	t.is(firstTab[0].tooltip, "excite");
	t.is(firstTab[1].text, "1");
	t.is(firstTab[1].tooltip, "hello");
	t.is(secondTab[0].text, "static");
	t.is(secondTab[0].tooltip, "excite");
	t.is(secondTab[1].text, "2");
	t.is(secondTab[1].tooltip, "excite");
	t.is(thirdTab[0].text, "static");
	t.is(thirdTab[0].tooltip, "excite");
	t.is(thirdTab[1].text, "3");
	t.is(thirdTab[1].tooltip, "excite");
});