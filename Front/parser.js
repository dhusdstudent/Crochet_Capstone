
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

class Row {
    constructor() {
        this.stitches = [];
    }

    addStitch(stitch) {
        this.stitches.push(stitch);
    }
}

class CrochetProject{
    constructor() {
        this.rows = [];
    }

    addRow(){
        const row = new Row();
        this.rows.push(row);
        return row;

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
        type: "ss",
        height: 0
    },

    ch: {
        name: "chain",
        type: "ch",
        height: 0
    },

    sc: {
        name: "single crochet",
        type: "sc",
        color: "D5C2DF",
        height: 1

        //Maybe add later?
        //row: 0
        //psn: 0
        //width: 0
        //increases: 0
        //decreases: 0
        //UIspecial: false
    },

    hdc: {
        name: "half double crochet",
        type: "hdc",
        color: "D1D8F0",
        height: 2
    },

    dc: {
        name: "double crochet",
        type: "dc",
        color: "F3FFED",
        height: 3
    },

    tr: {
        name: "treble crochet",
        type: "tr",
        color: "FDEFD5",
        height: 4
    },

    dtr: {
        name: "double treble crochet",
        type: "dtr",
        color: "F0B4C8",
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
function addStitch(row, type, count){
    for (let i = 0; i < count; i++) {
        row.addStitch({
            type: type,
            height: stitches[type].height
        });
    }
}

function handle_chain(inn){

}

//I bet I could build this into the switcher directly. TODO

function handle_singleCrochet(inn, row){
    addStitch(row, "sc", inn.count);
}

function handle_doubleCrochet(inn, row){
    addStitch(row, "dc", inn.count);
}

function handle_trebleCrochet(inn, row){
    addStitch(row, "tr", inn.count);
}

function handle_halfDoubleCrochet(inn, row){
    addStitch(row, "hdc", inn.count);
}

function handle_doubleTrebleCrochet(inn, row){
    addStitch(row, "dtr", inn.count);
}

function handle_slipStitch(inn, row){
    addStitch(row, "ss", inn.count);
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

function interpretInstruction(inn, row){
    switch(inn.type){
        case "ss":
            return handle_slipStitch(inn, row);
        case "ch":
            return handle_chain(inn, row);
        case "sc":
            return handle_singleCrochet(inn, row);
        case "dc":
            return handle_doubleCrochet(inn, row);
        case "tr":
            return handle_trebleCrochet(inn, row);
        case "hdc":
            return handle_halfDoubleCrochet(inn, row);
        case "dtr":
            return handle_doubleTrebleCrochet(inn, row);
        case "bo":
            return handle_bobble(inn, row);
        case "blo":
            return handle_backLoopsOnly(inn, row);
        case "flo":
            return handle_frontLoopsOnly(inn, row);
        case "turn":
            return handle_turn(inn, row);
        default:
            throw new Error("Unknown type!");
    }
}

function interpretRow(inn) {
    const row = new Row();

    for (const instruction of inn) {
        interpretInstruction(instruction, row);
    }

    return row;
}

//-------------------------------------------RENDER-------------------------------------------------

function renderGraph(project) {
    const container = document.getElementById("crochet-grid");

    container.innerHTML = "";

    for (const row of project.rows) {
        const rowElement = document.createElement("div");
        rowElement.classList.add("row");

        for (const stitch of row.stitches) {
            const square = document.createElement("div");
            square.classList.add("stitch");
            square.classList.add(`stitch-${stitch.type}`);

            rowElement.appendChild(square);
        }

        container.appendChild(rowElement);
    }
}