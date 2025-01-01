"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathCompletionItemsByType = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const config_1 = require("../../../config");
function getPathCompletionItemsByType(currentType, cursorText, cursorTextPost, config, commandPathMapping) {
    let pathKeyMatch = null;
    switch (currentType) {
        case 'show picture':
            pathKeyMatch = cursorText.match(/"path"\s*:\s*"?([^"]*)$/);
            if (pathKeyMatch && commandPathMapping['show picture']) {
                return pathCompletionItems(cursorText, cursorTextPost, config, commandPathMapping['show picture']['path'], pathKeyMatch[1] || '');
            }
            break;
        case 'show text':
            pathKeyMatch = cursorText.match(/"faceImage"\s*:\s*"?([^"]*)$/);
            if (pathKeyMatch && commandPathMapping['show text']) {
                return pathCompletionItems(cursorText, cursorTextPost, config, commandPathMapping['show text']['faceImage'], pathKeyMatch[1] || '');
            }
            break;
        default:
            break;
    }
    return [];
}
exports.getPathCompletionItemsByType = getPathCompletionItemsByType;
function pathCompletionItems(cursorText, cursorTextPost, config, basePath, partialPath) {
    const projectRoot = (0, config_1.getProjectDir)(config);
    if (!projectRoot) {
        return [];
    }
    const baseDir = path.join(projectRoot, basePath);
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
    const items = [];
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
            items.push(item);
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
            items.push(item);
        }
    }
    return items;
}
