/// <reference path="../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { ParentWindow } from "@src/windows/parentWindow";
import { tab } from "@src/windows/tabs/tab";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import test from "ava";


test("Tab gets created", t =>
{
	const tabCreator = tab({
		image: 104,
		content: [
			button({ text: "hey" }),
			label({ text: "waddup" }),
		]
	});
	const description = <WindowTabDesc>{};
	tabCreator(<ParentWindow>{}, description);

	t.is(description.image, 104);
	t.truthy(description.widgets);
	const buttonWidget = <ButtonWidget>description.widgets![0];
	t.is(buttonWidget.type, "button");
	t.is(buttonWidget.text, "hey");
	const labelWidget = <LabelWidget>description.widgets![1];
	t.is(labelWidget.type, "label");
	t.is(labelWidget.text, "waddup");
});


test("Tab open() triggers event", t =>
{
	const hits: string[] = [];
	const tabCreator = tab({
		image: 88,
		content: [],
		onOpen: () => hits.push("opened")
	});
	const description = <WindowTabDesc>{};
	const layoutable = tabCreator(<ParentWindow>{}, description);

	layoutable.open(<Window>{}, {});
	t.deepEqual(hits, [ "opened" ]);

	layoutable.close();
	layoutable.open(<Window>{}, {});
	t.deepEqual(hits, [ "opened", "opened" ]);
});


test("Tab update() triggers event", t =>
{
	const hits: string[] = [];
	const tabCreator = tab({
		image: 88,
		content: [],
		onUpdate: () => hits.push("updated")
	});
	const description = <WindowTabDesc>{};
	const layoutable = tabCreator(<ParentWindow>{}, description);

	layoutable.update();
	t.deepEqual(hits, [ "updated" ]);

	layoutable.update();
	layoutable.update();
	t.deepEqual(hits, [ "updated", "updated", "updated" ]);
});


test("Tab close() triggers event", t =>
{
	const hits: string[] = [];
	const tabCreator = tab({
		image: 88,
		content: [],
		onClose: () => hits.push("closed")
	});
	const description = <WindowTabDesc>{};
	const layoutable = tabCreator(<ParentWindow>{}, description);

	layoutable.open(<Window>{}, {});
	layoutable.close();
	t.deepEqual(hits, [ "closed" ]);

	layoutable.open(<Window>{}, {});
	layoutable.close();
	t.deepEqual(hits, [ "closed", "closed" ]);
});


test("Tab all events are bound", t =>
{
	const hits: string[] = [];
	const tabCreator = tab({
		image: 88,
		content: [],
		onOpen: () => hits.push("opened"),
		onUpdate: () => hits.push("updated"),
		onClose: () => hits.push("closed")
	});
	const description = <WindowTabDesc>{};
	const layoutable = tabCreator(<ParentWindow>{}, description);

	layoutable.open(<Window>{}, {});
	layoutable.close();
	t.deepEqual(hits, [ "opened", "closed" ]);

	layoutable.open(<Window>{}, {});
	layoutable.update();
	layoutable.update();
	layoutable.close();
	t.deepEqual(hits, [ "opened", "closed", "opened", "updated", "updated", "closed" ]);
});


test("Tab open() refreshes widget properties bound to stores", t =>
{
	const buttonStore = store("hey");
	const labelStore = store("waddup");

	const tabCreator = tab({
		image: 88,
		content: [
			button({ text: buttonStore }),
			label({ text: labelStore }),
		]
	});
	const description = <WindowTabDesc>{};
	const layoutable = tabCreator(<ParentWindow>{}, description);

	const widgets = description.widgets!;
	const createdButton = <ButtonWidget>{};
	const createdLabel = <LabelWidget>{};
	const widgetMap: WidgetMap = {
		[widgets[0].name!]: createdButton,
		[widgets[1].name!]: createdLabel,
	};
	layoutable.open(<Window>{}, widgetMap);

	t.is(createdButton.text, "hey");
	t.is(createdLabel.text, "waddup");

	buttonStore.set("changed me");
	t.is(createdButton.text, "changed me");
	t.is(createdLabel.text, "waddup");

	labelStore.set("something else");
	t.is(createdButton.text, "changed me");
	t.is(createdLabel.text, "something else");
});
