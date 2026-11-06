
import { doRender } from "./Renderer.js";
import { buildProject } from "./Project.js";

const patternText = `
3 sc, 2 hdc, 1 dc
4 sc
`;

const project = buildProject(patternText);

const visualizer = doRender(project);

const playButton = document.getElementById("crochet-play");

if (playButton) {
    playButton.addEventListener("click", () => {
        visualizer.reset();
        visualizer.revealStitches(450);
    });
}

const resetButton = document.getElementById("crochet-reset");

if (resetButton) {
    resetButton.addEventListener("click", () => {
        visualizer.reset();
    });
}

document.addEventListener('DOMContentLoaded', () => {


const patternInput =
    document.getElementById("pattern-input");

const errorMessage =
    document.getElementById("error-message");

const inspector =
    document.getElementById("crochet-inspector");

let currentProject = null;
let visual = null;

function buildVisualization() {
    try {
        errorMessage.textContent = "";

        currentProject = buildProject(
            patternInput.value
        );

        visual = doRender(currentProject);

    } catch (error) {
        errorMessage.textContent = error.message;

        console.error(error);
    }
}

document
    .getElementById("build")
    .addEventListener("click", () => {
        buildVisualization();
    });

document
    .getElementById("play")
    .addEventListener("click", () => {
        if (!visualizer) return;

        visualizer.reset();
        visualizer.revealStitches(250);
    });

document
    .getElementById("reset")
    .addEventListener("click", () => {
        if (!visualizer) return;

        visualizer.reset();
    });

buildVisualization();

});