import test from "ava";
import { rollup } from "./_integration-helpers";
import { integrations } from "./_integration-tests";


const name = "rollup-typescript";
test.before("Build succesfully", t =>
{
	t.timeout(30_000, "Rollup compilation took longer than 30 seconds");

	return rollup(name);
});

integrations(test, name);
