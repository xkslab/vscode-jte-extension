"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectDir = exports.loadConfig = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
/**
 * .jte.config.json を探索して読み込む
 * @returns 読み込んだコンフィグオブジェクト（見つからなければ null）
 */
function loadConfig() {
    var _a;
    const configPath = findConfigFile(((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri.fsPath) || "");
    if (!configPath) {
        return null;
    }
    try {
        const rawData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        rawData._configPath = configPath;
        return rawData;
    }
    catch (error) {
        console.error(`.jte.config.json の読み込みに失敗しました: ${error}`);
        return null;
    }
}
exports.loadConfig = loadConfig;
function getProjectDir(config) {
    // config が null なら補完できない
    if (!config || !config._configPath || !config.projectDir) {
        return undefined;
    }
    // .jte.config.json が置かれているディレクトリ
    const configDir = path.dirname(config._configPath);
    // プロジェクトディレクトリの絶対パス
    const projectRoot = path.resolve(configDir, config.projectDir);
    return projectRoot;
}
exports.getProjectDir = getProjectDir;
/**
 * .jte.config.json を探索（同階層から上位階層）
 * @param startPath 開始となるファイルまたはディレクトリのパス
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
