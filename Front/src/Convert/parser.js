
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
        color: "#FDE4CF",
        height: 0
    },

    ch: {
        name: "chain",
        type: "ch",
        color: "#8EECF5",
        height: 0
    },

    sc: {
        name: "single crochet",
        type: "sc",
        color: "#FDE4CF",
        height: 1

        //Maybe add later?
        //row: 0
        //psn: 0
        //width: 0
        //increases: 0
        //decreases: 0
        //UIspecial: false
    },

    bo: {
        name: "bobble stitch",
        type: "bo",
        color: "#FFCFD2",
        height: 1
    },

    blo: {
        name: "back loops only",
        type: "blo",
        color: "#F1C0E8",
        height: 1
    },

    flo: {
        name: "front loops only",
        type: "flo",
        color: "#A3C4F3",
        height: 1
    },

    hdc: {
        name: "half double crochet",
        type: "hdc",
        color: "#CFBAF0",
        height: 2
    },

    dc: {
        name: "double crochet",
        type: "dc",
        color: "#A3C4F3",
        height: 3
    },

    tr: {
        name: "treble crochet",
        type: "tr",
        color: "#98F5E1",
        height: 4
    },

    dtr: {
        name: "double treble crochet",
        type: "dtr",
        color: "#B9FBC0",
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
            height: stitches[type].height,
            color: stitches[type].color
        });
    }
}

//I bet I could build this into the switcher directly. TODO

function handle_chain(inn){
    addStitch(row, "ch", inn.count);
}

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
    addStitch(row, "bo", inn.count);
}

function handle_backLoopsOnly(inn, amount){
    addStitch(row, "blo", inn.count);
}

function handle_frontLoopsOnly(inn, amount){
    addStitch(row, "flo", inn.count);
}

// function handle_turn(inn, amount){
//
// }
//
// function handle_decrease(inn, amount){
//
// }

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

function interpretProject(allInst){
    const proj = new CrochetProject();

    for (const instructions of allInst){
        const row = proj.addRow();

        for (const instruction of instructions){
            interpretInstruction(instruction, row);
        }
    }

    return proj;
}

function projectFinal(text){
    const rows = text.split("\n").map(line => line.trim())
        .filter(line => line.length > 0);

    const project = new CrochetProject();

    for (const eachRow of rows){
        const input = new Input(eachRow);
        const insts = parseRow(input);

        const singleRow = project.addRow();

        for (const instruction of insts){
            interpretInstruction(instruction, singleRow);
        }
    }

    return project;
}

//-------------------------------------------RENDER-------------------------------------------------

function renderGraph(project) {
    const svg = document.getElementById("crochet-grid");

    svg.innerHTML = "";
    const squareSize = 30;

    for (let rowIndex = 0; rowIndex < project.rows.length; rowIndex++) {
        const row = project.rows[rowIndex];

        for (let stitchIndex = 0; stitchIndex < row.stitches.length; stitchIndex++) {
            const stitch = row.stitches[stitchIndex];

            const square = document.createElementNS("http://www.w3.org/2000/svg", "rect");

            square.setAttribute("x", stitchIndex * squareSize);
            square.setAttribute("y", rowIndex * squareSize);

            square.setAttribute("width", squareSize);
            square.setAttribute("height", squareSize);

            square.setAttribute("fill", stitches[stitch.type].color);
            square.setAttribute("stroke", "#555");

            svg.appendChild(square);
        }
    }
        svg.setAttribute("width",
            Math.max(...project.rows.map(row => row.stitches.length)) * squareSize);

        svg.setAttribute("height",
            project.rows.length * squareSize);
}