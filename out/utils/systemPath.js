"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIconSetPath = exports.commandPathMapping = void 0;
const fs = require("fs");
const path = require("path");
exports.commandPathMapping = {
    'show picture': { 'path': 'img/pictures' },
    'bgm': { 'bgm': 'audio/bgm' },
    'show text': { 'faceImage': 'img/faces' }
};
function getIconSetPath(projectDir) {
    const iconSetPath = path.join(projectDir, 'img', 'system', 'IconSet.png');
    if (!fs.existsSync(iconSetPath)) {
        return undefined;
    }
    return iconSetPath;
}
exports.getIconSetPath = getIconSetPath;
