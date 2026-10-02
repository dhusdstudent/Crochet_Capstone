class InsertionPoint{
    constructor(owner) {
        this.owner = owner;
        this.children = [];
        //this.hasAnAttachment = false;
    }

    addStitch(stitch){
        this.children.push(stitch);
        stitch.origin = this;
    }
}