import {makeId} from "./Utils.js";
import {ChainLink} from "./ChainLink.js";

export class Chain{
    constructor(kind = "foundation", row = null) {
        this.id = makeId("chain");
        this.kind = kind;

        this.row = row;
        this.links = [];
    }

    addLink() {
        const link = new ChainLink(this, this.links.length);
        const previous = this.links.at(-1);

        if (previous){
            previous.next = link;
            link.previous = previous;
        }

        this.links.push(link);

        return link;
    }

    addLinks(count){
        if (!Number.isInteger(count) || count < 0){
            throw new Error("Chain count can't be negative.")
        }

        for (let i = 0; i < count; i++){
            this.addLink();
        }

        return this.links;
    }

    get length(){
        return this.links.length;
    }

    get first() {
        return this.links[0] ?? null;
    }

    get last(){
        return this.links.at(-1) ?? null;
    }
}