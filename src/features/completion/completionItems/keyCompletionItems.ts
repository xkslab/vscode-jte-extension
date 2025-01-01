import * as vscode from 'vscode';
import { JsonSchemaProperty } from '../../../config/codeCompletion/jsonSchema';

export function keyCompletionItems(
    cursorText: string, 
    cursorTextPost: string,
    position: vscode.Position,
    currentTypeSchema: JsonSchemaProperty[],
): vscode.CompletionItem[] {
    if (!currentTypeSchema) return [];
    return currentTypeSchema.map(({ key, description, kind }) => {
        // Kind によってアイコンを変える
        const item = new vscode.CompletionItem(`${key.padEnd(10, ' ')} ${description}`, 
            kind === "Command" ? vscode.CompletionItemKind.Function :
            kind === "Command Params" ? vscode.CompletionItemKind.Variable : 
            kind === "JTE Params" ? vscode.CompletionItemKind.Property :
            vscode.CompletionItemKind.Field
        );
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
    });
}