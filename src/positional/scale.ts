/**
 * Specifies the scale of a specific property. The value can be either a string or a
 * number. String values can be either pixels, percentages, weighted values or 'inherit'.
 *  - **Pixels:** absolute position or size, like standard widgets;
 *  - **Percentages:** position or size relative to the leftover space within the parent;
 *  - **Weighted:** position or size relative to the total weight of all weighted elements
 *    within the parent, applied to the leftover space within the parent.
 *
 * **Leftover space** is all space within the parent after subtracting any absolute sized
 * widgets within the parent.
 *
 * **Example usage:**
 *  * `var absolute = "50px";`
 *     - Always 50 pixels regardless of parent size.
 *  * `var percentage = "20%";`
 *     - If the parent has no absolute sized widgets: (150 * 0.2) = 30 pixels;
 *     - If the parent has another widget with the absolute size of "50px": the
 *       leftover space is (150 - 50) = 100 pixels, and the size of the percentage
 *       sized widget is then (100 * 0.2) = 20 pixels.
 *  * `var weighted = "1w";`
 *     - If this is the only widget within the parent: 150 pixels;
 *     - If the parent has one other widget sized at "50px": 100 pixels; which is 100%
 *       of the leftover space.
 *     - If the parent has 2 widgets sized at "1w" and 1 widget at "30px": both
 *       weighted widgets will get 50% each of the leftover space, which is
 *       ((150 - 30px) * (1w / 2w)) = 60 pixels. The 2 here is the total weight over
 *       all the weighted elements within the parent.
 *  * `var number = 10;`
 *     - Number values are always interpreted as absolute pixel values.
 */
export type Scale = number | `${number}%` | `${number}w` | `${number}px`;