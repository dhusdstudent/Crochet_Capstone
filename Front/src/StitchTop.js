import {makeId} from "./Utils.js";
import {Loop} from "./Loop.js";

export class StitchTop {
    constructor(stitch) {
        this.id = makeId("top")

        this.stitch = stitch;

        this.front = new Loop("front");
        this.back = new Loop("back");
    }

    get loops(){
        return [this.front, this.back];
    }
}