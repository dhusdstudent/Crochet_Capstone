class Pattern {
    constructor(){
        this.rows = [];
        this.turns = [];
        this.chains = [];
    }

    addRow(row){
        this.rows.push(row);
    }

    get currentRows(){
        return this.rows[this.rows.length - 1];
    }

    get totalStitches(){
        return this.rows.reduce(
            (total, row) => total + row.length, 0);
    }
}