
class Stitch { //each aStitch comprises three parts, a post, an empty space, and an insertion point at the top
    constructor(row, type){
        this.row = row;
        this.type = type;

        this.origin = null;
        this.insertionPoint = new InsertionPoint(this);
        this.space = new Space(this);
    }
}