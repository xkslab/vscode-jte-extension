"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerToggleComment = registerToggleComment;
const vscode = require("vscode");
function registerToggleComment(context) {
    // コメントアウトのトグルコマンドを登録
    const toggleCommentCommand = vscode.commands.registerCommand('jte.toggleComment', JteToggleComment);
    context.subscriptions.push(toggleCommentCommand);
}
/**
 * コメントアウトのトグル処理
 */
function JteToggleComment() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        const selection = editor.selection;
        // 現在の行または選択範囲に基づいて、対象のブロック全体を特定
        const targetLines = getTargetLines(document, selection);
        // ターゲット行からブロック分割
        const targetBlocks = getTargetBlocks(targetLines);
        // ブロックがすべてコメントアウト済みなら → 解除
        // そうでなければ → コメントアウトをつける
        const isAllCommented = targetBlocks.every(isBlockCommented);
        yield editor.edit((editBuilder) => {
            if (isAllCommented) {
                // コメントアウト解除：先頭の {} を削除
                for (const block of targetBlocks) {
                    if (isBlockCommented(block)) {
                        editBuilder.delete(block[0].rangeIncludingLineBreak);
                    }
                }
            }
            else {
                // コメントアウト：先頭に {} を挿入
                for (const block of targetBlocks) {
                    const lineNumber = block[0].lineNumber;
                    editBuilder.insert(new vscode.Position(lineNumber, 0), '{}\n');
                }
            }
        });
    });
}
/**
 * 選択範囲(またはキャレット位置)から、
 * 「属するブロックの先頭～末尾」までの行をまとめて取得
 */
function getTargetLines(document, selection) {
    const startLine = selection.start.line;
    const endLine = selection.end.line;
    // カーソル or 選択の先頭行が含まれるブロックの先頭へ
    let blockStart = startLine;
    while (blockStart > 0 && document.lineAt(blockStart - 1).text.trim() !== '') {
        blockStart--;
    }
    // カーソル or 選択の末尾行が含まれるブロックの末尾へ
    let blockEnd = endLine;
    while (blockEnd < document.lineCount - 1 &&
        document.lineAt(blockEnd + 1).text.trim() !== '') {
        blockEnd++;
    }
    // ブロックの行を全部集める
    const lines = [];
    for (let i = blockStart; i <= blockEnd; i++) {
        lines.push(document.lineAt(i));
    }
    return lines;
}
/**
 * 連続した行のかたまりをブロック単位に切り分ける
 * (空行でブロックを区切る)
 */
function getTargetBlocks(lines) {
    const blocks = [];
    let currentBlock = [];
    for (const line of lines) {
        const trimmed = line.text.trim();
        if (trimmed === '') {
            // 空行でブロック区切り
            if (currentBlock.length > 0) {
                blocks.push(currentBlock);
                currentBlock = [];
            }
        }
        else {
            currentBlock.push(line);
        }
    }
    // 最後が空行で終わらない場合、残りを push
    if (currentBlock.length > 0) {
        blocks.push(currentBlock);
    }
    return blocks;
}
/**
 * ブロックが「コメントアウトされているか」を判定
 * ＝ ブロックの先頭行が "{}" かどうか
 */
function isBlockCommented(block) {
    return block[0].text.trim() === '{}';
}
