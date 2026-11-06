import {Loop} from "./Loop.js";

export class Hook {
    constructor() {
        this.ops = [];
        this.loops = [];

        const initialLoop = new Loop("working", "right");
        initialLoop.isOnHook = true;
        this.loops.push(initialLoop);

        this.record("start", {
            loopId: initialLoop.id,
            loopCount: this.loopCount
        });
    }

    record(type, data = {}){
        this.ops.push({type, ...data});
    }

    addLoop(kind, side) {
        const loop = new Loop(kind, side);
        loop.isOnHook = true;
        this.loops.push(loop);

        this.record("addLoop", {
            loopId: loop.id,
            kind,
            side,
            loopCount: this.loopCount
        });

        return loop;
    }

    yarnOver(side = "left"){
        return this.addLoop("yarn-over", side);
    }

    pullUpLoop(side = "right"){
        return this.addLoop("pulled-up", side);
    }

    get loopCount(){
        return this.loops.length;
    }

    pullThrough(count){
        if (!Number.isInteger(count) || count < 2 || count > this.loops.length){
            throw new Error(
                "Not enough to pull through"
            );
        }

        const start = this.loops.length - count;

        const removed = this.loops.slice(
            start,
            this.loops.length);

        for (const loop of removed){
            loop.isOnHook = false;
        }

        this.loops.splice(start, count);

        const result = new Loop("working", "right");
        result.isOnHook = true;

        this.loops.push(result);

        this.record("pullThrough", {
            count,
            removed: removed.map(loop => loop.id),
            resultLoopId: result.id,
            loopCount: this.loopCount
        });

        return result;
    }

}

