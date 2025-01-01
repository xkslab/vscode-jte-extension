"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHoverPreview = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const config_1 = require("../../config");
const systemPath_1 = require("../../utils/systemPath");
function registerHoverPreview(context) {
    const hoverProvider = new JteHoverProvider();
    context.subscriptions.push(vscode.languages.registerHoverProvider({ language: 'jte' }, hoverProvider));
}
exports.registerHoverPreview = registerHoverPreview;
class JteHoverProvider {
    constructor() {
        this.config = (0, config_1.loadConfig)();
        // .jte.config.json が置かれているディレクトリ
        this.configDir = path.dirname(this.config._configPath);
        // プロジェクトのルート
        this.projectRoot = path.resolve(this.configDir, this.config.projectDir);
    }
    provideHover(document, position, token) {
        const range = document.getWordRangeAtPosition(position, /"([^"]*)"/);
        if (!range)
            return;
        const word = document.getText(range).replace(/"/g, '');
        if (!word)
            return;
        const typeValue = this.getTypeValue(document, position);
        const key = this.getKey(document, position);
        // "type" が適切でない場合は終了
        if (!typeValue)
            return;
        // "type" に応じてパスを補正
        const relativePath = this.resolvePathByType(typeValue, key, word);
        if (!relativePath || !this.isImageFile(relativePath))
            return;
        const imageUri = vscode.Uri.file(relativePath);
        const markdown = new vscode.MarkdownString(`![Preview](${imageUri.toString()})`);
        markdown.isTrusted = true;
        return new vscode.Hover(markdown, range);
    }
    getTypeValue(document, position) {
        // 現在の行から "type" の値を取得
        for (let line = position.line; line >= 0; line--) {
            const text = document.lineAt(line).text;
            const match = text.match(/"type"\s*:\s*"([^"]+)"/);
            if (match) {
                return match[1]; // "type" の値を返す
            }
        }
        return null;
    }
    getKey(document, position) {
        // 現在の行のテキストを取得
        const currentLine = document.lineAt(position.line).text;
        // カーソル位置の前までの文字列を取得
        const beforeCursorText = currentLine.slice(0, position.character);
        // コロンの位置を探す（右から左に検索）
        const colonIndex = beforeCursorText.lastIndexOf(':');
        if (colonIndex === -1)
            return null; // コロンが見つからない場合
        // コロンの左側にあるキーを探す（キーはダブルクォートで囲まれている）
        const keyMatch = beforeCursorText.slice(0, colonIndex).match(/"([^"\s]+)"\s*$/);
        if (keyMatch) {
            return keyMatch[1]; // キー名を返す
        }
        return null; // キーが見つからない場合
    }
    resolvePathByType(type, key, relativePath) {
        const subDir = systemPath_1.commandPathMapping[type][key];
        if (!subDir)
            return null;
        return path.join(this.projectRoot, subDir, relativePath);
    }
    isImageFile(filePath) {
        try {
            const stat = fs.statSync(filePath);
            if (!stat.isFile())
                return false;
            const ext = path.extname(filePath).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext);
        }
        catch (_a) {
            return false;
        }
    }
}
