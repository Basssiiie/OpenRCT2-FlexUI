# FlexUI for OpenRCT2 plugins

W.I.P.

A flexible user interface library for creating windows for OpenRCT2 plugins.

 - MVVM-like user interface binding;
 - Automatic window resizing;
 - Percentile or weighted sizing of widgets;
 - Nested widgets;
 - New widgets like toggle buttons, dropdownspinners and dropdownbuttons.

Designed with a focus on ease of use, performance and flexibility.

---

## Building the source code

Requirements: [Node](https://nodejs.org/en/), NPM.

1. Open command prompt, use `cd` to change your current directory to the root folder of this project and run `npm install`.
2. Find `openrct2.d.ts` TypeScript API declaration file in OpenRCT2 files and copy it to `lib` folder (this file can usually be found in `C:/Users/<YOUR NAME>/Documents/OpenRCT2/bin/` or `C:/Program Files/OpenRCT2/`).
    - Alternatively, you can make a symbolic link instead of copying the file, which will keep the file up to date whenever you install new versions of OpenRCT2.
3. Run `npm run build` (production build) or `npm run build:dev` (development build) to build the project.
    - The output folder for the packaged library is `(project directory)/dist`.
4. To publish a local version of FlexUI for use in your own plugins; run `npm run publish:local` to install a local build into your global npm packages directory. Then in the main folder of your new plugin; run `npm link openrct2-flexui` to temporarily link the local FlexUI build to your new plugin.
