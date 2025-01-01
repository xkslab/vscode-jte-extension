import * as vscode from "vscode";
import { JteConfig } from "..";

export interface CustomCompletion {
    trigger: string;
    items: CustomCompletionItem[];
}

export interface CustomCompletionItem {
    insertText: string;
    displayText: string;
    description: string;
    kind: vscode.CompletionItemKind;
}

const completionKindMap: Record<string, vscode.CompletionItemKind> = {
    Text: vscode.CompletionItemKind.Text,
    Method: vscode.CompletionItemKind.Method,
    Function: vscode.CompletionItemKind.Function,
    Constructor: vscode.CompletionItemKind.Constructor,
    Field: vscode.CompletionItemKind.Field,
    Variable: vscode.CompletionItemKind.Variable,
    Class: vscode.CompletionItemKind.Class,
    Struct: vscode.CompletionItemKind.Struct,
    Interface: vscode.CompletionItemKind.Interface,
    Module: vscode.CompletionItemKind.Module,
    Property: vscode.CompletionItemKind.Property,
    Unit: vscode.CompletionItemKind.Unit,
    Value: vscode.CompletionItemKind.Value,
    Enum: vscode.CompletionItemKind.Enum,
    Keyword: vscode.CompletionItemKind.Keyword,
    Snippet: vscode.CompletionItemKind.Snippet,
    Color: vscode.CompletionItemKind.Color,
    File: vscode.CompletionItemKind.File,
    Reference: vscode.CompletionItemKind.Reference,
    Folder: vscode.CompletionItemKind.Folder,
    EnumMember: vscode.CompletionItemKind.EnumMember,
    Constant: vscode.CompletionItemKind.Constant,
    Event: vscode.CompletionItemKind.Event,
    Operator: vscode.CompletionItemKind.Operator,
    TypeParameter: vscode.CompletionItemKind.TypeParameter
};

/**
 * デフォルトの制御文字補完設定をユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みの制御文字補完設定
 */
export function setupCustomCompletion(userConfig: JteConfig | null): CustomCompletion[] {
    if (!userConfig?.codeCompletion?.customCompletion) {
        return [];
    }

    return userConfig.codeCompletion.customCompletion.map((customCompletion: CustomCompletion) => {
        return {
            trigger: customCompletion.trigger,
            items: customCompletion.items.map((item: CustomCompletionItem) => {
                return {
                    insertText: item.insertText,
                    displayText: item.displayText,
                    description: item.description,
                    kind: completionKindMap[item.kind]
                };
            })
        };
    });
}