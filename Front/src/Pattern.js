import {Chain} from "./Chain.js";
import {Row} from "./Row.js";
import {Turn} from "./Turn.js";

export class CrochetProject {
    constructor() {
        this.rows = [];
        this.turns = [];
        this.chains = [];
    }

    addRow() {
        const row = new Row(this.rows.length);
        this.rows.push(row);
        return row;
    }

    addChain(kind = "foundation", row = null, count = 0) {
        const chain = new Chain(kind, row);
        chain.addLinks(count);
        this.chains.push(chain);

        if (kind === "turning" && row){
            if (row.turningChain){
                throw new Error(
                    "This row already has a turn."
                );
            }

            row.turningChain = chain;
        }

        return chain;
    }

    addTurn(fromRow, toRow, chain) {
        if (!(chain instanceof Chain)){
            throw new Error(
                "A turn needs a chain associated with it."
            );
        }

        const turn = new Turn(fromRow, toRow, chain);
        this.turns.push(turn);
        return turn;
    }

    addFoundationChain(count){
        if (this.rows.length > 0) {
            throw new Error(
                "Foundation chain must be created before the first row."
            );
        }

        if (this.chains.some(chain => chain.kind === "foundation")){
            throw new Error(
                "A foundation chain already exists."
            );
        }

        return this.addChain("foundation", null, count);
    }

    get currentRows() {
        return this.rows.at(-1) ?? null;
    }

    get totalStitches() {
        return this.rows.reduce(
            (total, row) => total + row.length,
            0
        );
    }

    get totalChains() {
        return this.chains.length;
    }

    get totalChainLinks() {
        return this.chains.reduce(
            (total, chain) => total + chain.length,
            0
        );
    }
}

