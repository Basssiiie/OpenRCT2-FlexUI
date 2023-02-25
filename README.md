# FlexUI for OpenRCT2 plugins

A flexible no-nonsense user interface library for creating windows for OpenRCT2 plugins.

 - Simple declarative approach to designing your windows;
 - Bind models to your interface components using reactive MVVM-like bindings;
    - Your UI will automatically update when the values in your models change.
 - Automatically resize parts of your UI when users resize your window;
 - Percentile or weighted sizing of widgets;
    - Put your widgets in columns or rows, sized to 10% or 2/3 of the size of the parent, or something like that.
 - Nested widgets, widgets in widgets, or widget-inception;
 - New widgets like toggle buttons, dropdown-spinners and dropdown-buttons;
 - Supports both tabbed and regular window.
 - Easily extendable by implementing your own `WidgetCreator`-implementations;
 - Tree-shakable and minifiable;
    - If you use a tree-shaker then code from the library that you don't use will not be shipped with your plugin.
 - Fully unit-tested.

Designed with a focus on ease of use, performance, light-weighted and flexibility.

For examples see the [examples folder](https://github.com/Basssiiie/OpenRCT2-FlexUI/tree/main/examples).

---

## Installing a pre-release

> **This library is still in development. It may contain bugs or missing features. There may be breaking changes.**
>
> If you find a bug or have a feature request, please report it under [Issues](https://github.com/Basssiiie/OpenRCT2-FlexUI/issues) or find me on Discord in the [OpenRCT2 server](https://github.com/OpenRCT2/OpenRCT2#chat).

Install the latest pre-release directly from the NPM registry with:
```
npm install openrct2-flexui@next
```

---

## Building the source code

Requirements: [Node](https://nodejs.org/en/), NPM.

1. Open command prompt, use `cd` to change your current directory to the root folder of this project and run `npm install`.
2. Run `npm run build` (production build) or `npm run build:dev` (development build) to build the project.
    - The output folder for the packaged library is `(project directory)/dist`.

### Using a development build

To publish a local version of FlexUI for use in your own plugins;
1. Make a local build using `npm run build` or `npm run build:dev`.
2. Run `npm run publish:local` to install a local build into your global npm packages directory.
3. In the main folder of your new plugin; run `npm link openrct2-flexui` to temporarily link the local FlexUI build to your new plugin.

### Unit tests

The unit tests are written using AVA.js and can be run outside the game. First run `npm run test:setup`  in the main folder to ensure the test dependencies are installed. Then simply run `npm test` to run all tests.