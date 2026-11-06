import {validateProject} from "./Validation.js";

function inspectStitch(stitch) {
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
        space: inspectSpace(stitch.space),
        loops: stitch.top.loops.map(loop =>
            inspectLoop(loop, stitch)
        )
    };
}



export function doRender(project) {
    validateProject(project);

    const svg = document.getElementById("crochet-graph");
    const inspector = document.getElementById("inspector-content");

    const inspectorTitle = document.getElementById("inspector-title");

    if (!svg || !inspector) {
        throw new Error("Missing crochet graph or inspector.");
    }

    const NS = "http://www.w3.org/2000/svg";

    const cellWidth = 48;
    const rowGap = 86;
    const padding = 24;
    const extraWidth = 48;

    const maxStitches = Math.max(
        1,
        ...project.rows.map(row => row.stitches.length)
    );

    const width =
        padding * 2 + maxStitches * cellWidth + extraWidth;

    const height =
        padding * 2 + project.rows.length * rowGap;

    svg.replaceChildren();

    svg.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );

    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    const drawGroups = [];
    const animationTimers = [];

 //-------------------------SVG HELPERS--------------------------------

    function makeElement(name, attrs = {}) {
        const element = document.createElementNS(NS, name);

        for (const [key, value] of Object.entries(attrs)) {
            element.setAttribute(key, String(value));
        }

        return element;
    }

    function add(parent, name, attrs = {}) {
        const element = makeElement(name, attrs);
        parent.appendChild(element);
        return element;
    }

    function inspect(title, details) {
        if (inspectorTitle) {
            inspectorTitle.textContent = title;
        }

        inspector.textContent = JSON.stringify(
            details,
            null,
            2
        );
    }

    function bindHover(node, kind, object, details) {
        node.dataset.id = object.id;
        node.dataset.kind = kind;

        node.style.cursor = "help";

        node.addEventListener("mouseenter", () => {
            inspect(kind, details());
        });
    }

    function getRowBase(rowIndex) {
        return (
            padding +
            (project.rows.length - 1 - rowIndex) * rowGap +
            38
        );
    }

