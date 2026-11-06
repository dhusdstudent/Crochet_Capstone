import {STITCH_TYPES} from "./StitchTypes.js";
import {CrochetProject} from "./Pattern.js";

export function validateProject(project) {
    if (!(project instanceof CrochetProject)) {
        throw new Error(
            "Expected a CrochetProject instance."
        );
    }

    const allStitches = project.rows.flatMap(
        row => row.stitches
    );

    const knownStitches = new Set(allStitches);
    const knownRows = new Set(project.rows);
    const knownChains = new Set(project.chains);

//-----------------------------DUPE OBJECTS--------------------------------

    if (knownStitches.size !== allStitches.length) {
        throw new Error(
            "A stitch appears more than once in the project."
        );
    }

//-----------------------------VALID ROWS--------------------------------

    for (let rowIndex = 0; rowIndex < project.rows.length; rowIndex++) {
        const row = project.rows[rowIndex];

        if (row.number !== rowIndex) {
            throw new Error(
                `Incorrect row number at index ${rowIndex}.`
            );
        }

        if (
            row.turningChain &&
            row.turningChain.row !== row
        ) {
            throw new Error(
                "Turning chain belongs to the wrong row."
            );
        }

        for (let i = 0; i < row.stitches.length; i++) {
            const stitch = row.stitches[i];

            if (stitch.row !== row) {
                throw new Error(
                    "Stitch belongs to the wrong row."
                );
            }

            if (
                stitch.previous !==
                (row.stitches[i - 1] ?? null)
            ) {
                throw new Error(
                    "Incorrect previous stitch relationship."
                );
            }

            if (
                stitch.next !==
                (row.stitches[i + 1] ?? null)
            ) {
                throw new Error(
                    "Incorrect next stitch relationship."
                );
            }

            if (
                stitch.height !== STITCH_TYPES[stitch.type].height
            ) {
                throw new Error(
                    "Stitch height does not match its definition."
                );
            }
        }
    }

//-----------------------------VALID ATTACHMENTS--------------------------------

    for (const stitch of allStitches) {
        const points = [
            stitch.insertionPoint,
            stitch.space
        ];

        for (const point of points) {
            if (
                point.used !==
                (point.children.length > 0)
            ) {
                throw new Error(
                    "Attachment usage does not match its children."
                );
            }

            if (point.children.length > 3) {
                throw new Error(
                    "An attachment cannot contain more than three stitches."
                );
            }

            if (
                new Set(point.children).size !==
                point.children.length
            ) {
                throw new Error(
                    "Duplicate attachment children detected."
                );
            }

            for (const child of point.children) {
                if (!knownStitches.has(child)) {
                    throw new Error(
                        "Attachment references unknown stitch."
                    );
                }

                if (
                    child.parent !== point.owner ||
                    child.origin !== point
                ) {
                    throw new Error(
                        "Broken relationship."
                    );
                }

                if (child.row.number <= point.owner.row.number) {
                    throw new Error(
                        "Stitch cannot attach to a stitch in the same or later row."
                    );
                }
            }
        }


//-----------------------------VALID PARENTS--------------------------------

        if (stitch.parent && !knownStitches.has(stitch.parent)) {
            throw new Error(
                "Stitch references an unknown parent."
            );
        }

        if (stitch.origin) {
            if (stitch.origin.owner !== stitch.parent) {
                throw new Error(
                    "Stitch origin and parent disagree."
                );
            }

            if (!stitch.origin.children.includes(stitch)) {
                throw new Error(
                    "Stitch is missing from its origin's children."
                );
            }
        }

//-----------------------------VALID DECREASES--------------------------------

        if (
            !Array.isArray(stitch.decreaseSources)
        ) {
            throw new Error(
                "Decrease sources must be an array."
            );
        }

        if (
            stitch.decreaseSources.length !== 0 &&
            stitch.decreaseSources.length < 2
        ) {
            throw new Error(
                "A decrease must combine at least two stitches."
            );
        }

        for (const source of stitch.decreaseSources) {
            if (!knownStitches.has(source)) {
                throw new Error(
                    "Decrease references an unknown source stitch."
                );
            }

            if (source.consumedBy !== stitch) {
                throw new Error(
                    "Decrease source relationship is inconsistent."
                );
            }

            if (source.row.number >= stitch.row.number) {
                throw new Error(
                    "A decrease source must belong to an earlier row."
                );
            }
        }

        if (stitch.consumedBy) {
            if (!knownStitches.has(stitch.consumedBy)) {
                throw new Error(
                    "Consumed stitch references an unknown stitch."
                );
            }

            if (
                !stitch.consumedBy.decreaseSources.includes(stitch)
            ) {
                throw new Error(
                    "Consumed stitch is missing from its decrease."
                );
            }
        }
    }

//-----------------------------VALID CHAINS--------------------------------

    for (const chain of project.chains) {
        if (!knownChains.has(chain)) {
            throw new Error(
                "Unknown chain."
            );
        }

        if (
            chain.row !== null &&
            !knownRows.has(chain.row)
        ) {
            throw new Error(
                "Chain references an unknown row."
            );
        }

        for (let i = 0; i < chain.links.length; i++) {
            const link = chain.links[i];

            if (link.chain !== chain) {
                throw new Error(
                    "Chain link belongs to the wrong chain."
                );
            }

            if (link.index !== i) {
                throw new Error(
                    "Incorrect chain link index."
                );
            }

            if (
                link.previous !==
                (chain.links[i - 1] ?? null)
            ) {
                throw new Error(
                    "Incorrect previous chain link."
                );
            }

            if (
                link.next !==
                (chain.links[i + 1] ?? null)
            ) {
                throw new Error(
                    "Incorrect next chain link."
                );
            }
        }
    }

//-----------------------------VALID TURNS--------------------------------

    for (const turn of project.turns) {
        if (
            !knownRows.has(turn.fromRow) ||
            !knownRows.has(turn.toRow)
        ) {
            throw new Error(
                "Turn references an unknown row."
            );
        }

        if (
            turn.toRow.number !== turn.fromRow.number + 1
        ) {
            throw new Error(
                "Turn must connect consecutive rows."
            );
        }

        if (!knownChains.has(turn.chain)) {
            throw new Error(
                "Turn references an unknown chain."
            );
        }

        if (turn.chain.row !== turn.toRow) {
            throw new Error(
                "Turning chain belongs to the wrong row."
            );
        }
    }

    return true;
}
