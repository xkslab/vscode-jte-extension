import { defaultControlSequence } from './defaultConfig';

/**
 * デフォルトの制御文字補完設定をユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みの制御文字補完設定
 */
export function overrideControlSequence(userConfig: any): any[] {
    if (!userConfig || !userConfig.codeCompletion || !userConfig.codeCompletion.controlSequence) {
        return defaultControlSequence; // デフォルトをそのまま返す
    }

    // デフォルト設定を基準にユーザー設定をマージ
    const combined = [...defaultControlSequence, ...userConfig.codeCompletion.controlSequence];
    return Array.from(
        new Map(combined.map((item) => [item.key, item])).values() // 重複を排除
    );
}
