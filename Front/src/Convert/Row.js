class Row {
    constructor(number) {
        this.number = number;
        this.turningChain = [];
        this.stitches = [];
    }

    get length() {
        return this.stitches.length;
    }

    addStitch(stitch){
        this.stitches.push(stitch);
    }
}