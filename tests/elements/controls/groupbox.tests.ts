/// <reference path="../../../lib/openrct2.d.ts" />

import { button } from "@src/elements/controls/button";
import { groupbox } from "@src/elements/controls/groupbox";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 50, height: 40 + 15, padding: "4px",
		content: [
			groupbox({
				padding: "7px",
				text: "hello!",
				gap: 3,
				direction: LayoutDirection.Horizontal,
				spacing: 6,
				content: [
					button({
						text: "inside a box!"
					}),
					button({
						text: "also in the box!"
					})
				]
			})
		]
	});
	template.open();

	const widget1 = <GroupBoxWidget>mock.createdWindows[0].widgets[0];
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 4 + 7);
	t.is(widget1.y, 4 + 7 + 15);
	t.is(widget1.width, 28);
	t.is(widget1.height, 18);

	const widget2 = <ButtonWidget>mock.createdWindows[0].widgets[1];
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 4 + 7 + 3);
	t.is(widget2.y, 4 + 7 + 3 + 15);
	t.is(widget2.width, 8);
	t.is(widget2.height, 12);

	const widget3 = <ButtonWidget>mock.createdWindows[0].widgets[2];
	t.is(widget3.type, "button");
	t.is(widget3.text, "also in the box!");
	t.is(widget3.x, 4 + 7 + 3 + 8 + 6); // incl. 6px spacing
	t.is(widget3.y, 4 + 7 + 3 + 15);
	t.is(widget3.width, 8);
	t.is(widget3.height, 12);
});


test("Groupbox applies padding and default gap", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 80 + 15, padding: 10,
		content: [
			groupbox({
				padding: 3,
				gap: "6px",
				spacing: "4px",
				content: [
					button({
						padding: [ 4, 6 ],
						text: "inside a box!"
					}),
					button({
						padding: [ 2, 1 ],
						text: "labelled"
					})
				]
			})
		]
	});
	template.open();

	const widget1 = <GroupBoxWidget>mock.createdWindows[0].widgets[0];
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 10 + 3);
	t.is(widget1.y, 10 + 3 + 15 - 4); // - default top pad
	t.is(widget1.width, 74);
	t.is(widget1.height, 54 + 4); // + default top pad

	const widget2 = <ButtonWidget>mock.createdWindows[0].widgets[1];
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 10 + 3 + 6 + 6); // inc. 6px default gap
	t.is(widget2.y, 10 + 3 + 6 + 4 + 15); // inc. 6px default gap
	t.is(widget2.width, 50);
	t.is(widget2.height, 13);

	const widget3 = <ButtonWidget>mock.createdWindows[0].widgets[2];
	t.is(widget3.type, "button");
	t.is(widget3.text, "labelled");
	t.is(widget3.x, 10 + 3 + 6 + 1); // inc. 6px default gap
	t.is(widget3.y, 10 + 3 + 6 + 21 + 4 + 2 + 15); // inc. 4px spacing, 21px (4+13+4) prev. item
	t.is(widget3.width, 60);
	t.is(widget3.height, 13);
});


test("Groupbox takes size of absolute child", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 500, height: 400 + 15, padding: 10,
		content: [
			groupbox({
				gap: 3,
				padding: "0px",
				content: [
					button({
						width: 120, height: 70, padding: 12,
						text: "inside a box!"
					}),
					button({
						width: 100, height: 30, padding: 5,
						text: "inside a box too!"
					})
				]
			})
		]
	});
	template.open();

	const widget1 = <GroupBoxWidget>mock.createdWindows[0].widgets[0];
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 10);
	t.is(widget1.y, 10 + 15 - 4); // - default top pad
	t.is(widget1.width, 120 + 24 + 6); // inc. gap
	t.is(widget1.height, 70 + 24 + 6 + 30 + 10 + 4 + 4); // + default top pad

	const widget2 = <ButtonWidget>mock.createdWindows[0].widgets[1];
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 10 + 3 + 12);
	t.is(widget2.y, 10 + 3 + 12 + 15);
	t.is(widget2.width, 120);
	t.is(widget2.height, 70);

	const widget3 = <ButtonWidget>mock.createdWindows[0].widgets[2];
	t.is(widget3.type, "button");
	t.is(widget3.text, "inside a box too!");
	t.is(widget3.x, 10 + 3 + 5);
	t.is(widget3.y, 10 + 3 + 70 + 24 + 4 + 5 + 15); // inc. 70+24px prev. item, 4px spacing
	t.is(widget3.width, 100);
	t.is(widget3.height, 30);
});


test("Groupbox uses default fallback padding for gap", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 500, height: 400 + 15, padding: 10,
		content: [
			groupbox({
				gap: { top: "100%" },
				spacing: 12,
				content: [
					button({
						width: 120, height: 70,
						text: "inside a box!"
					}),
					button({
						width: 100, height: 30,
						text: "inside a box too!"
					})
				]
			})
		]
	});
	template.open();

	const widget1 = <GroupBoxWidget>mock.createdWindows[0].widgets[0];
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 10);
	t.is(widget1.y, 10 + 15 - 4); // - default top pad
	t.is(widget1.width, 120 + 6 + 6); // inc. gap
	t.is(widget1.height, 415 - (15 + 10 + 6)); // + default top pad

	const widget2 = <ButtonWidget>mock.createdWindows[0].widgets[1];
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 10 + 6); // 6px default padding
	t.is(widget2.y, 415 - (10 + 30 + 12 + 70 + 6));
	t.is(widget2.width, 120);
	t.is(widget2.height, 70);

	const widget3 = <ButtonWidget>mock.createdWindows[0].widgets[2];
	t.is(widget3.type, "button");
	t.is(widget3.text, "inside a box too!");
	t.is(widget3.x, 10 + 6); // 6px default padding
	t.is(widget3.y, 415 - (10 + 30 + 6));
	t.is(widget3.width, 100);
	t.is(widget3.height, 30);
});


test("Groupbox has correct size with padding in flex layout", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 150, height: 200, padding: 5, spacing: 2,
		content: [
			groupbox({
				padding: 15,
				gap: 6,
				content: [
					button({ height: 20, text: "click" })
				]
			}),
			button({ text: "press" }),
		]
	});
	template.open();

	const widget1 = <GroupBoxWidget>mock.createdWindows[0].widgets[0];
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 5 + 15);
	t.is(widget1.y, (5 + 15 + 15) - 4); // - default top pad
	t.is(widget1.width, 150 - (10 + 30));
	t.is(widget1.height, 20 + 12 + 4); // + default top pad

	const widget2 = <ButtonWidget>mock.createdWindows[0].widgets[1];
	t.is(widget2.type, "button");
	t.is(widget2.text, "click");
	t.is(widget2.x, 5 + 15 + 6);
	t.is(widget2.y, 5 + 15 + 6 + 15);
	t.is(widget2.width, 150 - (10 + 30 + 12));
	t.is(widget2.height, 20);

	const widget3 = <ButtonWidget>mock.createdWindows[0].widgets[2];
	t.is(widget3.type, "button");
	t.is(widget3.text, "press");
	t.is(widget3.x, 5);
	t.is(widget3.y, 5 + 30 + 12 + 20 + 2 + 15);
	t.is(widget3.width, 150 - 10);
	t.is(widget3.height, 200 - (10 + 2 + 30 + 12 + 20 + 15));
});
