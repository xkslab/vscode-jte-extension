import { JteConfig } from "..";


export interface BlockIcon {
    [key: string]: string;
}

const defaultBlockIconMapping: BlockIcon = {
    "show text": '💬',
    "show picture": '🖼️',
    "erase picture": '🖼️🗑️',
    default: ''
};

/**
 * デフォルトの制御文字補完設定をユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みの制御文字補完設定
 */
export function setupBlockIconMapping(userConfig: JteConfig | null): BlockIcon {
    if (!userConfig || !userConfig.blockDecoration || !userConfig.blockDecoration.blockIcon) {
        return defaultBlockIconMapping; // デフォルトをそのまま返す
    }

    // デフォルト設定を基準にユーザー設定をマージ
    const combined = {...defaultBlockIconMapping, ...userConfig.blockDecoration.blockIcon};
    return combined;
}