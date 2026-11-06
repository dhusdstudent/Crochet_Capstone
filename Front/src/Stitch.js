
import {STITCH_TYPES} from "./StitchTypes.js";
import {makeId} from "./Utils.js";
import {Space} from "./Space.js";
import {StitchTop} from "./StitchTop.js";
import {InsertionPoint} from "./InsertionPoint.js";
import {Post} from "./Post.js";
import { Hook } from "./Hook.js";

console.log("Stitch.js loaded");
console.log("Hook export:", Hook);


export class Stitch {
    constructor(row, type){

        const definition = STITCH_TYPES[type];

        if (!definition) {
            throw new Error(
                `Not a valid type of stitch: "${type}". ` +
                `Available types: ${Object.keys(STITCH_TYPES).join(", ")}`
            );
        }

        this.id = makeId("stitch");
        this.row = row;
        this.type = type;

        this.name = definition.name;
        this.height = definition.height;
        this.color = definition.color;

        this.post = new Post(this);
        this.top = new StitchTop(this);
        this.insertionPoint = new InsertionPoint(this);
        this.space = new Space(this);

        this.parent = null;
        this.origin = null;

        this.decreaseSources = [];
        this.consumedBy = null;

        this.previous = null;
        this.next = null;

        this.construction = []; //method of construction
    }

    build() {
        const definition = STITCH_TYPES[this.type];
        const recipe = definition.construction;

        if (recipe.special){
            this.construction = [{
                type: "special",
                name: recipe.special
            }];

            return this;
        }

        const hook = new Hook();

        for (let i = 0; i < recipe.yarnOvers; i++){
            hook.yarnOver("left");
        }

        for (let j = 0; j < recipe.pullUp; j++){
            hook.pullUpLoop("right");
        }

        for (const count of recipe.pullThrough){
            hook.pullThrough(count);
        }

        this.construction = [...hook.ops];
        return this;
    }
}

export function createStitch(row, type){
    const stitch = new Stitch(row, type);

    stitch.build();
    return stitch;
}