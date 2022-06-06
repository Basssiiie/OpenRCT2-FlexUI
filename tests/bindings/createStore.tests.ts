import { arrayStore, store } from "@src/bindings/stores/createStore";
import test from "ava";


test("store() creates store with undefined value", t =>
{
	const stringStore = store<string>();

	t.is(stringStore.get(), undefined);
});


test("store() creates store with string value", t =>
{
	const stringStore = store("hello");

	t.is(stringStore.get(), "hello");
});


test("arrayStore() creates store with filled array", t =>
{
	const store = arrayStore([ "Bob", "Tom" ]);

	t.deepEqual(store.get(), [ "Bob", "Tom" ]);
});


test("arrayStore() creates store with empty array", t =>
{
	const store = arrayStore<string>();

	t.deepEqual(store.get(), []);
});