
//TODO faire un formulaire pour saisir le texte et un bouton
async function fetchModel() {
/*
const response = await fetch("http://127.0.0.1:5000/get-scene/QUENTIN")
const responseText = await response.text()
console.log(responseText)
displayScene(responseText)
*/
}

//fetchModel()

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

// Add your code here matching the playground format
const createScene =  () => {
const scene = new BABYLON.Scene(engine);
    scene.createDefaultEnvironment();
    //var hdrTexture = new BABYLON.HDRCubeTexture("mountain.hdr", scene, 512);
    //scene.environmentTexture = hdrTexture;

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

    //API call to get the generated scene
    /*
    BABYLON.SceneLoader.Append("", "data:" + gltfScene, scene, function (scene) {
    // The default camera looks at the back of the asset.
    // Rotate the camera by 180 degrees to the front of the asset.
    scene.activeCamera.alpha += Math.PI;
    });*/

BABYLON.SceneLoader.Append("model/", "sceneText.gltf", scene, function (scene) {
        // The default camera looks at the back of the asset.
        // Rotate the camera by 180 degrees to the front of the asset.
        scene.activeCamera.alpha += Math.PI;
    });

    return scene;
}

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});