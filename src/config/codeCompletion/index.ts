import { ColorMapping } from "./colors";
import { ControlSequence } from "./controlSequence";
import { CustomCompletion } from "./customCompletion";
import { JsonSchema } from "./jsonSchema";

export interface CodeCompletion {
    json?: JsonSchema;
    controlSequence?: ControlSequence[];
    colors?: ColorMapping;
    customCompletion?: CustomCompletion[];
};