//-------------------------MAKE HELIX--------------------------------

    function strandCount(type) {
        switch (type) {
            case "dc":
                return 2;

            case "tr":
                return 3;

            case "dtr":
                return 4;

            default:
                return 1;
        }
    }

    function createHelixPath(x, yTop, yBase, strandIndex, totalStrands) {
        const height = yBase - yTop;
        const amplitude = totalStrands === 1 ? 0 : 4.5;
        const rotations = 1.5;

        const phase =
            (Math.PI * 2 * strandIndex) / totalStrands;

        const steps = 36;
        let path = "";

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;

            const y = yTop + height * t;

            const offset =
                Math.sin(
                    t * Math.PI * 2 * rotations + phase
                ) * amplitude;

            const px = x + offset;

            path +=
                `${i === 0 ? "M" : "L"} ${px} ${y} `;
        }

        return path;
    }

    function drawHelicalPost(group, stitch, x, yBase, yTop) {
        const strands = strandCount(stitch.type);

        for (let i = 0; i < strands; i++) {
            const path = createHelixPath(
                x,
                yTop,
                yBase,
                i,
                strands
            );

            const strand = add(group, "path", {
                d: path,
                fill: "none",
                stroke: stitch.color,
                "stroke-width": strands === 1 ? 5 : 3.8,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                opacity: 0.95
            });

            bindHover(
                strand,
                `strand-${i + 1}`,
                stitch.post,
                () => ({
                    ...inspectPost(stitch.post),
                    strand: i + 1,
                    totalStrands: strands
                })
            );
        }
    }

    //-------------------------TOP LOOPS--------------------------------

    function drawLoops(group, stitch, x, yTop) {
        const front = add(group, "ellipse", {
            cx: x - 4,
            cy: yTop - 4,
            rx: 5,
            ry: 3.5,
            fill: "none",
            stroke: "#3775A8",
            "stroke-width": 1.8
        });

        bindHover(
            front,
            "front-loop",
            stitch.top.front,
            () => inspectLoop(stitch.top.front, stitch)
        );

        const back = add(group, "ellipse", {
            cx: x + 4,
            cy: yTop - 4,
            rx: 5,
            ry: 3.5,
            fill: "none",
            stroke: "#725B82",
            "stroke-width": 1.8
        });

        bindHover(
            back,
            "back-loop",
            stitch.top.back,
            () => inspectLoop(stitch.top.back, stitch)
        );
    }

    //-------------------------INSERTION POINTS--------------------------------

    function drawInsertionPoint(group, stitch, x, yTop) {
        const point = add(group, "circle", {
            cx: x,
            cy: yTop - 13,
            r: 3,
            fill: stitch.insertionPoint.used
                ? "#8B5CF6"
                : "white",
            stroke: "#8B5CF6",
            "stroke-width": 1.5
        });

        bindHover(
            point,
            "insertion-point",
            stitch.insertionPoint,
            () => inspectInsertionPoint(stitch.insertionPoint)
        );
    }

    //-------------------------STITCHC SPACE--------------------------------

    function drawSpace(group, stitch, x, yBase, yTop) {
        const space = add(group, "circle", {
            cx: x + 12,
            cy: (yBase + yTop) / 2,
            r: 3.5,

            fill: stitch.space.used
                ? "#D97706"
                : stitch.space.canBeUsed
                    ? "white"
                    : "#D1D5D8",

            stroke: "#B77B26",
            "stroke-width": 1.2
        });

        bindHover(
            space,
            "space",
            stitch.space,
            () => inspectSpace(stitch.space)
        );
    }

    //-------------------------STITCH RENDER--------------------------------

    function drawStitch(stitch, rowIndex, stitchIndex) {
        const x = padding + stitchIndex * cellWidth + cellWidth / 2;
        const yBase = getRowBase(rowIndex);

        const postHeight = Math.max(
            12,
            stitch.height * 9
        );

        const yTop = yBase - postHeight;

        const group = add(svg, "g", {
            "data-stitch-id": stitch.id,
            class: "stitch-visual"
        });

        group.style.opacity = "0";
        group.style.transition = "opacity 300ms ease";

        drawGroups.push(group);

        drawHelicalPost(
            group,
            stitch,
            x,
            yBase,
            yTop
        );

        drawLoops(
            group,
            stitch,
            x,
            yTop
        );

        drawInsertionPoint(
            group,
            stitch,
            x,
            yTop
        );

        drawSpace(
            group,
            stitch,
            x,
            yBase,
            yTop
        );

        const hitbox = add(group, "rect", {
            x: x - 12,
            y: yTop - 17,
            width: 24,
            height: postHeight + 24,
            fill: "transparent",
            "pointer-events": "all"
        });

        group.insertBefore(hitbox, group.firstChild);

        bindHover(
            hitbox,
            "stitch",
            stitch,
            () => inspectStitch(stitch)
        );

        stitch._visual = {
            x,
            yBase,
            yTop
        };
    }

    //-------------------------CHAIN LINK--------------------------------

    function drawChainLink(link, x, y, vertical = false) {
        const group = add(svg, "g", {
            "data-chain-link-id": link.id
        });

        const linkElement = add(group, "ellipse", {
            cx: x,
            cy: y,
            rx: vertical ? 3.5 : 7,
            ry: vertical ? 7 : 3.5,
            fill: "none",
            stroke: "#8EECF5",
            "stroke-width": 2.8
        });

        bindHover(
            linkElement,
            "chain-link",
            link,
            () => ({
                id: link.id,
                kind: link.chain.kind,
                index: link.index,
                previous: link.previous?.id ?? null,
                next: link.next?.id ?? null,
                chain: link.chain.id
            })
        );
    }

    function drawChains() {
        for (const chain of project.chains) {
            if (chain.kind === "foundation") {
                const y = height - padding / 2;

                chain.links.forEach((link, index) => {
                    const x =
                        padding + index * cellWidth + cellWidth / 2;

                    drawChainLink(link, x, y);
                });

                continue;
            }

            if (chain.kind === "turning" && chain.row) {
                const rowIndex = chain.row.number;

                if (rowIndex === 0) {
                    continue;
                }

                const currentBase = getRowBase(rowIndex);
                const previousBase = getRowBase(rowIndex - 1);

                const x = padding - 12;

                chain.links.forEach((link, index) => {
                    const fraction =
                        (index + 1) / (chain.links.length + 1);

                    const y =
                        currentBase +
                        (previousBase - currentBase) * fraction;

                    drawChainLink(link, x, y, true);
                });
            }
        }
    }

    //-------------------------LABELS--------------------------------

    function drawRowLabels() {
        project.rows.forEach((row, index) => {
            const y = getRowBase(index);

            const label = add(svg, "text", {
                x: width - padding - 30,
                y: y + 4,
                fill: "#77738A",
                "font-size": 9,
                "text-anchor": "start"
            });

            label.textContent = `R${row.number + 1}`;
        });
    }

    //-------------------------DRAWING--------------------------------

    drawChains();
    drawRowLabels();

    project.rows.forEach((row, rowIndex) => {
        row.stitches.forEach((stitch, stitchIndex) => {
            drawStitch(
                stitch,
                rowIndex,
                stitchIndex
            );
        });
    });

    //-------------------------ANIMATE--------------------------------

    return {
        revealStitches(delay = 250) {
            this.reset();

            drawGroups.forEach((group, index) => {
                const timer = setTimeout(() => {
                    group.style.opacity = "1";
                }, index * delay);

                animationTimers.push(timer);
            });
        },

        reset() {
            animationTimers.forEach(clearTimeout);
            animationTimers.length = 0;

            drawGroups.forEach(group => {
                group.style.opacity = "0";
            });

            inspect(
                "Stitch inspector",
                "Hover over a crochet component to inspect it."
            );
        }
    };
}
