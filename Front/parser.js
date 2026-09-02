
//-------------------------------------------INPUT-------------------------------------------------
class Input {
    constructor(text) {
        this.text = text;
        this.pos = 0;
    }

    eof() {
        return this.pos >= this.text.length;
    }

    peek() {
        return this.text[this.pos];
    }

    get() {
        return this.text[this.pos++];
    }

    consume(stuff) {
        const c = this.get();

        if (stuff !== undefined && c !== stuff) {
            throw new Error ('Expected '+ stuff + ' but got ' + c + ' at position ' + this.pos-1);
        }

        return c;
    }
}

//-------------------------------------------STITCH MAKEUP-------------------------------------------------

const stitchTypes = new Set([
    "ch",
    "ss",
    "sc",
    "dc",
    "tr",
    "hdc",
    "dtr",
    "bo",
    "blo",
    "flo",
    "turn"

]);

const stitchModifiers = new Set([
    "tog",
    "inc"
]);

const stitches = {
    ss: {
        name: "slip stitch",
        height: 0
    },

    ch: {
        name: "chain",
        height: 0
    },

    sc: {
        name: "single crochet",
        height: 1
    },

    hdc: {
        name: "half double crochet",
        height: 2
    },

    dc: {
        name: "double crochet",
        height: 3
    },

    tr: {
        name: "treble crochet",
        height: 4
    },

    dtr: {
        name: "double treble crochet",
        height: 5
    }
};

//-------------------------------------------CHARACTER EXAM-------------------------------------------------

function isLetter(char) {
    return char !== undefined && /^[a-z]$/i.test(char);
}

function isSpace(char) {
    return char !== undefined && /\s/.test(char);
}

function isNumber(char) {
    return char !== undefined && /^[0-9]$/.test(char);
}

function skip_whitespace(inn) {
    while (!inn.eof() && isSpace(inn.peek())) {
        inn.get();
    }
}

//-------------------------------------------PARSE WORD/NUM-------------------------------------------------
function parseWord(inn) {
    let word = "";

    while (!inn.eof() && isLetter(inn.peek())) {
        word += inn.get();
    }

    return word;
}

function parseNumber(inn) {
    skip_whitespace(inn);

    let result = "";

    while (!inn.eof() && isNumber(inn.peek())) {
        result += inn.get();
    }

    if (result === "") {
        return null;
    }

    return Number(result);
}

//-------------------------------------------PARSE WHOLE INST-------------------------------------------------
function parseInstruction(inn){
    skip_whitespace(inn);

    let count = parseNumber(inn);
    if (count === null) {
        count = 1;
    }

    const type = parseWord(inn);
    if (!stitchTypes.has(type)) {
        throw new Error ("Unknown stitch!");
    }

    const modCount = parseNumber(inn);
    let modifier = null;

    if (!inn.eof() && isLetter(inn.peek())) {
        const modType = parseWord(inn);

        if (!stitchModifiers.has(modType)) {
            throw new Error ("Unknown stitch modifier!");
        }

        modifier = {
            type: modType,
            count: modCount ?? 1
        };
    }

    return {
        type,
        count,
        modifier
    };
}

//-------------------------------------------PARSE PATTERN-------------------------------------------------
function parseRow(inn) {
    const patternInstructions = [];

    skip_whitespace(inn);

    while (!inn.eof()) {
        const instruction = parseInstruction(inn);

        patternInstructions.push(instruction);

        skip_whitespace(inn);

        if (inn.peek() === ',') {
            inn.get();
            skip_whitespace(inn);
            continue;
        }
        break;
    }
    return patternInstructions;
}

//-------------------------------------------STITCH TYPES-------------------------------------------------

function handle_chain(inn){

}

function handle_singleCrochet(inn){

}

function handle_doubleCrochet(inn){

}

function handle_trebleCrochet(inn, amount){

}

function handle_halfDoubleCrochet(inn, amount){

}

function handle_doubleTrebleCrochet(inn, amount){

}

function handle_slipStitch(inn, amount){

}

function handle_bobble(inn, amount){

}

function handle_backLoopsOnly(inn, amount){

}

function handle_frontLoopsOnly(inn, amount){

}

function handle_turn(inn, amount){

}

function handle_decrease(inn, amount){

}

//-------------------------------------------SWITCHER-------------------------------------------------

function interpretInstruction(inn){
    switch(inn.type){
        case "ss":
            return handle_slipStitch(inn);
        case "ch":
            return handle_chain(inn);
        case "sc":
            return handle_singleCrochet(inn);
        case "dc":
            return handle_doubleCrochet(inn);
        case "tr":
            return handle_trebleCrochet(inn);
        case "hdc":
            return handle_halfDoubleCrochet(inn);
        case "dtr":
            return handle_doubleTrebleCrochet(inn);
        case "bo":
            return handle_bobble(inn);
        case "blo":
            return handle_backLoopsOnly(inn);
        case "flo":
            return handle_frontLoopsOnly(inn);
        case "turn":
            return handle_turn(inn);
        default:
            throw new Error("Unknown type!");
    }
}