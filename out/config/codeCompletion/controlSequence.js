"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupControlSequence = void 0;
const defaultControlSequence = [
    { key: "V", description: "\\V[n] 変数n番の値に置き換えられます。" },
    { key: "N", description: "\\N[n] アクターn番の名前に置き換えられます。" },
    { key: "P", description: "\\P[n] パーティーメンバーn番に置き換えられます。" },
    { key: "G", description: "\\G 通貨単位に置き換えられます。" },
    { key: "C", description: "\\C[n] 以降の文字色をn番の色で表示します。" },
    { key: "I", description: "\\I[n] アイコンn番を描画します。" },
    { key: "{", description: "\\{ 文字サイズを1段階大きくします。" },
    { key: "}", description: "\\} 文字サイズを1段階小さくします。" },
    { key: "\\", description: "\\\\ バックスラッシュに置き換えられます。" },
    { key: "$", description: "\\$ 所持金のウィンドウを開きます。" },
    { key: ".", description: "\\. 1/4秒待ちます。" },
    { key: "|", description: "\\| 1秒待ちます。" },
    { key: "!", description: "\\! ボタン入力を待ちます。" },
    { key: ">", description: "\\> 同じ行の残りの文字を一瞬で表示します。" },
    { key: "<", description: "\\< 文字を一瞬で表示する効果を取り消します。" },
    { key: "^", description: "\\^ 文章表示後の入力待ちをしません。" },
];
/**
 * デフォルトの制御文字補完設定をユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みの制御文字補完設定
 */
function setupControlSequence(userConfig) {
    if (!userConfig || !userConfig.codeCompletion || !userConfig.codeCompletion.controlSequence) {
        return defaultControlSequence; // デフォルトをそのまま返す
    }
    // デフォルト設定を基準にユーザー設定をマージ
    const combined = [...defaultControlSequence, ...userConfig.codeCompletion.controlSequence];
    return Array.from(new Map(combined.map((item) => [item.key, item])).values() // 重複を排除
    );
}
exports.setupControlSequence = setupControlSequence;
