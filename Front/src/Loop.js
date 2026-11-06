import {makeId} from "./Utils.js";

export class Loop {
    constructor(kind = "working", side = null) {
        this.kind = kind; //working or front or back
        this.id = makeId("loop");
        this.side = side; //left or right or null
        this.isOnHook = false;
    }
}

