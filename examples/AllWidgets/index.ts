/// <reference path="../../lib/openrct2.d.ts" />

import
{
	box, button, checkbox, Colour, colourPicker, dropdown, dropdownButton, dropdownSpinner,
	groupbox, label, LayoutDirection, listview, spinner, textbox, toggle, viewport, window
}
from "openrct2-flexui";


const allWidgets = window({
	title: "All Widgets (fui example)",
	width: { value: 200, min: 75, max: 10_000 },
	height: { value: 500, min: 75, max: 10_000 },
	content: [
		label({
			text: "This is a label"
		}),
		box({
			content: label({
				text: "This is a label in a box "
			})
		}),
		box({
			text: "Label on top of a box",
			content: label({
				width: "140px",
				padding: { left: "1w" },
				text: "This is a right aligned label"
			})
		}),
		groupbox({
			text: "Colours",
			direction: LayoutDirection.Horizontal,
			gap: { left: "100%" },
			content: [
				colourPicker({
					colour: Colour.SaturatedRed,
					onChange: (colour: Colour) => console.log(`Colour picker #1 changed to colour id ${colour}`)
				}),
				colourPicker({
					colour: Colour.White,
					onChange: (colour: Colour) => console.log(`Colour picker #2 changed to colour id ${colour}`)
				}),
				colourPicker({
					colour: Colour.DarkBlue,
					onChange: (colour: Colour) => console.log(`Colour picker #3 changed to colour id ${colour}`)
				})
			]
		}),
		checkbox({
			text: "Toggle this checkbox",
			onChange: (checked: boolean) => console.log(`Checkbox has changed to ${checked ? "" : "not "}checked`)
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
		dropdownButton({
			buttons:
			[
				{ text: "First", onClick: (): void => console.log("Dropdown button's first option has been pressed") },
				{ text: "Second", onClick: (): void => console.log("Dropdown button's second option has been pressed") },
				{ text: "Third", onClick: (): void => console.log("Dropdown button's third option has been pressed") }
			]
		}),
		textbox({
			text: "Enter text",
			onChange: (text: string) => console.log(`Textbox has new text '${text}'`)
		}),
		button({
			text: "Press this button",
			height: "28px",
			onClick: () => console.log("Button has been pressed")
		}),
		toggle({
			text: "Toggle this button",
			height: "28px",
			onChange: (isPressed: boolean) => console.log(`Toggle has been toggled ${isPressed ? "down" : "up"}`)
		}),
		listview({
			items: [ "Listview item 1", "Listview item 2", "Listview item 3" ],
			onHighlight: (item: number, column: number) => console.log(`Highlighted item ${item} in column ${column} in listview`),
			onClick: (item: number, column: number) => console.log(`Clicked item ${item} in column ${column} in listview`)
		}),
		viewport({
			target: map.getAllEntities("car")[0]?.id
		})
	]
});


registerPlugin({
	name: "All Widgets (fui-example)",
	version: "1.0",
	authors: ["Basssiiie"],
	type: "local",
	licence: "MIT",
	targetApiVersion: 70,
	main: () =>
	{
		ui.registerMenuItem("(fui) All Widgets", () => allWidgets.open());
	}
});
