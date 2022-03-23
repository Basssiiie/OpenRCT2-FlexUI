/// <reference path="../../lib/openrct2.d.ts" />

import
{
	box, button, Colour, colourPicker, dropdown, dropdownButton, dropdownSpinner,
	groupbox, label, LayoutDirection, spinner, toggle, viewport, window
}
from "openrct2-flexui";


const allWidgets = window({
	title: "All Widgets (fui example)",
	width: 200, minWidth: 75, maxWidth: 10_000,
	height: 350, minHeight: 75, maxHeight: 10_000,
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
			text: "Boxed label",
			content: label({
				padding: [ "10px", "1w" ],
				text: "This is a centred labeled boxed label"
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
	main: () =>
	{
		ui.registerMenuItem("(fui) All Widgets", () => allWidgets.open());
	}
});