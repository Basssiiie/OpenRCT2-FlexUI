/// <reference path="../../lib/openrct2.d.ts" />

import { box, button, dropdown, dropdownSpinner, label, spinner, toggle, viewport, window } from "openrct2-flexui";


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
			content: label({
				text: "This is a boxed label"
			})
		}),
		box({
			text: "Groupbox label",
			content: label({
				padding: [ "10px", "1w" ],
				text: "This is a centred labeled boxed label"
			})
		}),
		dropdown({
			items: [ "First", "Second", "Third", "Fourth" ],
			onChange: (index: number) => console.log(`Dropdown changed to index ${index}`)
		}),
		spinner({
			maximum: 10,
			onChange: (value: number) => console.log(`Spinner changed to value ${value}`)
		}),
		dropdownSpinner({
			items: [ "First", "Second", "Third", "Fourth" ],
			onChange: (index: number) => console.log(`Dropdown spinner changed to value ${index}`)
		}),
		button({
			text: "Press this button",
			height: "28px",
			onClick: () => console.log(`Button has been pressed`)
		}),
		toggle({
			text: "Toggle this button",
			height: "28px",
			onChange: (isPressed: boolean) => console.log(`Toggle has been toggled ${isPressed ? "down" : "up"}`)
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