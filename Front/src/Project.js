import {parsePattern} from "./Parser.js";
import {doRender} from "./Renderer.js";
import {validateProject} from "./Validation.js";
import {interpretPattern} from "./Interpret.js";

export function buildProject(text) {
    const instructions = parsePattern(text);
    const project = interpretPattern(instructions);

    validateProject(project);

    return project;
}

//----------------------------------------------DISPLAY--------------------------------------------

function displayProject(project){
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