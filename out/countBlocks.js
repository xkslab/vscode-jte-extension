"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCountBlocksProvider = registerCountBlocksProvider;
const vscode = require("vscode");
const jteConfig_1 = require("./utils/jteConfig");
const defaultConfig_1 = require("./utils/defaultConfig");
function registerCountBlocksProvider(context) {
    const provider = new JteCountBlocksProvider();
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: 'jte' }, provider));
    context.subscriptions.push(provider);
}
class JteCountBlocksProvider {
    constructor() {
        this.regex = /^(?<!\{\}\s*\n?)\{.+\}$/; // １行がJSON（空JSONを除外）かどうか判定
        this.excludeTypes = [""]; // カウント対象外のtype値
        /**
         * ユーザが「blockColor = false」やカスタムタイプを設定しているかを反映し、
         * 実際に使う DecorationType 一式を保持するマップ
         *   type => TextEditorDecorationType
         */
        this.decorationTypes = {};
        // コンストラクタではまだVSCode設定が読み込めない場合もあるため、
        // 実際の作成は「provideCodeLenses」で行うか、
        // もしくはコンストラクタ内で loadConfig() を呼んでもOK
        // 今回はコンストラクタ内でまとめて初期化してみる例
        this.initializeDecorationTypes();
    }
    /**
     * デフォルトカラー + ユーザ設定を反映して decorationTypes を初期化
     */
    initializeDecorationTypes() {
        // 2) ユーザ設定を読み込む
        const config = (0, jteConfig_1.loadConfig)();
        const userBlockColor = config === null || config === void 0 ? void 0 : config.blockColor;
        // 例: {
        //   "msg": "#FF0000",      // msg を赤に上書き
        //   "delPic": false,       // delPic だけ無効化したい場合(自由実装)
        //   "myCustomType": "#00FFFF", // 新規type追加
        // }
        // 3) blockColor が false の場合、全タイプの装飾をオフにする
        console.log('userBlockColor:', userBlockColor);
        if (userBlockColor === false) {
            // 何もしない → this.decorationTypes は空のまま
            // => ブロックカラー表示が一切なくなる
            this.decorationTypes = {};
            return;
        }
        // 4) デフォルトとユーザ設定をマージしたカラーマップを作成
        //    - ユーザ設定でキーが重複した場合は上書き
        //    - ユーザが新しい type を追加していれば増やす
        //    - ユーザ設定が false の場合は、その type は無効(スキップ)にする
        const mergedColorMap = Object.assign({}, defaultConfig_1.defaultTypeColorMap);
        if (typeof userBlockColor === 'object') {
            for (const [typeKey, colorOrOff] of Object.entries(userBlockColor)) {
                if (colorOrOff === false) {
                    // 「false」が指定されているtypeは無効化 → 削除
                    delete mergedColorMap[typeKey];
                }
                else if (typeof colorOrOff === 'string') {
                    // 文字列ならカラーコードとみなして上書き
                    mergedColorMap[typeKey] = colorOrOff;
                }
                // それ以外は無視
            }
        }
        // 5) mergedColorMap にあるすべてのtypeについて DecorationType を作る
        //    "before" 擬似要素で左端に線を描画 + marginでテキストとの間を空ける
        const decorationTypes = {};
        for (const [typeKey, color] of Object.entries(mergedColorMap)) {
            decorationTypes[typeKey] = vscode.window.createTextEditorDecorationType({
                before: {
                    contentText: '',
                    margin: '0 8px 0 0',
                    textDecoration: color !== '' ? `none; border-left: 4px solid ${color};` : 'none; border-left: 4px solid rgba(0, 0, 0, 0);'
                }
            });
        }
        this.decorationTypes = decorationTypes;
    }
    /**
     * 実際にブロックを検出し、各行に decoration を適用する
     */
    provideCodeLenses(document) {
        var _a, _b, _c, _d, _e;
        const textEditor = vscode.window.activeTextEditor;
        if (!textEditor) {
            return [];
        }
        // 毎回設定を再読み込みして反映したい場合はここで再実行してもOK
        // (ユーザーが設定を変えた時のリアルタイム反映を狙うなら)
        // this.initializeDecorationTypes();
        const lenses = [];
        const config = (0, jteConfig_1.loadConfig)();
        const lineCount = document.lineCount;
        // typeごとに行を貯めるマップ: { msg: Range[], showPic: Range[], ... }
        // decorationTypes に存在する type だけ準備
        const decorationRangeMap = {};
        for (const typeKey of Object.keys(this.decorationTypes)) {
            decorationRangeMap[typeKey] = [];
        }
        let i = 0;
        let blockNumber = 1;
        while (i < lineCount) {
            const lineText = document.lineAt(i).text;
            // JSON行かどうか
            if (this.regex.test(lineText)) {
                let parsedJson;
                try {
                    parsedJson = JSON.parse(lineText);
                }
                catch (_f) {
                    i++;
                    continue;
                }
                // excludeTypes に該当するならスキップ
                if (parsedJson.type && this.excludeTypes.includes(parsedJson.type)) {
                    i++;
                    continue;
                }
                // ブロック開始行
                const startLine = i;
                // 空行またはEOFまで読み飛ばし
                let j = i + 1;
                while (j < lineCount) {
                    const nextLineText = document.lineAt(j).text;
                    if (!nextLineText.trim()) {
                        break; // 空行で終了
                    }
                    j++;
                }
                // ブロック最終行
                const endLine = j - 1 >= startLine ? j - 1 : startLine;
                // CodeLens: JSON行(ブロック開始行)にだけ付与
                lenses.push(new vscode.CodeLens(new vscode.Range(new vscode.Position(startLine, 0), new vscode.Position(startLine, 0)), { title: `ブロック番号: ${blockNumber++}`, command: '' }));
                // JSON の type を確定
                let blockType = (_a = parsedJson.type) !== null && _a !== void 0 ? _a : 'default';
                // preset があれば上書き
                if (parsedJson.preset && ((_e = (_d = (_c = (_b = config === null || config === void 0 ? void 0 : config.codeCompletion) === null || _b === void 0 ? void 0 : _b.json) === null || _c === void 0 ? void 0 : _c.default) === null || _d === void 0 ? void 0 : _d.values) === null || _e === void 0 ? void 0 : _e.preset)) {
                    const presetConfig = config.codeCompletion.json.default.values.preset;
                    for (const item of presetConfig) {
                        if (item.value === parsedJson.preset && item.description) {
                            blockType = item.description.split(' ')[0];
                            break;
                        }
                    }
                }
                // decorationTypes に存在しなければ 'default'
                if (!this.decorationTypes[blockType]) {
                    blockType = 'default';
                }
                // もし 'default' にも存在しない(ユーザが blockColor=false にした可能性)なら、
                // なにもデコレーションを適用しない
                if (!this.decorationTypes[blockType]) {
                    // 次のブロック探索へ
                    i = j + 1;
                    continue;
                }
                // ブロック全行( startLine ~ endLine )に対して
                // 「before 装飾」を適用するための Range を追加
                for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
                    decorationRangeMap[blockType].push(new vscode.Range(new vscode.Position(lineIndex, 0), new vscode.Position(lineIndex, 0)));
                }
                // 次のブロックへ。空行をスキップ
                i = j + 1;
            }
            else {
                i++;
            }
        }
        // 既存のデコレーションをクリア
        // (あるいは if したいならする)
        for (const [typeKey, decoration] of Object.entries(this.decorationTypes)) {
            textEditor.setDecorations(decoration, []);
        }
        // まとめて適用
        for (const [typeKey, ranges] of Object.entries(decorationRangeMap)) {
            // 万一 typeKey が decorationTypes に消えていたらスキップ
            const decoration = this.decorationTypes[typeKey];
            if (!decoration)
                continue;
            textEditor.setDecorations(decoration, ranges);
        }
        return lenses;
    }
    dispose() {
        // 拡張破棄時にデコレーションも破棄
        for (const typeKey of Object.keys(this.decorationTypes)) {
            this.decorationTypes[typeKey].dispose();
        }
    }
}
