export class Input {
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

    consume(expected) {
        const actual = this.get();

        if (expected !== undefined && actual !== expected) {
            throw new Error(
                `Expected ${expected} but got ${actual}`
            );
        }

        return actual;
    }
}

//-----------------------------------------------------------------------
export function isLetter(char) {
    return char !== undefined && /^[a-z]$/i.test(char);
}

export function isSpace(char) {
    return char !== undefined && /\s/.test(char);
}

export function isNumber(char) {
    return char !== undefined && /^[0-9]$/.test(char);
}

export function skipWhitespace(input) {
    while (!input.eof() && isSpace(input.peek())) {
        input.get();
    }
}
//-----------------------------------------------------------------------
export function parseWord(input) {
    let word = "";

    while (!input.eof() && isLetter(input.peek())) {
        word += input.get();
    }

    return word.toLowerCase();
}

export function parseNumber(input) {
    skipWhitespace(input);

    let result = "";

    while (!input.eof() && isNumber(input.peek())) {
        result += input.get();
    }

    return result === "" ? null : Number(result);
}

export function parseWordIfPresent(input) {
    skipWhitespace(input);

    if (!isLetter(input.peek())) {
        return null;
    }

    return parseWord(input);
}