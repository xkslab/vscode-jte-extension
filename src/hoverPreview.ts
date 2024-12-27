import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './utils/jteConfig';
import { pathMapping } from './utils/path';

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

        // "type" が適切でない場合は終了
        if (!typeValue) return;

        // "type" に応じてパスを補正
        const relativePath = this.resolvePathByType(typeValue, word);

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
    
    private resolvePathByType(type: string, relativePath: string): string | null {
        const subDir = pathMapping[type];
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
