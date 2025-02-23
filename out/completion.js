"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCompletionItemProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const config_1 = require("./config");
const jsonSchema_1 = require("./config/codeCompletion/jsonSchema");
const controlSequence_1 = require("./config/codeCompletion/controlSequence");
const path_1 = require("./utils/path");
const gameData_1 = require("./utils/gameData");
function registerCompletionItemProvider(context) {
    const provider = new JteCompletionItemProvider();
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: 'jte' }, provider, '"', ':', ',', '{', '[', '\\', '/'));
    // 設定変更時のリスナーを登録
    const configWatcher = vscode.workspace.createFileSystemWatcher('**/.jte.config.json');
    configWatcher.onDidChange(() => {
        const newConfig = (0, config_1.loadConfig)();
        if (newConfig) {
            provider.schema = (0, jsonSchema_1.setupJsonSchema)(newConfig);
            provider.controlSequence = (0, controlSequence_1.setupControlSequence)(newConfig);
            provider.setConfig(newConfig);
            console.log('Updated schema and control sequence based on config change.');
        }
        else {
            // ファイルが消えたりパースに失敗したりした場合
            provider.setConfig(null);
            console.log('Config is null after change.');
        }
    });
    context.subscriptions.push(configWatcher);
}
exports.registerCompletionItemProvider = registerCompletionItemProvider;
class JteCompletionItemProvider {
    constructor() {
        this.colorMap = [
            { id: '0', color: '#ffffff（白）' },
            { id: '1', color: '#20a0d6（ライトブルー）' },
            { id: '2', color: '#ff784c（ライトレッド）' },
            { id: '3', color: '#66cc40（ライトグリーン）' },
            { id: '4', color: '#99ccff（かなり薄い青）' },
            { id: '5', color: '#ccc0ff（薄紫）' },
            { id: '6', color: '#ffffa0（ライトイエロー）' },
            { id: '7', color: '#808080（濃いグレー）' },
            { id: '8', color: '#c0c0c0（薄いグレー）' },
            { id: '9', color: '#2080cc（青）' },
            { id: '10', color: '#ff3810（オレンジ）' },
            { id: '11', color: '#00a010（緑）' },
            { id: '12', color: '#3e9ade（薄い青）' },
            { id: '13', color: '#a098ff（暗い紫）' },
            { id: '14', color: '#ffcc20（落ち着いた黄色）' },
            { id: '15', color: '#000000（黒）' },
            { id: '16', color: '#84aaff（グレーブルー）' },
            { id: '17', color: '#ffff40（黄色）' },
            { id: '18', color: '#ff2020（赤）' },
            { id: '19', color: '#202040（紺色）' },
            { id: '20', color: '#e08040（茶オレンジ）' },
            { id: '21', color: '#f0c040（落ち着いた黄色）' },
            { id: '22', color: '#4080c0（落ち着いた青）' },
            { id: '23', color: '#40c0f0（シアン）' },
            { id: '24', color: '#80ff80（蛍光黄緑）' },
            { id: '25', color: '#c08080（赤茶）' },
            { id: '26', color: '#8080ff（青紫）' },
            { id: '27', color: '#ff80ff（ピンク）' },
            { id: '28', color: '#00a040（緑）' },
            { id: '29', color: '#00e060（黄緑）' },
            { id: '30', color: '#a060e0（濃い紫）' },
            { id: '31', color: '#c080ff（紫）' },
        ];
        this.config = null;
        // 初期読み込み
        const userConfig = (0, config_1.loadConfig)();
        if (userConfig) {
            this.config = userConfig;
        }
        this.schema = (0, jsonSchema_1.setupJsonSchema)(userConfig);
        this.controlSequence = (0, controlSequence_1.setupControlSequence)(userConfig);
    }
    setConfig(newConfig) {
        this.config = newConfig;
    }
    // 補完アイテムを提供
    provideCompletionItems(document, position, token, context) {
        var _a, _b, _c, _d, _e;
        const text = document.getText(); // 全文を取得
        const currentLine = document.lineAt(position).text; // 現在の行
        const cursorText = currentLine.slice(0, position.character); // カーソルまでのテキスト
        const cursorTextPost = currentLine.slice(position.character); // カーソル以降のテキスト
        // 現在のブロックの `type` を取得
        const typeMatch = currentLine.match(/"type"\s*:\s*"([^"]+)"/);
        const currentType = typeMatch ? typeMatch[1] : "default";
        // \C[ で色番号を補完
        if (/\\C\[$/.test(cursorText)) {
            return this.colorMap.map(({ id, color }) => {
                const item = new vscode.CompletionItem(`${id.toString().padStart(2, '0')} ${color}`, vscode.CompletionItemKind.Color);
                item.insertText = id;
                item.detail = `Color Code: ${color}`;
                item.documentation = new vscode.MarkdownString(`**Preview:**\n\n![](https://dummyimage.com/16x16/${color.slice(1, 7)}/${color.slice(1, 7)})`);
                return item;
            });
        }
        // \V[ で変数名を見ながら補完
        if (/\\V\[$/.test(cursorText)) {
            const projectDir = (0, config_1.getProjectDir)(this.config);
            if (!projectDir) {
                return [];
            }
            const variables = (0, gameData_1.getVariables)(projectDir);
            if (variables.length === 0) {
                return [];
            }
            return variables.slice(1).map((variable, index) => {
                index += 1;
                const item = new vscode.CompletionItem(`${index.toString().padStart(4, '0')} ${variable}`, vscode.CompletionItemKind.Variable);
                item.insertText = index.toString();
                return item;
            });
        }
        // \I[ でIconSet.pngを見ながらアイコン番号を補完
        if (/\\I\[$/.test(cursorText)) {
            const projectDir = (0, config_1.getProjectDir)(this.config);
            if (!projectDir) {
                return [];
            }
            const iconSetPath = (0, gameData_1.getIconSetPath)(projectDir);
            if (!iconSetPath) {
                return [];
            }
            const maxCols = 16;
            // maxRowsはconfigから取得する
            const maxRows = this.config.iconSetRows || 20;
            const items = [];
            for (let i = 0; i < maxRows; i++) {
                const iconNumber = i * maxCols;
                const item = new vscode.CompletionItem(`${iconNumber.toString().padStart(4, '0')}  (${i + 1}行, 1列)`, vscode.CompletionItemKind.Value);
                item.insertText = iconNumber.toString();
                item.documentation = new vscode.MarkdownString(`![](${vscode.Uri.file(iconSetPath).toString()})`);
                items.push(item);
            }
            return items;
        }
        // \N[ でアクター名を補完
        if (/\\N\[$/.test(cursorText)) {
            const projectDir = (0, config_1.getProjectDir)(this.config);
            if (!projectDir) {
                return [];
            }
            const actors = (0, gameData_1.getActorsName)(projectDir);
            if (actors.length === 0) {
                return [];
            }
            return actors.map(({ name, id }) => {
                const item = new vscode.CompletionItem(`${id.toString().padStart(4, '0')} ${name}`, vscode.CompletionItemKind.Value);
                item.insertText = id.toString();
                return item;
            });
        }
        // Path 補完
        let pathKeyMatch = null;
        if (currentType === 'show picture' || currentType === 'bgm') {
            const pathKeyRegex = /"path"\s*:\s*"?([^"]*)$/;
            pathKeyMatch = cursorText.match(pathKeyRegex);
        }
        else if (currentType === 'show text') {
            const pathKeyRegex = /"faceImage"\s*:\s*"?([^"]*)$/;
            pathKeyMatch = cursorText.match(pathKeyRegex);
        }
        // path 補完をするのは currentType が pathMapping にある場合のみ
        if (pathKeyMatch && path_1.pathMapping[currentType]) {
            const partialPath = pathKeyMatch[1] || '';
            // プロジェクトのルートディレクトリ
            const projectRoot = (0, config_1.getProjectDir)(this.config);
            if (!projectRoot) {
                return [];
            }
            // 今回は show picture => projectRoot/img/pictures など
            const baseDir = path.join(projectRoot, path_1.pathMapping[currentType]);
            // partialPath まで付与して絶対パスを求める
            const absolutePath = path.resolve(baseDir, partialPath);
            let dirToRead = absolutePath;
            try {
                // もし partialPath がファイルの場合などは dirname を使う
                if (!fs.statSync(absolutePath).isDirectory()) {
                    dirToRead = path.dirname(absolutePath);
                }
            }
            catch (err) {
                // ファイルやディレクトリが存在しないなど
                return [];
            }
            const suggestions = [];
            const files = fs.readdirSync(dirToRead, { withFileTypes: true });
            for (const f of files) {
                // ファイル
                if (f.isFile()) {
                    const item = new vscode.CompletionItem(f.name, vscode.CompletionItemKind.File);
                    item.detail = 'File';
                    // 挿入テキスト
                    let insertText = f.name;
                    let cursorMoveDistance = 1; // デフォルトで1文字右に移動
                    // 左側にクォートがない場合にクォートを追加
                    if (!cursorText.endsWith("\"")) {
                        if (!cursorText.endsWith("/")) {
                            insertText = `"${insertText}`;
                            if (cursorText.endsWith(":")) {
                                insertText = ` ${insertText}`; // コロンの後にスペースを追加
                            }
                        }
                    }
                    // 閉じクォートがない場合に閉じクォートを追加
                    if (!cursorTextPost.startsWith("\"")) {
                        insertText = `${insertText}"`;
                        cursorMoveDistance = 0; // 移動不要
                    }
                    item.insertText = insertText;
                    // カーソル移動コマンドを設定
                    if (cursorMoveDistance > 0) {
                        item.command = {
                            title: "Move cursor",
                            command: "cursorMove",
                            arguments: [
                                {
                                    to: "right",
                                    by: "character",
                                    value: cursorMoveDistance,
                                },
                            ],
                        };
                    }
                    // 画像かどうか
                    if (/\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(f.name)) {
                        const itemPath = path.join(absolutePath, f.name);
                        const itemUri = vscode.Uri.file(itemPath).toString();
                        const md = new vscode.MarkdownString(`![](${itemUri})`);
                        md.isTrusted = true;
                        item.documentation = md;
                    }
                    suggestions.push(item);
                }
                else if (f.isDirectory()) {
                    // ディレクトリ
                    const item = new vscode.CompletionItem(f.name, vscode.CompletionItemKind.Folder);
                    item.detail = 'Directory';
                    let insertText = f.name;
                    if (!cursorText.endsWith("\"")) {
                        if (!cursorText.endsWith("/")) {
                            insertText = `"${insertText}`;
                            if (cursorText.endsWith(":")) {
                                insertText = ` ${insertText}`; // コロンの後にスペースを追加
                            }
                        }
                    }
                    item.insertText = insertText;
                    suggestions.push(item);
                }
            }
            return suggestions;
        }
        // キー候補を提供
        if (/\{\s*\"?$/.test(cursorText) || /,\s*\"?$/.test(cursorText)) {
            return (_b = (_a = this.schema[currentType]) === null || _a === void 0 ? void 0 : _a.properties.map(({ key, description, kind }) => {
                // Kind によってアイコンを変える
                const item = new vscode.CompletionItem(`${key.padEnd(10, ' ')} ${description}`, kind === "Command" ? vscode.CompletionItemKind.Function :
                    kind === "Command Params" ? vscode.CompletionItemKind.Variable :
                        kind === "JTE Params" ? vscode.CompletionItemKind.Property :
                            vscode.CompletionItemKind.Field);
                item.detail = description;
                const range = new vscode.Range(position, position);
                // 挿入テキストとカーソル移動距離の初期化
                let insertText = key;
                let cursorMoveDistance = 1;
                // 左側にクォートがない場合の処理
                if (!cursorText.endsWith("\"")) {
                    insertText = `"${insertText}`;
                    if (cursorText.endsWith(",")) {
                        insertText = ` ${insertText}`; // カンマの後にスペースを追加
                    }
                }
                // 右側に閉じクォートがない場合の処理
                if (!cursorTextPost.startsWith("\"")) {
                    insertText = `${insertText}"`;
                    cursorMoveDistance = 0; // 移動不要
                }
                // 挿入テキストと範囲を設定
                item.insertText = insertText;
                item.range = range;
                // 必要時のみカーソル移動コマンドを設定
                if (cursorMoveDistance > 0) {
                    item.command = {
                        title: "Move cursor",
                        command: "cursorMove",
                        arguments: [
                            {
                                to: "right",
                                by: "character",
                                value: cursorMoveDistance,
                            },
                        ],
                    };
                }
                return item;
            })) !== null && _b !== void 0 ? _b : [];
        }
        // 値候補を提供
        const keyMatch = cursorText.match(/"\s*(\w+)\s*"\s*:\s*"?$/);
        if (keyMatch) {
            const key = keyMatch[1];
            return (_e = (_d = (_c = this.schema[currentType]) === null || _c === void 0 ? void 0 : _c.values[key]) === null || _d === void 0 ? void 0 : _d.map(({ value, description }) => {
                const item = new vscode.CompletionItem(`${value.padEnd(14, ' ')} ${description}`, vscode.CompletionItemKind.Value);
                let insertText = value;
                let cursorMoveDistance = 1; // デフォルトで1文字右に移動
                // 左側にクォートがない場合、クォートを補完
                if (!cursorText.endsWith("\"")) {
                    insertText = `"${insertText}`;
                    if (cursorText.endsWith(":")) {
                        insertText = ` ${insertText}`; // コロンの後にスペースを追加
                    }
                }
                // 右側に閉じクォートがない場合、閉じクォートを補完
                if (!cursorTextPost.startsWith("\"")) {
                    insertText = `${insertText}"`;
                    cursorMoveDistance = 0; // 移動不要
                }
                item.insertText = insertText;
                item.detail = description;
                // 必要時のみカーソル移動コマンドを設定
                if (cursorMoveDistance > 0) {
                    item.command = {
                        title: "Move cursor",
                        command: "cursorMove",
                        arguments: [
                            {
                                to: "right",
                                by: "character",
                                value: cursorMoveDistance,
                            },
                        ],
                    };
                }
                return item;
            })) !== null && _e !== void 0 ? _e : [];
        }
        // 制御文字を提供
        if (/\\$/.test(cursorText)) {
            return this.controlSequence.map(({ key, description }) => {
                const displayText = `\\${key.padEnd(5, ' ')} ${description}`;
                // const displayText = key;
                const item = new vscode.CompletionItem(displayText, vscode.CompletionItemKind.Value);
                item.insertText = key;
                item.detail = description;
                return item;
            });
        }
        return [];
    }
}
