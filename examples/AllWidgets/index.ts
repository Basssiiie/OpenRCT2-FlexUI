/// <reference path="../../lib/openrct2.d.ts" />

import { box, dropdown, label, spinner, viewport, window } from "openrct2-fluentui";


const allWidgets = window({
	title: "All Widgets (fui example)",
	width: 200, minWidth: 75, maxWidth: 10000,
	height: 300, minHeight: 75, maxHeight: 10000,
	padding: 5,
	content: [
		label({
			text: "This is a label",
		}),
		box({
			padding: 0,
			content: label({
				text: "This is a boxed label"
			})
		}),
		dropdown({
			items: [ "First", "Second", "Third", "Fourth" ]
		}),
		spinner({
			maximum: 10
		}),
		viewport({
			target: map.getAllEntities("car")[0]
		})
	]
});


registerPlugin({
	name: "All Widgets (fui-example)",
	version: "1.0",
	authors: ["Basssiiie"],
	type: "local",
	licence: "MIT",
	main: () =>
	{
		ui.registerMenuItem("(fui) All Widgets", () => allWidgets.open());
	}
});