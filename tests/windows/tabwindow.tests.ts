/// <reference path="../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { ElementVisibility } from "@src/elements/elementParams";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Colour } from "@src/utilities/colour";
import { tab } from "@src/windows/tabs/tab";
import { tabwindow } from "@src/windows/tabs/tabWindow";
import test from "ava";
import Mock, { UiMock, WindowMock } from "openrct2-mocks";
import { call } from "tests/helpers";


test("Window with one tab and one absolute widget", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 120, height: 70, padding: 10,
		tabs: [
			tab({
				image: 11,
				content: [
					button({
						text: "hello world",
						width: 40,
						height: 25
					}),
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.width, 120);
	t.is(created.height, 70);
	t.is(created.widgets.length, 1);
	t.is(created.tabIndex, 0);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "hello world");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 44);
	t.is(button1.width, 40);
	t.is(button1.height, 25);
});


test("Window with viewmodel", t =>
{
	globalThis.ui = Mock.ui();

	class Model
	{
		title = store("better window");
		text = store("hello world");
	}

	const template = tabwindow<Model>(model =>
	({
		title: model.title,
		width: 120, height: 70, padding: 10,
		tabs: [
			tab({
				image: 11,
				content: [
					button({
						text: model.text,
						width: 40,
						height: 25
					}),
				]
			})
		]
	}));

	const model = new Model();
	template.open(model);

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.width, 120);
	t.is(created.height, 70);
	t.is(created.widgets.length, 1);
	t.is(created.tabIndex, 0);
	t.is(created.title, "better window");

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "hello world");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 44);
	t.is(button1.width, 40);
	t.is(button1.height, 25);

	model.title.set("Another title");
	t.is(created.title, "Another title");

	model.text.set("Another button text");
	t.is(button1.text, "Another button text");
});


test("Window with one tab and one 100% widget", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 120, height: 150, padding: 10,
		tabs: [
			tab({
				image: 11,
				content: [
					button({ text: "hello world" }),
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.width, 120);
	t.is(created.height, 150);
	t.is(created.widgets.length, 1);
	t.is(created.tabIndex, 0);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "hello world");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 44);
	t.is(button1.width, 120 - 20);
	t.is(button1.height, 150 - (44 + 20));
});


test("Window with no tabs and one static absolute widget", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 200, height: 150, padding: 10,
		static: [
			button({
				text: "hello world",
				width: 50,
				height: 40
			}),
		],
		tabs: []
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.width, 200);
	t.is(created.height, 150);
	t.is(created.widgets.length, 1);
	t.is(created.tabIndex, 0);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "hello world");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 15);
	t.is(button1.width, 50);
	t.is(button1.height, 40);
});


test("Window with no tabs and one static 100% widget", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 200, height: 150, padding: 10,
		static: [
			button({ text: "hello world" }),
		],
		tabs: []
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.width, 200);
	t.is(created.height, 150);
	t.is(created.widgets.length, 1);
	t.is(created.tabIndex, 0);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "hello world");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 15);
	t.is(button1.width, 200 - 20);
	t.is(button1.height, 150 - (15 + 20));
});


test("Window with tabs errors with weighted widget in auto-sized tab", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 100, height: 120,
		tabs: [
			tab({
				image: 25, width: "auto", height: "auto",
				content: [
					button({ text: "tab 1 button"  })
				]
			})
		]
	});

	const error = t.throws(() =>
	{
		template.open();
	});
	t.is(error?.message, "Window body width must resolve to absolute size for \"auto\" window size.");
});


test("Window with tabs errors with weighted padding in auto-sized tab", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 100, height: 120,
		tabs: [
			tab({
				image: 25, width: "auto", height: "auto", padding: "1w",
				content: [
					button({ text: "tab 1 button", width: 20, height: 20 })
				]
			})
		]
	});

	const error = t.throws(() =>
	{
		template.open();
	});
	t.is(error?.message, "Window padding must be absolute for \"auto\" window size.");
});


