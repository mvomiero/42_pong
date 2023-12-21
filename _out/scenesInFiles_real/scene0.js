// scene0.js

import * as THREE from 'three';
import { FontLoader } from 'three/FontLoader';
import { TextGeometry } from 'three/TextGeometry';

const textSize = 0.5;
const textHeight = 0.3;
const p1Material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const vsMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
const p2Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const p1Mesh = new THREE.Mesh(p1Geom, p1Material);
const vsMesh = new THREE.Mesh(vsGeom, vsMaterial);
const p2Mesh = new THREE.Mesh(p2Geom, p2Material);

function scene0Animate(sceneProperties) {
    switch(sceneProperties.shotNum) {
        case 0:
            if (sceneProperties.sceneInProgress === false) {
                p1Mesh.position.x -= 11; // start x
                p1Mesh.position.y += 1;
                sceneProperties.scene.add(p1Mesh);
                sceneProperties.sceneInProgress = true;
            } else {
                if(p1Mesh.position.x < -3) // end x
                {
                    p1Mesh.position.x += 0.3; // speed
                }
                else
                {
                    vsMesh.position.z -= 10; // start z
                    sceneProperties.scene.add(vsMesh);
                    sceneProperties.shotNum++;
                }
            }
            break;
        case 1:
            if(vsMesh.position.z < 0) // end z
            {
                vsMesh.position.z += 0.4; // speed
            }
            else
            {
                p2Mesh.position.x += 9; // start x
                p2Mesh.position.y -= 1;
                sceneProperties.scene.add(p2Mesh);
                sceneProperties.shotNum++;
            }
            break;
        case 2:
            if(p2Mesh.position.x > 1) // end x
            {
                p2Mesh.position.x -= 0.3; // spped
            }
            else
            {
                sceneProperties.shotNum++;
            }
            break;
        case 3:
            if (frameCounter < 70)
            {
                sceneProperties.frameCounter++;
            }
            else
            {
                scene.remove(p1Mesh);
                scene.remove(vsMesh);
                scene.remove(p2Mesh);
                sceneProperties.shotNum = 0;
                sceneProperties.frameCounter = 0;
                sceneProperties.sceneNum++;
            }
            break;
        }
}

export { scene0Animate };