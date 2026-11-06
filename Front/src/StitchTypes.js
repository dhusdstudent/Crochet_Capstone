
export const STITCH_TYPES = {
    ss: {
        name: "slip stitch",
        height: 0,
        color: "#FDE4CF",
        construction: {
            yarnOvers: 0,
            pullUp: 1,
            pullThrough: [2]
        }
    },

    ch: {
        name: "chain",
        height: 1,
        color: "#8EECF5",
        construction: {
            yarnOvers: 1,
            pullUp: 0,
            pullThrough: [2]
        }
    },

    sc: {
        name: "single crochet",
        height: 1,
        color: "#FDE4CF",
        construction: {
            yarnOvers: 0,
            pullUp: 1,
            pullThrough: [2]
        }
    },

    hdc: {
        name: "half double crochet",
        height: 2,
        color: "#CFBAF0",
        construction: {
            yarnOvers: 1,
            pullUp: 1,
            pullThrough: [3]
        }
    },

    dc: {
        name: "double crochet",
        height: 3,
        color: "#A3C4F3",
        construction: {
            yarnOvers: 1,
            pullUp: 1,
            pullThrough: [2, 2]
        }
    },

    tr: {
        name: "treble crochet",
        height: 4,
        color: "#98F5E1",
        construction: {
            yarnOvers: 2,
            pullUp: 1,
            pullThrough: [2, 2, 2]
        }
    },

    dtr: {
        name: "double treble crochet",
        height: 5,
        color: "#B9FBC0",
        construction: {
            yarnOvers: 3,
            pullUp: 1,
            pullThrough: [2, 2, 2, 2]
        }
    },

    bo: {
        name: "bobble stitch",
        height: 2,
        color: "#FFCFD2",
        construction: {
            special: "bobble"
        }
    }
};
