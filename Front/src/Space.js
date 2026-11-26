import {makeId} from "./Utils.js";
import {STITCH_TYPES} from "./StitchTypes.js";
import {Stitch} from "./Stitch.js";

export class Space{
    constructor(owner) {
        this.id = makeId("space");

        this.owner = owner;
        this.children = [];
        this.used = false;
    }

    get canBeUsed() {
        return this.owner.height >= STITCH_TYPES.hdc.height && !this.used;
    }

    attach(stitches){
        const children = Array.isArray(stitches)
            ? stitches
            : [stitches];

        if (!this.canBeUsed) {
            throw new Error(`Space ${this.id} cannot accept stitches.`);
        }

        if (children.length < 1 || children.length > 3){
            throw new Error(`A space must receive between 1 and 3 stitches.`);
        }

        if (new Set(children).size !== children.length) {
            throw new Error("You cannot have duplicate children.")
        }

        for (const child of children) {
            if (!(child instanceof Stitch)) {
                throw new Error("You can only attach stitches.")
            }

            if (child.parent || child.origin){
                throw new Error("This stitch is already attached.");
            }

            if (child === this.owner){
                throw new Error("A stitch cannot be its own child.")
            }

            if (child.row.number <= this.owner.row.number){
                throw new Error("A stitch must attach to an earlier row.");
            }
        }

        this.used = true;
        this.children = [...children];

        for (const child of children) {
            child.parent = this.owner;
            child.origin = this;
        }

        return children;
    }

    addChildren(stitches){
        return this.attach(stitches);
    }
}