import * as ArrayHelper from "@src/utilities/array";
import test from "ava";


test("find()", t =>
{
	const array = [ "one", "two", "three" ];

	t.is(ArrayHelper.find(array, i => i.startsWith("o")), "one");
	t.is(ArrayHelper.find(array, i => i.startsWith("tw")), "two");
	t.is(ArrayHelper.find(array, i => i.startsWith("th")), "three");
	t.is(ArrayHelper.find(array, () => true), "one");

	t.is(ArrayHelper.find(array, i => i.startsWith("z")), null);
	t.is(ArrayHelper.find(array, () => false), null);
	t.is(ArrayHelper.find([], () => false), null);
});