test("Window with tabs allows weighted widget for static widget in auto-sized tab", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 100, height: 120, padding: 8,
		static:  [
			button({ text: "static button" })
		],
		tabs: [
			tab({
				image: 25, width: "auto", height: "auto",
				content: [
					button({ text: "tab 1 button", width: 35, height: 20 })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	const expectedWindowWidth = (35 + 16);
	const expectedWindowHeight = (20 + 16 + 44);
	t.is(created.width, expectedWindowWidth);
	t.is(created.height, expectedWindowHeight);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "static button");
	t.is(button1.x, 8);
	t.is(button1.y, 8 + 15);
	t.is(button1.width, 35); // should be same width and height + topbar difference
	t.is(button1.height, 20 + (44 - 15));

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.text, "tab 1 button");
	t.is(button2.x, 8);
	t.is(button2.y, 8 + 44);
	t.is(button2.width, 35);
	t.is(button2.height, 20);
});


test("Window with tabs allows weighted widget and padding for static widget in auto-sized tab", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 100, height: 120, padding: 8,
		static: {
			padding: "10%",
			content: [
				button({ text: "static button" })
			]
		},
		tabs: [
			tab({
				image: 25, width: "auto", height: "auto", padding: 3,
				content: [
					button({ text: "tab 1 button", width: 35, height: 20 })
				]
			})
		]
	});
	template.open();

	function verify(window: WindowMock): void
	{
		const expectedWindowWidth = (35 + 6 + 16);
		const expectedWindowHeight = (20 + 6 + 16 + 44);
		t.is(window.width, expectedWindowWidth);
		t.is(window.height, expectedWindowHeight);

		const button1 = window.widgets[0] as ButtonWidget;
		t.is(button1.text, "static button");
		t.is(button1.x, 8 + 4); // 10% = 4.1 of (35 + 6)
		t.is(button1.y, 8 + 6 + 15); // 10% = 5.5 of (20 + 6 + (44 - 15))
		t.is(button1.width, expectedWindowWidth - (16 + 8));
		t.is(button1.height, expectedWindowHeight - (16 + 11 + 15));

		const button2 = window.widgets[1] as ButtonWidget;
		t.is(button2.text, "tab 1 button");
		t.is(button2.x, 8 + 3);
		t.is(button2.y, 8 + 3 + 44);
		t.is(button2.width, 35);
		t.is(button2.height, 20);
	}

	const created = (globalThis.ui as UiMock).createdWindows[0];
	verify(created);

	call(created.onUpdate);
	verify(created);
});


test("Window with multiple tabs, widgets, title and colours", t =>
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
	t.is(label1.width, 200 - 20);
	t.is(label1.height, 14);

	const label2 = created.widgets[1] as LabelWidget;
	t.is(label2.type, "label");
	t.is(label2.text, "tab 2");
	t.is(label2.x, 10);
	t.is(label2.y, 10 + 2 + 44);
	t.is(label2.width, 200 - 20);
	t.is(label2.height, 14);
});


test("Window with tabs and static includes all paddings", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 500, height: 400, padding: 10,
		static: {
			padding: 7,
			content: [
				button({ text: "static button"})
			]
		},
		tabs: [
			tab({
				image: 25, width: 150, height: 275, padding: 4,
				content: [
					button({ text: "tab 1 button" })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 150);
	t.is(created.height, 275);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "static button");
	t.is(button1.x, 10 + 7);
	t.is(button1.y, 10 + 7 + 15);
	t.is(button1.width, 150 - (20 + 14));
	t.is(button1.height, 275 - (20 + 14 + 15));

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.text, "tab 1 button");
	t.is(button2.x, 10 + 4);
	t.is(button2.y, 10 + 4 + 44);
	t.is(button2.width, 150 - (20 + 8));
	t.is(button2.height, 275 - (20 + 8 + 44));
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
	call(created.onUpdate);
	t.deepEqual(hits, ["window open", "tab 2 open", "window update", "tab 2 update"]);

	created.tabIndex = 2;
	call(created.onTabChange);
	t.deepEqual(hits, ["window open", "tab 2 open", "window update", "tab 2 update", "tab 2 close", "tab 3 open"]);

	hits.length = 0;
	call(created.onUpdate);
	t.deepEqual(hits, ["window update", "tab 3 update"]);

	hits.length = 0;
	created.tabIndex = 0;
	call(created.onTabChange);
	t.deepEqual(hits, ["tab 3 close", "tab 1 open"]);

	hits.length = 0;
	call(created.onClose);
	t.deepEqual(hits, ["window close", "tab 1 close"]);
});


