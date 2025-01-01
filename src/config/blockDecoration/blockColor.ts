import { JteConfig } from "..";


export interface BlockColor {
    [key: string]: string;
}

const defaultBlockColorMapping: BlockColor = {
    "show text": 'rgba(255, 150, 70, 0.5)',     // 青
    "show picture": 'rgba(0, 212, 198, 0.5)', // 緑
    "erase picture": 'rgba(255, 0, 128, 0.5)',  // ピンク
    default: 'rgba(128, 128, 128, 0.5)'// グレー
};

/**
 * デフォルトの制御文字補完設定をユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みの制御文字補完設定
 */
export function setupBlockColorMapping(userConfig: JteConfig | null): BlockColor {
    if (!userConfig || !userConfig.blockDecoration || !userConfig.blockDecoration.blockColor) {
        return defaultBlockColorMapping; // デフォルトをそのまま返す
    }

    // デフォルト設定を基準にユーザー設定をマージ
    const combined = {...defaultBlockColorMapping, ...userConfig.blockDecoration.blockColor};
    return combined;
}