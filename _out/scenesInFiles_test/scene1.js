// scene1.js

import * as THREE from 'three';

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const boxMat = new THREE.LineBasicMaterial({ color: 0xffffff});
const box = new THREE.LineSegments(boxGeo, boxMat);

function scene1Animate(scene, sceneInProgress)
{
    if (sceneInProgress === false)
    {
        scene.add(box);
        return true;
    }
    else
    {
        if (box.position.y < -2)
        {
            scene.remove(box);
            return false;
        }
        else
        {
            box.position.y -= 0.05;
        }
    }
}

export { scene1Animate };