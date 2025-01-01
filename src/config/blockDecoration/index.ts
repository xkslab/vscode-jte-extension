import { BlockColor } from "./blockColor";
import { BlockIcon } from "./blockIcon";


export interface BlockDecoration {
    blockColor?: BlockColor;
	hideBlockColor?: Boolean;
    blockIcon?: BlockIcon;
    hideBlockIcon?: Boolean;
}