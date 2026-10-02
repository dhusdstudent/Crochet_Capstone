class ChainLink {
    constructor(chain, index) {
        this.chain = chain;
        this.index = index;

        this.insertionPoint = new InsertionPoint(this);
    }
}