test("Window close method calls on close event", t =>
{
	globalThis.ui = Mock.ui();

	const calls: string[] = [];
	const template = tabwindow({
		title: "test window", width: 150, height: 100,
		tabs: [],
		onClose: () => calls.push("close it")
	});
	const instance = template.open();
	instance.close();

	t.deepEqual(calls, [ "close it" ]);
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
	call(created.onUpdate);
	t.deepEqual(hits, ["window open", "tab 3 open", "window update", "tab 3 update"]);

	created.tabIndex = 0;
	call(created.onTabChange);
	t.deepEqual(hits, ["window open", "tab 3 open", "window update", "tab 3 update", "tab 3 close", "tab 1 open"]);

	hits.length = 0;
	call(created.onUpdate);
	t.deepEqual(hits, ["window update", "tab 1 update"]);

	hits.length = 0;
	created.tabIndex = 1;
	call(created.onTabChange);
	t.deepEqual(hits, ["tab 1 close", "tab 2 open"]);

	hits.length = 0;
	call(created.onClose);
	t.deepEqual(hits, ["window close", "tab 2 close"]);
});


test("Window layouts with tabs and static with padding", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 200, height: 150, padding: 30, startingTab: 1,
		tabs: [
			tab({
				image: 456, padding: 5, spacing: 10, direction: LayoutDirection.Horizontal,
				content: [
					label({ text: "label 1", width: 40 }),
					button({ text: "button 1" })
				]
			}),
			tab({
				image: 123, padding: 2, spacing: 22, direction: LayoutDirection.Vertical,
				content: [
					label({ text: "label 2" }),
					button({ text: "button 2" })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	const secondTab = <LabelWidget[]>created.widgets;
	t.is(secondTab[0].text, "label 2");
	t.is(secondTab[0].x, 30 + 2);
	t.is(secondTab[0].y, 30 + 2 + 2 + 44); // 44px topbar
	t.is(secondTab[0].width, (200 - (60 + 4)));
	t.is(secondTab[0].height, 14);
	t.is(secondTab[1].text, "button 2");
	t.is(secondTab[1].x, 30 + 2);
	t.is(secondTab[1].y, 30 + 2 + 14 + 22 + 44); // 44px topbar
	t.is(secondTab[1].width, (200 - (60 + 4)));
	t.is(secondTab[1].height, (150 - (60 + 4 + 22 + 14 + 44)));

	created.tabIndex = 0;
	call(created.onTabChange);

	const firstTab = <LabelWidget[]>created.widgets;
	t.is(firstTab[0].text, "label 1");
	t.is(firstTab[0].x, 30 + 5);
	t.is(firstTab[0].y, 30 + 2 + 5 + 44); // 44px topbar
	t.is(firstTab[0].width, 40);
	t.is(firstTab[0].height, 14);
	t.is(firstTab[1].text, "button 1");
	t.is(firstTab[1].x, 30 + 5 + 40 + 10);
	t.is(firstTab[1].y, 30 + 5 + 44); // 44px topbar
	t.is(firstTab[1].width, (200 - (60 + 10 + 40 + 10)));
	t.is(firstTab[1].height, (150 - (60 + 10 + 44)));

	created.tabIndex = 1;
	call(created.onTabChange);

	const secondTabAgain = <LabelWidget[]>created.widgets;
	t.is(secondTabAgain[0].text, "label 2");
	t.is(secondTabAgain[0].x, 30 + 2);
	t.is(secondTabAgain[0].y, 30 + 2 + 2 + 44); // 44px topbar
	t.is(secondTabAgain[0].width, (200 - (60 + 4)));
	t.is(secondTabAgain[0].height, 14);
	t.is(secondTabAgain[1].text, "button 2");
	t.is(secondTabAgain[1].x, 30 + 2);
	t.is(secondTabAgain[1].y, 30 + 2 + 14 + 22 + 44); // 44px topbar
	t.is(secondTabAgain[1].width, (200 - (60 + 4)));
	t.is(secondTabAgain[1].height, (150 - (60 + 4 + 22 + 14 + 44)));
});


test("Window layouts with tabs and static", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 200, height: 150, padding: 30, startingTab: 1,
		static: {
			padding: 12, spacing: 25, direction: LayoutDirection.Horizontal,
			content: [
				label({ text: "static label", width: 35 }),
				button({ text: "static button" })
			]
		},
		tabs: [
			tab({
				image: 456, padding: 5, spacing: 10, direction: LayoutDirection.Horizontal,
				content: [
					label({ text: "label 1", width: 40 }),
					button({ text: "button 1" })
				]
			}),
			tab({
				image: 123, padding: 2, spacing: 22, direction: LayoutDirection.Vertical,
				content: [
					label({ text: "label 2" }),
					button({ text: "button 2" })
				]
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
		t.is(widgets[1].width, (200 - (60 + 24 + 25 + 35)));
		t.is(widgets[1].height, (150 - (60 + 24 + 15)));
	}

	const secondTab = <LabelWidget[]>created.widgets;
	assertStaticWidgets(secondTab);
	t.is(secondTab[2].text, "label 2");
	t.is(secondTab[2].x, 30 + 2);
	t.is(secondTab[2].y, 30 + 2 + 2 + 44); // 44px topbar
	t.is(secondTab[2].width, (200 - (60 + 4)));
	t.is(secondTab[2].height, 14);
	t.is(secondTab[3].text, "button 2");
	t.is(secondTab[3].x, 30 + 2);
	t.is(secondTab[3].y, 30 + 2 + 14 + 22 + 44); // 44px topbar
	t.is(secondTab[3].width, (200 - (60 + 4)));
	t.is(secondTab[3].height, (150 - (60 + 4 + 22 + 14 + 44)));

	created.tabIndex = 0;
	call(created.onTabChange);

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
	t.is(firstTab[3].width, (200 - (60 + 10 + 40 + 10)));
	t.is(firstTab[3].height, (150 - (60 + 10 + 44)));

	created.tabIndex = 1;
	call(created.onTabChange);

	const secondTabAgain = <LabelWidget[]>created.widgets;
	assertStaticWidgets(secondTabAgain);
	t.is(secondTabAgain[2].text, "label 2");
	t.is(secondTabAgain[2].x, 30 + 2);
	t.is(secondTabAgain[2].y, 30 + 2 + 2 + 44); // 44px topbar
	t.is(secondTabAgain[2].width, (200 - (60 + 4)));
	t.is(secondTabAgain[2].height, 14);
	t.is(secondTabAgain[3].text, "button 2");
	t.is(secondTabAgain[3].x, 30 + 2);
	t.is(secondTabAgain[3].y, 30 + 2 + 14 + 22 + 44); // 44px topbar
	t.is(secondTabAgain[3].width, (200 - (60 + 4)));
	t.is(secondTabAgain[3].height, (150 - (60 + 4 + 22 + 14 + 44)));
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

	call(created.onTabChange);
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
	call(created.onTabChange);
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


test("Window is sized to tab size", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 240, height: 160, padding: 10,
		tabs:[
			tab({
				image: 25,
				width: 450, height: 300, padding: 25,
				content: [
					button({ text: "tab button" })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 450);
	t.is(created.height, 300);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "tab button");
	t.is(button1.x, 25 + 10);
	t.is(button1.y, 25 + 10 + 44);
	t.is(button1.width, 450 - (50 + 20));
	t.is(button1.height, 300 - (50 + 20 + 44));
});


test("Window with tabs adjusts to resize", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: { value: 200, min: 100, max: 500 },
		height: { value: 180, min: 50, max: 400 },
		padding: 10,
		static: [
			button({ text: "static button" })
		],
		tabs:[
			tab({
				image: 25,
				content: [
					button({ text: "tab button" })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 200);
	t.is(created.height, 180);
	t.is(created.minWidth, 100);
	t.is(created.minHeight, 50);
	t.is(created.maxWidth, 500);
	t.is(created.maxHeight, 400);

	created.width = 400;
	created.height = 300;
	call(created.onUpdate);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "static button");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 15);
	t.is(button1.width, 400 - 20);
	t.is(button1.height, 300 - (20 + 15));

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.text, "tab button");
	t.is(button2.x, 10);
	t.is(button2.y, 10 + 44);
	t.is(button2.width, 400 - 20);
	t.is(button2.height, 300 - (20 + 44));
});


test("Window with tabs does not resize if size has not changed", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: { value: 200, min: 100, max: 500 },
		height: { value: 180, min: 50, max: 400 },
		padding: 10,
		static: [
			button({ text: "static button" })
		],
		tabs:[
			tab({
				image: 25,
				content: [
					button({ text: "tab button" })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	call(created.onUpdate);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "static button");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 15);
	t.is(button1.width, 200 - 20);
	t.is(button1.height, 180 - (20 + 15));

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.text, "tab button");
	t.is(button2.x, 10);
	t.is(button2.y, 10 + 44);
	t.is(button2.width, 200 - 20);
	t.is(button2.height, 180 - (20 + 44));
});


test("Window with tabs does auto resizes to tab content", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: "auto", height: "auto", padding: 10,
		static: [
			button({ text: "static button", width: 500, height: 800 })
		],
		tabs:[
			tab({
				image: 25,
				content: [
					button({ text: "tab button", width: 175, height: 60 })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 175 + 20);
	t.is(created.height, 60 + 20 + 44);
	t.is(created.minWidth, created.width);
	t.is(created.minHeight, created.height);
	t.is(created.maxWidth, created.width);
	t.is(created.maxHeight, created.height);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "static button");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 15);
	t.is(button1.width, 500);
	t.is(button1.height, 800);

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.text, "tab button");
	t.is(button2.x, 10);
	t.is(button2.y, 10 + 44);
	t.is(button2.width, 175);
	t.is(button2.height, 60);
});


test("Window with tabs does auto resizes when tabs switch", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: "auto", height: "auto", padding: 10,
		startingTab: 1,
		tabs: [
			tab({
				image: 25,
				content: [
					button({ text: "tab 1 button", width: 100, height: 50 })
				]
			}),
			tab({
				image: 35,
				content: [
					button({ text: "tab 2 button", width: 20, height: 70 })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 20 + 20);
	t.is(created.height, 70 + 20 + 44);
	t.is(created.minWidth, created.width);
	t.is(created.minHeight, created.height);
	t.is(created.maxWidth, created.width);
	t.is(created.maxHeight, created.height);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "tab 2 button");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 44);
	t.is(button1.width, 20);
	t.is(button1.height, 70);

	created.tabIndex = 0;
	call(created.onTabChange);

	t.is(created.width, 100 + 20);
	t.is(created.height, 50 + 20 + 44);
	t.is(created.minWidth, created.width);
	t.is(created.minHeight, created.height);
	t.is(created.maxWidth, created.width);
	t.is(created.maxHeight, created.height);

	const button2 = created.widgets[0] as ButtonWidget;
	t.is(button2.text, "tab 1 button");
	t.is(button2.x, 10);
	t.is(button2.y, 10 + 44);
	t.is(button2.width, 100);
	t.is(button2.height, 50);
});


test("Window with tabs does single redraw after tabs switch", t =>
{
	globalThis.ui = Mock.ui();

	const hits: string[] = [];
	const template = tabwindow({
		width: "auto", height: "auto", padding: 10,
		tabs: [
			tab({
				image: 25,
				content: [
					button({ text: "tab 1 button", width: 100, height: 50 })
				]
			}),
			tab({
				image: 35,
				content: [
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(parent, output): any =>
					{
						output.on("redraw", () => hits.push("redraw"));
						const btn = button({ text: "tab 2 button", width: 20, height: 70 });
						return btn(parent, output);
					}
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	call(created.onUpdate);
	t.deepEqual(hits, []);

	created.tabIndex = 1;
	call(created.onTabChange);
	t.deepEqual(hits, [ "redraw" ]);

	call(created.onUpdate);
	t.deepEqual(hits, [ "redraw" ]);
});


test("Window with tabs can do layouts when tabs switch", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: "auto", height: "auto", padding: 10,
		tabs: [
			tab({
				image: 25,
				content: [
					button({ text: "tab 1 button", width: 100, height: 50 })
				]
			}),
			tab({
				image: 35,
				content: [
					button({ text: "tab 2 button", width: 20, height: 70 })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "tab 1 button");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 44);
	t.is(button1.width, 100);
	t.is(button1.height, 50);

	created.tabIndex = 1;
	call(created.onTabChange);
	call(created.onUpdate);

	const button2 = created.widgets[0] as ButtonWidget;
	t.is(button2.text, "tab 2 button");
	t.is(button2.x, 10);
	t.is(button2.y, 10 + 44);
	t.is(button2.width, 20);
	t.is(button2.height, 70);

	created.tabIndex = 0;
	call(created.onTabChange);
	call(created.onUpdate);

	const button3 = created.widgets[0] as ButtonWidget;
	t.is(button3.text, "tab 1 button");
	t.is(button3.x, 10);
	t.is(button3.y, 10 + 44);
	t.is(button3.width, 100);
	t.is(button3.height, 50);
});


test("Window with tabs has auto static widgets with pixel tab size", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: "auto", height: "auto", padding: 10,
		static: [
			button({ text: "static button" })
		],
		tabs: [
			tab({
				image: 25, width: 400, height: 350,
				content: [
					button({ text: "tab 1 button" })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 400);
	t.is(created.height, 350);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "static button");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 15);
	t.is(button1.width, 400 - 20);
	t.is(button1.height, 350 - (20 + 15));

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.text, "tab 1 button");
	t.is(button2.x, 10);
	t.is(button2.y, 10 + 44);
	t.is(button2.width, 400 - 20);
	t.is(button2.height, 350 - (20 + 44));
});


test("Window with tabs has pixel static widgets in auto container with pixel tab size", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: "auto", height: "auto", padding: 10,
		static: [
			button({ text: "static button", width: 120, height: 85 })
		],
		tabs: [
			tab({
				image: 25, width: 400, height: 350,
				content: [
					button({ text: "tab 1 button" })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 400);
	t.is(created.height, 350);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "static button");
	t.is(button1.x, 10);
	t.is(button1.y, 10 + 15);
	t.is(button1.width, 120);
	t.is(button1.height, 85);

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.text, "tab 1 button");
	t.is(button2.x, 10);
	t.is(button2.y, 10 + 44);
	t.is(button2.width, 400 - 20);
	t.is(button2.height, 350 - (20 + 44));
});


test("Window with tabs has weighted static widgets with auto tab size", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 100, height: 120, padding: 12,
		static: {
			padding: 7,
			content: [
				button({ text: "static button" })
			]
		},
		tabs: [
			tab({
				image: 25, width: "auto", height: "auto", padding: 3,
				content: [
					button({ text: "tab 1 button", width: 230, height: 135 })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	const expectedWindowWidth = (230 + 24 + 6);
	const expectedWindowHeight = (135 + 24 + 6 + 44);
	t.is(created.width, expectedWindowWidth);
	t.is(created.height, expectedWindowHeight);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.text, "static button");
	t.is(button1.x, 12 + 7);
	t.is(button1.y, 12 + 7 + 15);
	t.is(button1.width, expectedWindowWidth - (24 + 14));
	t.is(button1.height, expectedWindowHeight - (24 + 14 + 15));

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.text, "tab 1 button");
	t.is(button2.x, 12 + 3);
	t.is(button2.y, 12 + 3 + 44);
	t.is(button2.width, 230);
	t.is(button2.height, 135);
});


test("Window with tabs has mixed static widgets in auto container with multiple pixel size tabs", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: "auto", height: "auto", padding: 10, startingTab: 1,
		static: {
			spacing: 7,
			content: [
				button({ text: "static pixel button", width: 40, height: 30 }),
				button({ text: "static weighted button" })
			]
		},
		tabs: [
			tab({
				image: 25, width: 400, height: 350,
				content: [
					button({ text: "tab 1 button" })
				]
			}),
			tab({
				image: 28, width: 170, height: 220,
				content: [
					button({ text: "tab 2 button" })
				]
			}),
			tab({
				image: 30, width: { value: 200, min: 100, max: 250 }, height: { value: 225, min: 50, max: 300 },
				content: [
					button({ text: "tab 3 button" })
				]
			})
		]
	});
	template.open();

	function verifyWindow(window: WindowMock, expectedWidth: number, expectedHeight: number, name: string): void
	{
		t.is(window.width, expectedWidth);
		t.is(window.height, expectedHeight);

		const tab = created.widgets as ButtonWidget[];
		t.is(tab[0].text, "static pixel button");
		t.is(tab[0].x, 10);
		t.is(tab[0].y, 10 + 15);
		t.is(tab[0].width, 40);
		t.is(tab[0].height, 30);
		t.is(tab[1].text, "static weighted button");
		t.is(tab[1].x, 10);
		t.is(tab[1].y, 10 + 15 + 30 + 7);
		t.is(tab[1].width, expectedWidth - 20);
		t.is(tab[1].height, expectedHeight - (20 + 15 + 30 + 7));
		t.is(tab[2].text, `${name} button`);
		t.is(tab[2].x, 10);
		t.is(tab[2].y, 10 + 44);
		t.is(tab[2].width, expectedWidth - 20);
		t.is(tab[2].height, expectedHeight - (20 + 44));
	}

	const created = (globalThis.ui as UiMock).createdWindows[0];
	verifyWindow(created, 170, 220, "tab 2");

	created.tabIndex = 0;
	call(created.onTabChange);
	verifyWindow(created, 400, 350, "tab 1");

	call(created.onUpdate);
	verifyWindow(created, 400, 350, "tab 1");

	created.tabIndex = 2;
	call(created.onTabChange);
	verifyWindow(created, 200, 225, "tab 3");
	t.is(created.minWidth, 100);
	t.is(created.maxWidth, 250);
	t.is(created.minHeight, 50);
	t.is(created.maxHeight, 300);
});


test("Window with tabs has mixed static widgets in pixel container with multiple size tabs", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 450, height: 370, padding: 12, startingTab: 2,
		static: {
			spacing: 7,
			content: [
				button({ text: "static pixel button", width: 40, height: 30 }),
				button({ text: "static weighted button" })
			]
		},
		tabs: [
			tab({
				image: 25, width: "auto", height: "auto",
				content: [
					button({ text: "tab 1 button", width: 120, height: 40 })
				]
			}),
			tab({
				image: 28, width: "inherit", height: "inherit",
				content: [
					button({ text: "tab 2 button" })
				]
			}),
			tab({
				image: 29, width: 250, height: 350,
				content: [
					button({ text: "tab 3 button" })
				]
			}),
			tab({
				image: 30, width: { value: 200, min: 100, max: 250 }, height: { value: 225, min: 50, max: 300 },
				content: [
					button({ text: "tab 4 button" })
				]
			}),
			tab({
				image: 58,
				content: [
					button({ text: "tab 5 button" })
				]
			})
		]
	});
	template.open();

	function verifyWindow(window: WindowMock, expectedWidth: number, expectedHeight: number, name: string): void
	{
		t.is(window.width, expectedWidth);
		t.is(window.height, expectedHeight);

		const tab = created.widgets as ButtonWidget[];
		t.is(tab[0].text, "static pixel button");
		t.is(tab[0].x, 12);
		t.is(tab[0].y, 12 + 15);
		t.is(tab[0].width, 40);
		t.is(tab[0].height, 30);
		t.is(tab[1].text, "static weighted button");
		t.is(tab[1].x, 12);
		t.is(tab[1].y, 12 + 15 + 30 + 7);
		t.is(tab[1].width, expectedWidth - 24);
		t.is(tab[1].height, expectedHeight - (24 + 15 + 30 + 7));
		t.is(tab[2].text, `${name} button`);
		t.is(tab[2].x, 12);
		t.is(tab[2].y, 12 + 44);
		t.is(tab[2].width, expectedWidth - 24);
		t.is(tab[2].height, expectedHeight - (24 + 44));
	}

	const created = (globalThis.ui as UiMock).createdWindows[0];
	verifyWindow(created, 250, 350, "tab 3");

	call(created.onUpdate);
	verifyWindow(created, 250, 350, "tab 3");

	created.tabIndex = 0;
	call(created.onTabChange);
	verifyWindow(created, 120 + 24, 40 + 24 + 44, "tab 1");

	call(created.onUpdate);
	verifyWindow(created, 120 + 24, 40 + 24 + 44, "tab 1");

	created.tabIndex = 1;
	call(created.onTabChange);
	verifyWindow(created, 450, 370, "tab 2");

	call(created.onUpdate);
	verifyWindow(created, 450, 370, "tab 2");

	created.tabIndex = 3;
	call(created.onTabChange);
	verifyWindow(created, 200, 225, "tab 4");
	t.is(created.minWidth, 100);
	t.is(created.maxWidth, 250);
	t.is(created.minHeight, 50);
	t.is(created.maxHeight, 300);

	call(created.onUpdate);
	verifyWindow(created, 200, 225, "tab 4");

	created.tabIndex = 4;
	call(created.onTabChange);
	verifyWindow(created, 450, 370, "tab 5");

	call(created.onUpdate);
	verifyWindow(created, 450, 370, "tab 5");
});


test("Window with tabs relayouts static on tab switch if window size changed", t =>
{
	globalThis.ui = Mock.ui();

	const template = tabwindow({
		width: 500, height: 400, padding: 10,
		static: {
			padding: 7,
			content: [
				button({ text: "static button"})
			]
		},
		tabs: [
			tab({
				image: 25, width: 150, height: 280, padding: 4,
				content: [
					button({ text: "tab 1 button" })
				]
			}),
			tab({
				image: 35, width: 265, height: 120, padding: 12,
				content: [
					button({ text: "tab 2 button" })
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 150);
	t.is(created.height, 280);

	const firstTab = created.widgets as ButtonWidget[];
	t.is(firstTab[0].text, "static button");
	t.is(firstTab[0].x, 10 + 7);
	t.is(firstTab[0].y, 10 + 7 + 15);
	t.is(firstTab[0].width, 150 - (20 + 14));
	t.is(firstTab[0].height, 280 - (20 + 14 + 15));
	t.is(firstTab[1].text, "tab 1 button");
	t.is(firstTab[1].x, 10 + 4);
	t.is(firstTab[1].y, 10 + 4 + 44);
	t.is(firstTab[1].width, 150 - (20 + 8));
	t.is(firstTab[1].height, 280 - (20 + 8 + 44));

	created.tabIndex = 1;
	call(created.onTabChange);

	t.is(created.width, 265);
	t.is(created.height, 120);

	const secondTab = created.widgets as ButtonWidget[];
	t.is(secondTab[0].text, "static button");
	t.is(secondTab[0].x, 10 + 7);
	t.is(secondTab[0].y, 10 + 7 + 15);
	t.is(secondTab[0].width, 265 - (20 + 14));
	t.is(secondTab[0].height, 120 - (20 + 14 + 15));
	t.is(secondTab[1].text, "tab 2 button");
	t.is(secondTab[1].x, 10 + 12);
	t.is(secondTab[1].y, 10 + 12 + 44);
	t.is(secondTab[1].width, 265 - (20 + 24));
	t.is(secondTab[1].height, 120 - (20 + 24 + 44));
});


test("Window with tabs does auto resizes to body size changes", t =>
{
	globalThis.ui = Mock.ui();

	const visible = store<ElementVisibility>("visible");
	const template = tabwindow({
		width: "auto", height: "auto", padding: 6,
		tabs: [
			tab({
				image: 4, spacing: 8,
				content: [
					button({ text: "hello world", width: 100, height: 30 }),
					button({ text: "maybe hello", width: 100, height: 30, visibility: visible }),
				]
			})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 100 + 12);
	t.is(created.height, 30 + 12 + 8 + 30 + 44);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.x, 6);
	t.is(button1.y, 44 + 6);
	t.is(button1.width, 100);
	t.is(button1.height, 30);

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.x, 6);
	t.is(button2.y, 44 + 6 + 30 + 8);
	t.is(button2.width, 100);
	t.is(button2.height, 30);
	t.true(button2.isVisible);

	visible.set("none");
	call(created.onUpdate);
	t.is(created.width, 100 + 12);
	t.is(created.height, 30 + 12 + 44);

	t.is(button1.x, 6);
	t.is(button1.y, 44 + 6);
	t.is(button1.width, 100);
	t.is(button1.height, 30);

	t.false(button2.isVisible);
});


test("Window with tabs and bindings resets properly to first tab after close", t =>
{
	globalThis.ui = Mock.ui();

	const text = store("my bla");
	const template = tabwindow({
		width: 200, height: 100,
		tabs: [
			tab({ image: 3, content: [] }),
			tab({ image: 4, content: [ button({ text }) ]})
		]
	});
	template.open();

	const created1 = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created1.width, 200);
	t.is(created1.height, 100);
	t.deepEqual(created1.widgets, []);

	created1.tabIndex = 1;
	created1.onTabChange!();

	const tab1widgets = created1.widgets;
	t.is(tab1widgets.length, 1);

	const button1 = created1.widgets[0] as ButtonWidget;
	t.is(button1.x, 5);
	t.is(button1.y, 44 + 5);
	t.is(button1.width, 200 - 10);
	t.is(button1.height, 100 - (44 + 10));
	t.is(button1.text, "my bla");

	created1.onClose!();
	template.open();

	const created2 = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created2.tabIndex, 0);
	t.deepEqual(created2.widgets, []);
});
