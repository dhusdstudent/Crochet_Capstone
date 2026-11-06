import {makeId} from "./Utils.js";

export class Row {
    constructor(number) {
        this.id = makeId("row");
        this.number = number;
        this.turningChain = null;
        this.stitches = [];
    }

    get length() {
        return this.stitches.length;
    }

    get first() {
        return this.stitches[0] ?? null;
    }

    get last() {
        return this.stitches.at(-1) ?? null;
    }

    addStitch(stitch){
        // if (!(stitch instanceof Stitch)){
        //     throw new Error("You can only add stitches to your row.")
        // }

        if (stitch.row !== this){
            throw new Error("Stitch belongs to a different row.")
        }

        if (this.stitches.includes(stitch)){
            throw new Error("Stitch is already in this row.")
        }

        const previous = this.last;

        if (previous) {
            previous.next = stitch;
            stitch.previous = previous
        }

        this.stitches.push(stitch);
        return stitch;
    }
}