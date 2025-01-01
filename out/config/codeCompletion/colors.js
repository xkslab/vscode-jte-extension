"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupColorMapping = void 0;
const defaultColorMappping = {
    '0': { color: '#ffffff', description: '白' },
    '1': { color: '#20a0d6', description: 'ライトブルー' },
    '2': { color: '#ff784c', description: 'ライトレッド' },
    '3': { color: '#66cc40', description: 'ライトグリーン' },
    '4': { color: '#99ccff', description: 'かなり薄い青' },
    '5': { color: '#ccc0ff', description: '薄紫' },
    '6': { color: '#ffffa0', description: 'ライトイエロー' },
    '7': { color: '#808080', description: '濃いグレー' },
    '8': { color: '#c0c0c0', description: '薄いグレー' },
    '9': { color: '#2080cc', description: '青' },
    '10': { color: '#ff3810', description: 'オレンジ' },
    '11': { color: '#00a010', description: '緑' },
    '12': { color: '#3e9ade', description: '薄い青' },
    '13': { color: '#a098ff', description: '暗い紫' },
    '14': { color: '#ffcc20', description: '落ち着いた黄色' },
    '15': { color: '#000000', description: '黒' },
    '16': { color: '#84aaff', description: 'グレーブルー' },
    '17': { color: '#ffff40', description: '黄色' },
    '18': { color: '#ff2020', description: '赤' },
    '19': { color: '#202040', description: '紺色' },
    '20': { color: '#e08040', description: '茶オレンジ' },
    '21': { color: '#f0c040', description: '落ち着いた黄色' },
    '22': { color: '#4080c0', description: '落ち着いた青' },
    '23': { color: '#40c0f0', description: 'シアン' },
    '24': { color: '#80ff80', description: '蛍光黄緑' },
    '25': { color: '#c08080', description: '赤茶' },
    '26': { color: '#8080ff', description: '青紫' },
    '27': { color: '#ff80ff', description: 'ピンク' },
    '28': { color: '#00a040', description: '緑' },
    '29': { color: '#00e060', description: '黄緑' },
    '30': { color: '#a060e0', description: '濃い紫' },
    '31': { color: '#c080ff', description: '紫' }
};
/**
 * デフォルトの制御文字補完設定をユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みの制御文字補完設定
 */
function setupColorMapping(userConfig) {
    if (!userConfig || !userConfig.codeCompletion || !userConfig.codeCompletion.colors) {
        return defaultColorMappping; // デフォルトをそのまま返す
    }
    // デフォルト設定を基準にユーザー設定をマージ
    const combined = Object.assign(Object.assign({}, defaultColorMappping), userConfig.codeCompletion.colors);
    return combined;
}
exports.setupColorMapping = setupColorMapping;
