class Hook {
    constructor(client) {
        this.client = client;
        this.isLeftOfInsert = true;
        this.loops = [];
    }

    yarnOver(){
        let newLoop

        if(this.isLeftOfInsert){
            newLoop = new Loop (true)
        } else {
            newLoop = new Loop (false)
        }
        this.loops.add(newLoop)
    }

    pullThrough_1(){
        let x = this.loops.size() - 1
        this.loops.delete(x)
    }

    pullThrough_2(){
        let x = this.loops.size -2
        this.loops.delete(x) //"Remove" the two stitches below current stitch
        this.loops.delete(x - 1)
    }

    pullThrough_3(){
        let x = this.loops.size - 3
        this.loops.delete(x)
        this.loops.delete(x - 1)
        this.loops.delete(x - 2)
    }
}