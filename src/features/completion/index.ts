import * as vscode from 'vscode';
import { loadConfig, JteConfig } from '../../config';
import { JsonSchema, setupJsonSchema } from '../../config/codeCompletion/jsonSchema';
import { ControlSequence, setupControlSequence } from '../../config/codeCompletion/controlSequence';
import { commandPathMapping } from '../../utils/systemPath';
import { ColorMapping, setupColorMapping } from '../../config/codeCompletion/colors';
import { colorCompletionItems } from './completionItems/colorCompletionItems';
import { variableNameCompletionItems } from './completionItems/variableNameCompletionItems';
import { iconIdCompletionItems } from './completionItems/iconIdCompletionItems';
import { actorNameCompletionItems } from './completionItems/actorNameCompletionItems';
import { pathCompletionItemsByType } from './completionItems/pathCompletionItems';
import { keyCompletionItems } from './completionItems/keyCompletionItems';
import { valueCompletionItems } from './completionItems/valueCompletionItems';
import { controlSequenceCompletionItems } from './completionItems/controlSequenceCompletionItems';

export function registerCompletionItemProvider(context: vscode.ExtensionContext) {
    const provider = new JteCompletionItemProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider({ language: 'jte' }, provider, '"', ':', ',', '{', '[', '\\', '/')
    );
}

class JteCompletionItemProvider implements vscode.CompletionItemProvider {
	private config: JteConfig | null = null;
	private schema: JsonSchema;
	private controlSequence: ControlSequence[];
	private colorMap: ColorMapping;

	constructor() {
		this.config = loadConfig();
		this.schema = setupJsonSchema(this.config);
		this.controlSequence = setupControlSequence(this.config);
		this.colorMap = setupColorMapping(this.config);
		console.log('Completion provider initialized.', this.config);
	}

	// 補完アイテムを提供
	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext
	): vscode.CompletionItem[] {
		const currentLine = document.lineAt(position).text; // 現在の行
		const cursorText = currentLine.slice(0, position.character); // カーソルまでのテキスト
        const cursorTextPost = currentLine.slice(position.character); // カーソル以降のテキスト

		// 現在のブロックの `type` を取得
		const typeMatch = currentLine.match(/"type"\s*:\s*"([^"]+)"/);
		const currentType = typeMatch ? typeMatch[1] : "default";

        // \C[ で色番号を補完
        if (/\\C\[$/.test(cursorText)) {
			return colorCompletionItems(this.colorMap);
		}

		// \V[ で変数名を見ながら補完
		if (/\\V\[$/.test(cursorText)) {
			return variableNameCompletionItems(this.config);
		}

		// \I[ でIconSet.pngを見ながらアイコン番号を補完
		if (/\\I\[$/.test(cursorText)) {
			return iconIdCompletionItems(this.config);
		}

		// \N[ でアクター名を補完
		if (/\\N\[$/.test(cursorText)) {
			return actorNameCompletionItems(this.config);
		}

		// Path 補完
		const pathCompletionItems = pathCompletionItemsByType(currentType, cursorText, cursorTextPost, this.config, commandPathMapping);
		if (pathCompletionItems.length > 0) {
			return pathCompletionItems;
		}

		// キー候補を提供
		if (/\{\s*\"?$/.test(cursorText) || /,\s*\"?$/.test(cursorText)) {
			return keyCompletionItems(cursorText, cursorTextPost, position, this.schema[currentType]?.properties);
		}

		// 値候補を提供
		const keyMatch = cursorText.match(/"\s*(\w+)\s*"\s*:\s*"?$/);
		if (keyMatch) {
			return valueCompletionItems(cursorText, cursorTextPost, keyMatch[1], this.schema[currentType]?.values);
		}

		// 制御文字を提供
		if (/\\$/.test(cursorText)) {
			return controlSequenceCompletionItems(this.controlSequence);
		}

		return [];
	}
}
