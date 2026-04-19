/**
 * Specifies whether the current build is for production, testing, or development environment.
 */
type BuildConfiguration = "production" | "testing" | "development";


/**
 * The current active build configuration.
 */
declare const __BUILD_CONFIGURATION__: BuildConfiguration;


/**
 * Returns the build configuration of the plugin.
 */
export const buildConfiguration: BuildConfiguration = __BUILD_CONFIGURATION__;


/**
 * Returns true if the current build is a production build.
 */
export const isProduction = (buildConfiguration === "production");


/**
 * Returns true if the current build is a testing build.
 */
export const isTesting = (buildConfiguration === "testing");


/**
 * Returns true if the current build is a development build.
 */
export const isDevelopment = (buildConfiguration === "development");


/**
 * Returns true if the UI is available, or false if the game is running in headless mode.
 */
export const isUiAvailable = (typeof ui !== "undefined");
