import {CrochetProject} from "./Pattern.js";
import {createStitch} from "./Stitch.js";

function createInterpretationContext(project, row){
    const previousRow = project.rows.at(-2) ?? null;

    const foundationChain = previousRow
        ? null
        : project.chains.find(
            chain => chain.kind === "foundation"
        ) ?? null;

    return {
        project,
        row,
        previousRow,
        foundationChain,
        targetIndex: 0
    };
}

//-----------------------------------------------------------------------

function interpretNormalStitches(context, type, count){
    const {
        row,
        previousRow,
        foundationChain
    } = context;

    const stitches = [];

    for (let i = 0; i < count; i ++){
        const stitch = createStitch(row, type);

        let target = null;

        if (previousRow) {
            target = previousRow.stitches[
                context.targetIndex
                ];
        } else if (foundationChain) {
            target = foundationChain.links[context.targetIndex];
        }

        if (previousRow || foundationChain){
            if (!target){
                throw new Error(
                    "Last row doesn't have enough stitches."
                );
            }

            target.insertionPoint.attach(stitch);
        }

        row.addStitch(stitch);

        stitches.push(stitch);
        context.targetIndex++;
    }

    return stitches;
}

//-----------------------------------------------------------------------

function interpretIncrease(context, type, count, amount = 2){
    if (!Number.isInteger(amount) || amount < 2 || amount > 3){
        throw new Error(
            "An increase must produce 2 or 3 stitches."
        );
    }

    const {row, previousRow} = context;

    if(!previousRow){
        throw new Error(
            "An increase needs an existing row."
        );
    }

    const results = [];

    for (let i = 0; i < count; i ++){
        const target = previousRow.stitches[context.targetIndex];

        if (!target){
            throw new Error(
                "Not enough stitches in the last row."
            );
        }

        if(target.insertionPoint.used){
            throw new Error(
                `Stitch ${target.id} has already been worked into.`
            );
        }

        const children = Array.from(
            {length: amount},
            () => createStitch(row, type)
        );

        target.insertionPoint.attach(children);

        for (const child of children){
            row.addStitch(child);
        }

        results.push(...children);

        context.targetIndex++;
    }

    return results;
}

//-----------------------------------------------------------------------

function interpretDecrease(context, type, count, amount = 3){
    if (!Number.isInteger(amount) || amount < 2 || amount > 3){
        throw new Error(
            "An decrease must combine 2 or 3 stitches."
        );
    }

    const {row, previousRow} = context;

    if (!previousRow){
        throw new Error(
            "A decrease needs an existing stitch."
        );
    }

    const results = [];

    for (let i = 0; i < count; i ++){
        const start = context.targetIndex;

        const sources = previousRow.stitches.slice(
            start,
            start + amount
        );

        if (sources.length !== amount){
            throw new Error(
                "Not enough stitches to decrease."
            );
        }

        for (let j = 0; j < sources.length; j ++) {
            const source = sources[j];
            if (source.consumedBy) {
                throw new Error(
                    "A stitch has already been consumed."
                );
            }

            if (j > 0) {
                const previousSource = sources[j - 1];

                if (source.previous !== previousSource) {
                    throw new Error(
                        "Decrease sources must be consecutive."
                    );
                }
            }
        }

        const stitch = createStitch(row, type);

        stitch.decreaseSources = [...sources];

        for (const source of sources){
            source.consumedBy = stitch;
        }

        row.addStitch(stitch);
        results.push(stitch);

        context.targetIndex += amount;
    }

    return results;
}

//-----------------------------------------------------------------------

function interpretChain(project, row, count, kind = "additional"){
    if (!Number.isInteger(count) || count < 1){
        throw new Error(
            "Chain count must be positive."
        );
    }

    return project.addChain(kind, row, count);
}

//-----------------------------------------------------------------------

function interpretInstruction(context, instruction){
    const{
        type,
        count,
        modifier
    } = instruction;

    if(modifier?.type === "inc"){
        return interpretIncrease(
            context,
            type,
            count,
            modifier.count
        );
    }

    if(modifier?.type === "tog"){
        return interpretDecrease(
            context,
            type,
            count,
            modifier.count
        );
    }

    if (type ==="ch" ){
        return interpretChain(
            context.project,
            context.row,
            count,
            "additional"
        );
    }

    return interpretNormalStitches(context, type, count);
}

//-----------------------------------------------------------------------

const TURNING_CHAIN_LENGTHS = {
    ss: 0,
    sc: 1,
    hdc: 2,
    dc: 3,
    tr: 4,
    dtr: 5,
    bo: 2
};

function interpretTurn(project, fromRow, toRow, stitchType){
    const count = TURNING_CHAIN_LENGTHS[stitchType];

    if (count === undefined){
        throw new Error(
            "Cannot determine turning chain length."
        );
    }

    const chain = interpretChain(
        project,
        toRow,
        count,
        "turning"
    );

    toRow.turningChain = chain;

    return project.addTurn(
        fromRow,
        toRow,
        chain
    );
}

//-----------------------------------------------------------------------

export function interpretPattern(
    instructions,
    options = {}
){
    const project = new CrochetProject();
    const foundationCount = options.foundationCount ?? 0;

    if (foundationCount > 0){
        project.addFoundationChain(foundationCount);
    }

    for (let i = 0; i < instructions.length; i++){
        const rowInstructions = instructions[i];

        const row = project.addRow();

        if (i > 0){
            const previousRow = project.rows[i -1 ];
            const firstInstruction = rowInstructions[0];

            if (!firstInstruction){
                throw new Error(
                    "Row has no instructions."
                );
            }

            interpretTurn(
                project,
                previousRow,
                row,
                firstInstruction.type
            );
        }

        const context = createInterpretationContext(
            project,
            row
        );

        for (const instruction of rowInstructions){
            interpretInstruction(context, instruction);
        }
    }

    return project;
}
