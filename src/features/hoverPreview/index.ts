import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../../config';
import { commandPathMapping } from '../../utils/systemPath';

export function registerHoverPreview(context: vscode.ExtensionContext) {
    const hoverProvider = new JteHoverProvider();
    context.subscriptions.push(
        vscode.languages.registerHoverProvider({ language: 'jte' }, hoverProvider)
    );
}

class JteHoverProvider implements vscode.HoverProvider {
    private config = loadConfig();
    // .jte.config.json が置かれているディレクトリ
    private configDir = path.dirname(this.config._configPath);

    // プロジェクトのルート
    private projectRoot = path.resolve(this.configDir, this.config.projectDir);
    

    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const range = document.getWordRangeAtPosition(position, /"([^"]*)"/);
        if (!range) return;

        const word = document.getText(range).replace(/"/g, '');
        if (!word) return;

        const typeValue = this.getTypeValue(document, position);

        const key = this.getKey(document, position);

        // "type" が適切でない場合は終了
        if (!typeValue) return;

        // "type" に応じてパスを補正
        const relativePath = this.resolvePathByType(typeValue, key, word);

        if (!relativePath || !this.isImageFile(relativePath)) return;

        const imageUri = vscode.Uri.file(relativePath);
        const markdown = new vscode.MarkdownString(`![Preview](${imageUri.toString()})`);
        markdown.isTrusted = true;
    
        return new vscode.Hover(markdown, range);
    }

    private getTypeValue(document: vscode.TextDocument, position: vscode.Position): string | null {
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

    private getKey(document: vscode.TextDocument, position: vscode.Position): string | null {
        // 現在の行のテキストを取得
        const currentLine = document.lineAt(position.line).text;
    
        // カーソル位置の前までの文字列を取得
        const beforeCursorText = currentLine.slice(0, position.character);
    
        // コロンの位置を探す（右から左に検索）
        const colonIndex = beforeCursorText.lastIndexOf(':');
        if (colonIndex === -1) return null; // コロンが見つからない場合
    
        // コロンの左側にあるキーを探す（キーはダブルクォートで囲まれている）
        const keyMatch = beforeCursorText.slice(0, colonIndex).match(/"([^"\s]+)"\s*$/);
        if (keyMatch) {
            return keyMatch[1]; // キー名を返す
        }
    
        return null; // キーが見つからない場合
    }
    
    private resolvePathByType(type: string, key: string, relativePath: string): string | null {
        const subDir = commandPathMapping[type][key];
        if (!subDir) return null;
    
        return path.join(this.projectRoot, subDir, relativePath);
    }

    private isImageFile(filePath: string): boolean {
        try {
            const stat = fs.statSync(filePath);
            if (!stat.isFile()) return false;

            const ext = path.extname(filePath).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext);
        } catch {
            return false;
        }
    }
}
