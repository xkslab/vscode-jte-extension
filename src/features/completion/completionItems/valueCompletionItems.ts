import * as vscode from 'vscode';
import { JsonSchemaValue } from '../../../config/codeCompletion/jsonSchema';

export function valueCompletionItems(
    cursorText: string, 
    cursorTextPost: string,
    key: string, 
    jsonSchemaValues: Record<string, JsonSchemaValue[]> | undefined
): vscode.CompletionItem[] {
    return jsonSchemaValues[key]?.map(({ value, description }) => {
        const item = new vscode.CompletionItem(`${value.padEnd(14, ' ')} ${description}`, vscode.CompletionItemKind.Value);
        let insertText = value;
        let cursorMoveDistance = 1; // デフォルトで1文字右に移動

        // 左側にクォートがない場合、クォートを補完
        if (!cursorText.endsWith("\"")) {
            insertText = `"${insertText}`;
            if (cursorText.endsWith(":")){
                insertText = ` ${insertText}`; // コロンの後にスペースを追加
            }
        }

        // 右側に閉じクォートがない場合、閉じクォートを補完
        if (!cursorTextPost.startsWith("\"")) {
            insertText = `${insertText}"`;
            cursorMoveDistance = 0; // 移動不要
        }

        item.insertText = insertText;
        item.detail = description;

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
    }) ?? [];
}