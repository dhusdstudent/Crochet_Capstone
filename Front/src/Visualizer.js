
import { doRender } from "./Renderer.js";
import { buildProject } from "./Project.js";

const patternText = `
3 sc, 2 hdc, 1 dc
4 sc
`;

document.addEventListener("DOMContentLoaded", () => {
    const patternInput = document.getElementById("pattern-input");

    const errorMessage = document.getElementById("error-message");
    const buildButton = document.getElementById("build");

    const playButton = document.getElementById("play");
    const resetButton = document.getElementById("reset");

    let currentProject = null;
    let visualizer = null;

    function buildVisualization() {
        try {
            errorMessage.textContent = "";

            const project = buildProject(
                patternInput.value
            );

            const nextVisualizer = doRender(project);

            currentProject = project;
            visualizer = nextVisualizer;

            visualizer.revealNextRow(0);

        } catch (error){
            errorMessage.textContent = error.message;
            console.error(error);
        }
    }

    buildButton.addEventListener(
        "click",
        buildVisualization
    );

    playButton.addEventListener("click", () => {
        if (!visualizer) return;

        visualizer.revealStitches(250);
    });

    resetButton.addEventListener("click", () => {
        if (!visualizer) return;

        visualizer.reset();
        visualizer.revealNextRow(0);
    });

    buildVisualization();
})