import { TestFn } from "ava";
import { getFile } from "./_integration-helpers";


export function integrations(test: TestFn, name: string): void
{
	test("Output contains no arrow functions", async t =>
	{
		const data = await getFile(name);

		t.false(data.includes("=>"));
	});

	test("Output contains no imports", async t =>
	{
		const data = await getFile(name);

		t.false(data.includes("import"));
	});

	test("Output contains no exports", async t =>
	{
		const data = await getFile(name);

		t.false(data.includes("export"));
	});

	test("Output contains no classes and constructors", async t =>
	{
		const data = await getFile(name);

		t.false(data.includes("class ") && data.includes("constructor("));
	});

	test("Output contains no unused classes", async t =>
	{
		const data = await getFile(name);

		t.false(data.includes("listview"));
		t.false(data.includes("button"));
		t.false(data.includes("dropdown"));
	});

	test("Output contains no unused enums", async t =>
	{
		const data = await getFile(name);

		t.false(data.includes("InvisibleRides"));
	});

	test("Output contains no internal enums", async t =>
	{
		const data = await getFile(name);

		t.false(data.includes("RedrawNextTick"));
		t.false(data.includes("RecalculateFromChildren"));
		t.false(data.includes("Horizontal"));
	});
}
