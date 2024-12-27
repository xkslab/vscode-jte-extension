"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHoverPreview = registerHoverPreview;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const jteConfig_1 = require("./utils/jteConfig");
const path_1 = require("./utils/path");
function registerHoverPreview(context) {
    const hoverProvider = new JteHoverProvider();
    context.subscriptions.push(vscode.languages.registerHoverProvider({ language: 'jte' }, hoverProvider));
}
class JteHoverProvider {
    constructor() {
        this.config = (0, jteConfig_1.loadConfig)();
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
        // "type" が適切でない場合は終了
        if (!typeValue)
            return;
        // "type" に応じてパスを補正
        const relativePath = this.resolvePathByType(typeValue, word);
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
    resolvePathByType(type, relativePath) {
        const subDir = path_1.pathMapping[type];
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
