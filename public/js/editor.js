import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import {TTFLoader} from "TTFLoader";
import {FontLoader} from "FontLoader";
import {TextGeometry} from "TextGeometry";
import {RGBELoader} from "RGBELoader";
import applyBoxUV from "uvmapping";

const inputText = document.getElementById("input-text");
const selectFont = document.querySelector("#select-font");
const selectMaterial = document.querySelector("#materialSelector");
const rangeSlideExtrude = document.getElementById("extrude");

const fontLoader = new FontLoader();
const ttfLoader = new TTFLoader();
const textureLoader = new THREE.TextureLoader();
const hdrLoader = new RGBELoader();

const hdrTextureURL = new URL("../images/MR_INT-006_LoftIndustrialWindow_Griffintown.hdr", import.meta.url);

let text = 'TEST';
let textFont = "airstrike.ttf";
let textMaterial = "metal_plates";
let textMesh;
let textGeo;
let extrude = 2;

let controls;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 500 );

hdrLoader.load(hdrTextureURL, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
});

let myCanvas = document.getElementById('renderCanvas');

const renderer = new THREE.WebGLRenderer({canvas: myCanvas, antialias: true});
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( myCanvas.getBoundingClientRect().width, myCanvas.getBoundingClientRect().height );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const cube = new THREE.Mesh( geometry, material );
cube.position.x = 1
cube.position.y = 2
scene.add( cube );

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100,100),
    new THREE.MeshStandardMaterial({color: 0x4e8f38})
)
ground.receiveShadow = true;
ground.rotation.x = - Math.PI / 2;
//scene.add(ground);

camera.position.z = 50;

controls = new OrbitControls(camera, renderer.domElement);

// interactivity handling
function updateText() {
    scene.remove(textMesh);
    if (!text) return;
    createText();
}

function createText() {
    ttfLoader.load(`fonts/${textFont}`, (json) => {
        const font = fontLoader.parse(json);
        let textGeo = new TextGeometry( text, {
            font: font,

            size: 50,
            height: 10,
            curveSegments: 8,

            bevelThickness: extrude,
            bevelSize: 0.1,
            bevelEnabled: true
        } );

        console.log(textGeo);

        textGeo.computeBoundingBox();

        let metalnessAmount;
        let roughnessAmount;
        let metalnessMap;

        fetch(`./materials/${textMaterial}/material.json`)
        .then(response => response.json())
        .then(jsonResponse => {
        if (jsonResponse["metal"]) {
            metalnessAmount = jsonResponse["metal"];
            roughnessAmount = 0;
            metalnessMap = textureLoader.load(`../materials/${textMaterial}/metalness.jpg`)
        }
        else {
            metalnessAmount = 0;
            roughnessAmount = jsonResponse["roughness"];
            metalnessMap = null;
        }
        // material
        
        // load chosen material
        const baseColor = textureLoader.load(`../materials/${textMaterial}/color.jpg`);
        const displacementMap = textureLoader.load(`../materials/${textMaterial}/displacement.jpg`);
        const roughnessMap = textureLoader.load(`../materials/${textMaterial}/roughness.jpg`);
        const normalMap = textureLoader.load(`../materials/${textMaterial}/normals.jpg`);

        const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
        // todo ecrire description materiaux dans material.json
        const textMat = new THREE.MeshStandardMaterial(
            {
                map: baseColor,
                roughnessMap: roughnessMap,
                roughness: roughnessAmount,
                metalnessmap: metalnessMap,
                metalness: metalnessAmount,
                normalMap: normalMap,
                normalScale: new THREE.Vector2(0.1,0.1),
                side: THREE.DoubleSide,
            }
        );

        textMat.map.wrapS = THREE.RepeatWrapping;
        textMat.map.wrapT = THREE.RepeatWrapping;
        
        // uv geometry projection
        //compute UV
        console.log(textGeo.boundingBox.min)
        //let boxSize = textGeo.boundingBox.getSize();
        //let uvMapSize = Math.min(boxSize.x, boxSize.y, boxSize.z);
        let uvMapSize = 500;

        textMesh = new THREE.Mesh( textGeo, textMat );
        // position
        textMesh.position.x = centerOffset;
        textMesh.position.y = 1;
        textMesh.position.z = 0;

        textMesh.rotation.x = 0;
        textMesh.rotation.y = Math.PI * 2;
        scene.add(textMesh);

        let boxGeometry = new THREE.BoxBufferGeometry(uvMapSize, uvMapSize, uvMapSize);
        let cube = new THREE.Mesh(boxGeometry, textMat);
        console.log(new THREE.Matrix4().invert(cube.matrix))
        //scene.add(cube);

        // Box projection
        applyBoxUV(textGeo, new THREE.Matrix4().invert(cube.matrix), uvMapSize);
        textGeo.attributes.uv.needsUpdate = true;
    })
        })
    
}

createText();

function animate() {
    controls.update();
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
};

selectFont.addEventListener('change', (e) => {
    console.log(selectFont.value)
    textFont = selectFont.value;
    updateText();
} );

selectMaterial.addEventListener('click', (e) => {
    console.log(selectMaterial.dataset.currentmat);
    textMaterial = selectMaterial.dataset.currentmat;
    updateText();
} );

inputText.addEventListener('input', (e) => {
    console.log(inputText.value)
    text = inputText.value;
    updateText();
} );

rangeSlideExtrude.addEventListener('change', (e) => {
    console.log(rangeSlideExtrude.value)
    extrude = rangeSlideExtrude.value;
    updateText();
} );

animate();