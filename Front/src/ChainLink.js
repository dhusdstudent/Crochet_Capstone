import {InsertionPoint} from "./InsertionPoint.js";
import {makeId} from "./Utils.js";
import {Loop} from "./Loop.js";

export class ChainLink {
    constructor(chain, index) {
        this.id = makeId("chain-link");

        this.chain = chain;
        this.index = index;

        this.previous = null;
        this.next = null;

        this.insertionPoint = new InsertionPoint(this);

        this.front = new Loop("front");
        this.back = new Loop("back");
    }

    get row(){
        return this.chain.row;
    }
}