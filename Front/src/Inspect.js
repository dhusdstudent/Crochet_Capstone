

function inspectInsertionPoint(point){
    return {
        id: point.id,
        kind: "insertion point",
        owner: point.owner.id,
        used: point.used,
        children: point.children.map( child => child.id),

        canAcceptOne: point.canAccept(1),
        canAcceptTwo: point.canAccept(2),
        canAcceptThree: point.canAccept(3),
    };
}

//---------------------------------------------------------------------------

function inspectSpace(space){
    return {
        id: space.id,
        kind: "space",
        owner: space.owner.id,
        precedingStitchType: space.owner.type,
        used: space.used,
        canBeUsed: space.canBeUsed,
        children: space.children.map( child => child.id),
    };
}

//---------------------------------------------------------------------------

function inspectLoop(loop, stitch){
    return{
        id: loop.id,
        kind: loop.kind,
        side: loop.side,
        isOnHook: loop.isOnHook,
        stitch: stitch.id
    };
}

//---------------------------------------------------------------------------

function inspectPost(post){
    return {
        id: post.id,
        kind: "post",
        stitch: post.stitch.id,
        height: post.height
    };
}

//---------------------------------------------------------------------------

function inspectStitch(stitch){
    return {
        id: stitch.id,
        type: stitch.type,
        name: stitch.name,
        row: stitch.row.number,
        height: stitch.height,

        previous: stitch.previous?.id ?? null,
        next: stitch.next?.id ?? null,

        parent: stitch.parent?.id ?? null,
        origin: stitch.origin?.id ?? null,

        construction: stitch.construction,

        insertionPoint: inspectInsertionPoint(stitch.insertionPoint),

        space: inspectStitch(stitch.space),

        loops: stitch.top.loops.map(loop => inspectStitch(loop, stitch))
    };
}

