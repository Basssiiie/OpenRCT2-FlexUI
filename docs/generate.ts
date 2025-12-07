import * as api from "@microsoft/api-extractor";
import * as model from "@microsoft/api-extractor-model";
import * as tsdoc from "@microsoft/tsdoc";
import { assert } from "console";
import * as path from "path";

// npx tsx docs/generate.ts

const config = api.ExtractorConfig.loadFileAndPrepare(path.join(import.meta.dirname, "../api-extractor.json"));
const extractor = api.Extractor.invoke(config,
{
	localBuild: true,
	showVerboseMessages: true
});

assert(extractor.succeeded);

const apiModel = new model.ApiModel();
apiModel.loadPackage("./temp/openrct2-flexui.api.json");

// todo? _applyInheritDoc is done here

// todo? per item _writeBreadcrumb



function print(item: model.ApiItem)
{
	console.log("------------------------------------------");
	console.log(`${item.kind}: ${item.displayName}`);
	if (item instanceof model.ApiDeclaredItem)
	{
		console.log(`  Signature: ${item.excerpt.text}`);
	}
	if (model.ApiParameterListMixin.isBaseClassOf(item))
	{
		console.log(`  Parameters: ${item.parameters.map(p => `${p.name} (${stringify(p.tsdocParamBlock)})`).join("\r\n")}`);
	}
	if (model.ApiTypeParameterListMixin.isBaseClassOf(item))
	{
		console.log(`  Types: ${item.typeParameters.map(p => `${p.name} (${stringify(p.tsdocTypeParamBlock)})`).join("\r\n")}`);
	}
	if (item instanceof model.ApiDocumentedItem && item.tsdocComment)
	{
		console.log(`  Summary: "${stringify(item.tsdocComment.summarySection)}"`);
		console.log(`  Remarks: "${stringify(item.tsdocComment.remarksBlock)}"`);
		console.log(`  Type docs: "${stringify(item.tsdocComment.typeParams)}"`);
		console.log(`  Returns: "${stringify(item.tsdocComment.returnsBlock)}"`);
		console.log(`  Inherit: "${stringify(item.tsdocComment.inheritDocTag)}"`);
		console.log(`  Deprecated: "${stringify(item.tsdocComment.deprecatedBlock)}"`);
		console.log(`  See: "${stringifyAll(item.tsdocComment.seeBlocks)}"`);
		console.log(`  Custom: "${stringifyAll(item.tsdocComment.customBlocks)}"`);
	}
}

function stringifyAll(nodes: readonly tsdoc.DocNode[]): string
{
	return nodes.map(n => `- ${stringify(n)}\r\n`).join("");
}

function stringify(node: tsdoc.DocNode | undefined): string | null
{
	if (!node)
	{
		return null;
	}

	if (node instanceof tsdoc.DocNodeContainer)
	{
		return node.nodes.map(n => stringify(n)).join("\r\n");
	}

	if (node instanceof tsdoc.DocParamCollection)
	{
		return node.blocks.map(n => stringify(n)).join("\r\n");
	}

	switch (node.kind)
	{
		case tsdoc.DocNodeKind.CodeSpan:
		{
			return `\`${(<tsdoc.DocCodeSpan>node).code}\``;
		}
		case tsdoc.DocNodeKind.ErrorText:
		{
			return `(ErrorText) ${(<tsdoc.DocErrorText>node).text}`;
		}
		case tsdoc.DocNodeKind.EscapedText:
		{
			return `(EscapedText) ${(<tsdoc.DocEscapedText>node).decodedText}`;
		}
		case tsdoc.DocNodeKind.FencedCode:
		{
			const fenced = <tsdoc.DocFencedCode>node;
			return `\`\`\`${fenced.language}\r\n${fenced.code}\r\n\`\`\``;
		}
		case tsdoc.DocNodeKind.LinkTag:
		{
			return `(LinkTag) ${(<tsdoc.DocLinkTag>node).linkText}`;
		}
		/* case tsdoc.DocNodeKind.Paragraph:
		{
			return `(Paragraph) ${(<tsdoc.DocParagraph>node).nodes.map(p => p.)}`;
		} */
		case tsdoc.DocNodeKind.PlainText:
		{
			return `(PlainText) ${(<tsdoc.DocPlainText>node).text}`;
		}
		case tsdoc.DocNodeKind.SoftBreak:
		{
			return "(SoftBreak)";
		}
	}

	console.warn(`Unknown kind: ${node.kind}`);
	return null;
}


function getData(item: model.ApiItem)
{

	//const test: model.ApiParameterListMixin
	print(item);

}

function createMarkdownFile(model: model.ApiItem): void
{
}

createMarkdownFile(getData(apiModel));

class TsDocument
{
	private readonly _functions: TsFunction[] = [];
	private readonly _types: TsType[] = [];

	constructor(root: model.ApiItem)
	{

	}

	private visit(item: model.ApiItem): void
	{
		print(item);

		if (item instanceof model.ApiFunction)
		{
			/* this._functions.push(new TsFunction
			(
				item.displayName,
				item.excerpt.text,
				stringify(item.tsdocComment?.summarySection),
				stringify(item.tsdocComment?.remarksBlock),
			)) */
		}

		for (const member of item.members)
		{
			this.visit(member);
		}
	}

	private getDocumentation()
}


class TsParameter
{
	constructor(
		readonly name: string,
		readonly signature: string,
		readonly type: TsType | string,
		readonly description: string,
		readonly deprecated: string | null
	)
	{}
}

class TsFunction
{
	constructor(
		readonly name: string,
		readonly signature: string,
		readonly summary: string,
		readonly remarks: string | null,
		readonly types: (TsType | string)[],
		readonly parameters: TsParameter[],
		readonly returns: TsType | string,
		readonly deprecated: string | null
	)
	{}
}

class TsProperty
{
	constructor(
		readonly name: string,
		readonly signature: string,
		readonly summary: string,
		readonly remarks: string | null,
		readonly type: TsType | string,
		readonly deprecated: string | null
	)
	{}
}

class TsType
{
	constructor(
		readonly declaration: "class" | "interface" | "type",
		readonly name: string,
		readonly signature: string,
		readonly summary: string,
		readonly remarks: string | null,
		readonly types: (TsType | string)[],
		readonly properties: TsProperty[],
		readonly methods: TsFunction[],
		readonly deprecated: string | null
	)
	{}
}
