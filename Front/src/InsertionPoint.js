import {makeId} from "./Utils.js";
import {Stitch} from "./Stitch.js";
import {ChainLink} from "./ChainLink.js";

export class InsertionPoint{
    constructor(owner) {
        this.id = makeId("insert");
        this.used = false;
        this.owner = owner;
        this.children = [];
    }

    canAccept(count=1) {
        return (!this.used
            && Number.isInteger(count)
            && count >= 1
            && count <= 3
        );
    }

    attach(stitches){
        const children = Array.isArray(stitches)
            ? stitches
            : [stitches];

        if(!this.canAccept(children.length)){
            throw new Error(`Insertion point $[this.id} is invalid`);
        }

        if (new Set(children).size !== children.length){
            throw new Error("Can't attach twice");
        }

        for (const child of children){
            if (!(child instanceof Stitch)){
                throw new Error("You can only attach stitches.");
            }

            if (child.parent || child.origin) {
                throw new Error(
                    `Stitch ${child.id} is already attached.`
                );
            }

            if (child === this.owner){
                throw new Error(
                    "A child cannot be its own parent."
                );
            }

            if (this.owner instanceof Stitch){
                if (child.row.number <= this.owner.row.number){
                    throw new Error(
                        `Stitch ${child.id} must attach to a later row.` +
                        `Parent row: ${this.owner.row.number + 1}, ` +
                        `Child row: ${child.row.number + 1}.`
                    );
                }
            }

            if (this.owner instanceof Stitch) {
                if (child.row.number <= this.owner.row.number) {
                    throw new Error(
                        `Invalid attachment:
            Parent stitch: ${this.owner.id}
            Parent row: ${this.owner.row.number}
            Child stitch: ${child.id}
            Child row: ${child.row.number}`
                    );
                }
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