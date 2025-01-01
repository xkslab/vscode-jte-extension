import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { CodeCompletion } from './codeCompletion';


export interface JteConfig {
	projectDir?: string;
    codeCompletion?: CodeCompletion;
	_configPath?: string;
	blockColor?: any;
	hideBlockColor?: Boolean;
	iconSetRows?: number;
}

/**
 * .jte.config.json を探索して読み込む
 * @returns 読み込んだコンフィグオブジェクト（見つからなければ null）
 */
export function loadConfig(): JteConfig | null {
	const configPath = findConfigFile(vscode.window.activeTextEditor?.document.uri.fsPath || "");
	if (!configPath) {
		return null;
	}

	try {
		const rawData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
		rawData._configPath = configPath;
		return rawData;
	} catch (error) {
		console.error(`.jte.config.json の読み込みに失敗しました: ${error}`);
		return null;
	}
}

export function getProjectDir(config): string | undefined {
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

/**
 * .jte.config.json を探索（同階層から上位階層）
 * @param startPath 開始となるファイルまたはディレクトリのパス
 * @returns 見つかった .jte.config.json のパス
 */
function findConfigFile(startPath: string): string | undefined {
	let currentPath = startPath;

	while (currentPath) {
		const configPath = path.join(currentPath, '.jte.config.json');
		if (fs.existsSync(configPath)) {
			return configPath;
		}

		const parentPath = path.dirname(currentPath);
		if (parentPath === currentPath) break; // ルートディレクトリまで到達
		currentPath = parentPath;
	}

	return undefined;
}
