import * as fs from 'fs';
import * as path from 'path';


export const commandPathMapping: { [key: string]: { [key: string]: string } } = {
    'show picture': {'path': 'img/pictures'},
    'bgm': {'bgm': 'audio/bgm'},
    'show text': {'faceImage': 'img/faces'}
};

export function getIconSetPath(projectDir: string): string | undefined {
    const iconSetPath = path.join(projectDir, 'img', 'system', 'IconSet.png');
    if (!fs.existsSync(iconSetPath)) {
        return undefined;
    }
    return iconSetPath;
}