import {parsePattern} from "./Parser.js";
import {doRender} from "./Renderer.js";
import {validateProject} from "./Validation.js";
import {interpretPattern} from "./Interpret.js";


export function buildProject(text, options = {}) {
    const instructions = parsePattern(text);

    const firstRowCount = instructions[0].reduce(
        (total, instruction) => {
            if (instruction.type === "ch") {
                return total;
            }

            if (instruction.modifier?.type === "inc") {
                return total +
                    instruction.count * instruction.modifier.count;
            }

            if (instruction.modifier?.type === "tog") {
                return total + instruction.count;
            }

            return total + instruction.count;
        },
        0
    );

    const foundationCount = options.foundation ?? firstRowCount;

    const project = interpretPattern(
        instructions,
        {
        ...options,
        foundationCount
        }
    );

    validateProject(project);

    return project;
}

//----------------------------------------------DISPLAY--------------------------------------------

export function displayProject(project){
    validateProject(project);
    const visualizer = doRender(project);

    document.getElementById("crochet-play").onclick = () => {
        visualizer.reset();
        visualizer.revealStitches(450);
    };

    document.getElementById("crochet-reset").onclick = () => {
        visualizer.reset();
    };

    return visualizer;
}