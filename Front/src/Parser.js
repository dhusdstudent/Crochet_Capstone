
import {Input, parseNumber, parseWord, parseWordIfPresent, skipWhitespace} from "./Input.js";
import {STITCH_TYPES} from "./StitchTypes.js";

//-------------------------------------------PARSE WHOLE INST-------------------------------------------------
const MODIFIERS = new Set (["tog", "inc"]);

const MODIFIER_ALIASES = {
    inc: "inc",
    increase: "inc",
    increases: "inc",
    tog: "tog",
    dec: "tog",
    decrease: "tog",
    decreases: "tog"
};

// incNstitch_type
// stitch_typeNinc
// stitch_typeNtog

//-------------------------------------------PARSE WHOLE INST-------------------------------------------------


function parseInstruction(inn){
    skipWhitespace(inn);

    const startPosition = inn.pos;
    const count = parseNumber(inn) ?? 1;

    skipWhitespace(inn);

    const type = parseWord(inn);

    if (!type) {
        throw new Error(
            `Expected a stitch type at position ${inn.pos}.`
        );
    }

    if(!Object.hasOwn(STITCH_TYPES, type)) {
        throw new Error (`Unsupported type ${type}`);
    }

    const modifierType = parseWordIfPresent(inn);
    let modifier = null;

    if (modifierType){
        if (!MODIFIERS.has(modifierType)){
            throw new Error(`${modifierType} is not supported`);
        }

        const modifierCount = parseNumber(inn);

        if (modifierCount === null || modifierCount < 2 || modifierCount > 3){
            throw new Error ("Modifier count must be 2 or 3.");
        }

        modifier = {
            type: modifierType,
            count: modifierCount
        };
    }

    return {
        operation: "stitch",
        type,
        count,
        modifier,
        position: startPosition
    };
}


//-------------------------------------------PARSE PATTERN-------------------------------------------------
function parseRow(inn) {
    const instructions = [];

    skipWhitespace(inn);

    while (!inn.eof()) {
        instructions.push(parseInstruction(inn));
        skipWhitespace(inn);

        if(inn.eof()) break;

        if (inn.peek() !== ',') {
            throw new Error(`Expected comma at ${inn.pos - 1}`);
        }

        inn.consume(",");

        skipWhitespace(inn);

        if (inn.eof()){
            throw new Error("Unexpected end of pattern after comma");
        }
    }

    return instructions;
}


export function parsePattern(text) {
    if (typeof text !== "string") {
        throw new TypeError(
            "Pattern must be provided as text."
        );
    }

    const lines = text
        .split(/\r?\n/)
        .map(line => removeRowLabel(line).trim())
        .filter(Boolean);

    if (lines.length === 0) {
        throw new Error(
            "Pattern cannot be empty."
        );
    }

    return lines.map((line, index) => {
        try {
            return parseRow(new Input(line));
        } catch (error) {
            throw new Error(
                `Error on row ${index + 1}: ${error.message}`
            );
        }
    });
}

function removeRowLabel(line){
    return line.replace(
        /^\s*(?:row|round)\s+\d+\s*:\s*/i, ""
    );
}