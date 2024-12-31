import * as fs from 'fs';
import * as path from 'path';

export function getVariables(projectDir: string): string[] {
    const systemJsonPath = path.join(projectDir, 'data', 'System.json');
    if (!fs.existsSync(systemJsonPath)) {
        return [];
    }
    const systemJson = JSON.parse(fs.readFileSync(systemJsonPath, 'utf-8'));
    const variables = systemJson.variables;
  return variables;
}

export function getSwitches(projectDir: string): string[] {
    const systemJsonPath = path.join(projectDir, 'data', 'System.json');
    if (!fs.existsSync(systemJsonPath)) {
        return [];
    }
    const systemJson = JSON.parse(fs.readFileSync(systemJsonPath, 'utf-8'));
    const switches = systemJson.switches;
  return switches;
}

export function getActorsName(projectDir: string): { name: string, id: number }[] {
    const actorsJsonPath = path.join(projectDir, 'data', 'Actors.json');
    if (!fs.existsSync(actorsJsonPath)) {
        return [];
    }
    const actors = JSON.parse(fs.readFileSync(actorsJsonPath, 'utf-8'));
    // actors は配列. null が含まれることがある
    return actors.filter((actor: any) => actor).map((actor: any) => {
        return { name: actor.name, id: actor.id };
    }
    );
}


export function getIconSetPath(projectDir: string): string | undefined {
    const iconSetPath = path.join(projectDir, 'img', 'system', 'IconSet.png');
    if (!fs.existsSync(iconSetPath)) {
        return undefined;
    }
    return iconSetPath;
}