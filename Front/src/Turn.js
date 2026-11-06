import {makeId} from "./Utils.js";

export class Turn{
    constructor(fromRow, toRow, chain) {
        this.id = makeId("turn");

        this.fromRow = fromRow;
        this.toRow = toRow;
        this.chain = chain;
    }
}

