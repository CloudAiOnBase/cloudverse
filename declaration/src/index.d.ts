import { Engine, Scene } from "@babylonjs/core";
import "@babylonjs/materials";
export declare class Game {
    engine: Engine;
    scene: Scene;
    private readonly _respawnPosition;
    constructor();
    private _loadScene;
    private _bindEvents;
    private _respawnCameraIfNeeded;
}
