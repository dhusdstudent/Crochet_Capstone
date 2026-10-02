function doInstruction(pattern, instruction, insertionPoint){
    if (instruction.operation === "stitch") {
        for (let i = 0; i < instruction.count; i++) {
            const stitch = new Stitch({
                row: pattern.currentRows.number,
                type: instruction.type
            });

            insertionPoint.insert(stitch);
            pattern.currentRows.addStitch(stitch);
        }
    }
}