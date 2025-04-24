import { Scene, UniversalCamera, Mesh } from "@babylonjs/core";
export declare class Player {
    mesh: Mesh;
    camera: UniversalCamera;
    private _inputMap;
    constructor(scene: Scene);
    private _getDirection;
}
