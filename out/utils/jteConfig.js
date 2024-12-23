"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
/**
 * .jte.config.json を探索して読み込む
 * @returns 読み込んだコンフィグオブジェクト
 */
function loadConfig() {
    const configPath = findConfigFile(vscode.window.activeTextEditor.document.uri.fsPath || "");
    if (!configPath)
        return null;
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    catch (error) {
        console.error(`.jte.config.json の読み込みに失敗しました: ${error}`);
        return null;
    }
}
/**
 * .jte.config.json を探索（同階層から上位階層）
 * @param startPath 開始ディレクトリのパス
 * @returns 見つかった .jte.config.json のパス
 */
function findConfigFile(startPath) {
    let currentPath = startPath;
    while (currentPath) {
        const configPath = path.join(currentPath, '.jte.config.json');
        if (fs.existsSync(configPath)) {
            return configPath;
        }
        const parentPath = path.dirname(currentPath);
        if (parentPath === currentPath)
            break; // ルートディレクトリまで到達
        currentPath = parentPath;
    }
    return undefined;
}
