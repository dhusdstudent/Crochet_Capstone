
class Chain{
    constructor(row) {
        this.row = row;
        this.links = [];

        for (let i = 0; i < length; i++) {
            this.links.push(new ChainLink(this, i));
        }
    }
}