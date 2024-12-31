"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIconSetPath = exports.getActorsName = exports.getSwitches = exports.getVariables = void 0;
const fs = require("fs");
const path = require("path");
function getVariables(projectDir) {
    const systemJsonPath = path.join(projectDir, 'data', 'System.json');
    if (!fs.existsSync(systemJsonPath)) {
        return [];
    }
    const systemJson = JSON.parse(fs.readFileSync(systemJsonPath, 'utf-8'));
    const variables = systemJson.variables;
    return variables;
}
exports.getVariables = getVariables;
function getSwitches(projectDir) {
    const systemJsonPath = path.join(projectDir, 'data', 'System.json');
    if (!fs.existsSync(systemJsonPath)) {
        return [];
    }
    const systemJson = JSON.parse(fs.readFileSync(systemJsonPath, 'utf-8'));
    const switches = systemJson.switches;
    return switches;
}
exports.getSwitches = getSwitches;
function getActorsName(projectDir) {
    const actorsJsonPath = path.join(projectDir, 'data', 'Actors.json');
    if (!fs.existsSync(actorsJsonPath)) {
        return [];
    }
    const actors = JSON.parse(fs.readFileSync(actorsJsonPath, 'utf-8'));
    // actors は配列. null が含まれることがある
    return actors.filter((actor) => actor).map((actor) => {
        return { name: actor.name, id: actor.id };
    });
}
exports.getActorsName = getActorsName;
function getIconSetPath(projectDir) {
    const iconSetPath = path.join(projectDir, 'img', 'system', 'IconSet.png');
    if (!fs.existsSync(iconSetPath)) {
        return undefined;
    }
    return iconSetPath;
}
exports.getIconSetPath = getIconSetPath;
