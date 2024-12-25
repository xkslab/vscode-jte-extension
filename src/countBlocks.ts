import * as vscode from 'vscode';
import { loadConfig } from './utils/jteConfig';

export function registerCountBlocksProvider(context: vscode.ExtensionContext) {
	const provider = new JteCountBlocksProvider();
	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider({ language: 'jte' }, provider)
	);
	context.subscriptions.push(provider);
}

class JteCountBlocksProvider implements vscode.CodeLensProvider, vscode.Disposable {
	private regex = /^(?<!\{\}\s*\n?)\{.+\}$/gm; // 空JSONを除くJSON部分を検出する正規表現
	private excludeTypes = ["label"]; // カウント対象外のtype値

	// type(または色)ごとに DecorationType を持たせる
	// 実運用では、"type => 'blue'" のように直接カラーマッピングしてもOKですが
	// ここでは説明のため "type => (同系統の)色" というイメージで書いています。
	private decorationTypes: Record<string, vscode.TextEditorDecorationType> = {};
	// あるいは Map<string, vscode.TextEditorDecorationType> でも構いません

	constructor() {
		this.decorationTypes['msg'] = vscode.window.createTextEditorDecorationType({
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(0, 128, 255, 0.5)', // 青
			borderRadius: '5px',
		});
		this.decorationTypes['showPic'] = vscode.window.createTextEditorDecorationType({
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(0, 255, 128, 0.5)', // 緑
			borderRadius: '5px',
		});
		this.decorationTypes['delPic'] = vscode.window.createTextEditorDecorationType({
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(255, 0, 128, 0.5)', // ピンク
			borderRadius: '5px',
		});
		this.decorationTypes['default'] = vscode.window.createTextEditorDecorationType({
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(128, 128, 128, 0.5)', // グレー
			borderRadius: '5px',
		});
	}

	provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
		const textEditor = vscode.window.activeTextEditor;
		if (!textEditor) {
			return [];
		}

		// 各デコレーションタイプに対応する Range の配列を準備
		const decorationRangesMap: Record<string, vscode.Range[]> = {
			msg: [],
			showPic: [],
			delPic: [],
			default: [],
		};

		const lenses: vscode.CodeLens[] = [];
		const text = document.getText();
		const config = loadConfig();
		let match: RegExpExecArray | null;
		let blockNumber = 1;

		// 正規表現でJSON部分を検出
		while ((match = this.regex.exec(text)) !== null) {
			try {
				const jsonText = match[0]; // マッチした文字列
				const parsedJson = JSON.parse(jsonText); // JSONとして解析

				// typeプロパティをチェックして、対象外の値の場合はスキップ
				if (this.excludeTypes.includes(parsedJson.type)) {
					continue;
				}

				const startPosition = document.positionAt(match.index);
				const endPosition = document.positionAt(match.index + match[0].length);

				// CodeLens を追加
				const range = new vscode.Range(startPosition, endPosition);
				lenses.push(
					new vscode.CodeLens(range, {
						title: `ブロック番号: ${blockNumber++}`,
						command: '',
					})
				);

				// JSON内の type を確定する
				let type = parsedJson.type ?? 'default';
				if (parsedJson.preset) {
					const preset = parsedJson.preset;
					if (config.codeCompletion?.json?.default?.values?.preset) {
						const presetConfig = config.codeCompletion.json.default.values.preset;
						for (const item of presetConfig) {
							if (item.value === preset) {
								if (item.description) {
									type = item.description.split(' ')[0];
								}
								break;
							}
						}
					}
				}

				// decorationRangesMap に積む\
				if (!decorationRangesMap[type]) {
					type = 'default'; // 未定義の type の場合は default にする
				}
				decorationRangesMap[type].push(range);

			} catch (e) {
				// JSON解析に失敗した場合（無効なJSON）はスキップ
				continue;
			}
		}

		// 既存のデコレーションを一度クリア (※無くてもよいが、再描画時に念のため)
		Object.values(this.decorationTypes).forEach(decorationType => {
			textEditor.setDecorations(decorationType, []);
		});

		// まとめてデコレーションを適用
		for (const [type, ranges] of Object.entries(decorationRangesMap)) {
			textEditor.setDecorations(this.decorationTypes[type], ranges);
		}

		return lenses;
	}

	dispose() {
		// Extension が dispose されるときにデコレーションも破棄
		Object.values(this.decorationTypes).forEach(decorationType => {
			decorationType.dispose();
		});
	}
}
