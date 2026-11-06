import {makeId} from "./Utils.js";

export class Post {
    constructor(stitch){
        this.id = makeId("post");
        this.stitch = stitch;
        this.height = stitch.height;

    }
}

