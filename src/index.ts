import { BabylonFileLoaderConfiguration, Engine, Scene, Vector3 } from "@babylonjs/core";
import "@babylonjs/materials";
import { Player } from "./scenes/Player";

import * as CANNON from "cannon";

import { appendScene } from "./scenes/tools";

export class Game {
    public engine: Engine;
    public scene: Scene;

    // Define the respawn position (adjust as needed)
    private readonly _respawnPosition = new Vector3(0, 5, -10);

    public constructor() {
        this.engine = new Engine(document.getElementById("renderCanvas") as HTMLCanvasElement, true);
        this.scene = new Scene(this.engine);
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CANNON.World());


        this._bindEvents();
        this._loadScene();
    }

    private async _loadScene(): Promise<void> {
        const rootUrl = "./scenes/_assets/";

        BabylonFileLoaderConfiguration.LoaderInjectedPhysicsEngine = CANNON;

        await appendScene(this.scene, rootUrl, "../scene/scene.babylon");

        // Create player
        const player = new Player(this.scene);

        if (!this.scene.activeCamera) {
            throw new Error("No camera defined in the scene. Please add at least one camera in the project or create one yourself in the code.");
        }

        // Start rendering loop and add respawn check
        this.engine.runRenderLoop(() => {
            this.scene.render();
            this._respawnCameraIfNeeded();
        });
    }

    private _bindEvents(): void {
        window.addEventListener("resize", () => this.engine.resize());
    }

    // 🔁 Respawn the camera if it falls below a threshold
    private _respawnCameraIfNeeded(): void {
        const cam = this.scene.activeCamera;
        if (cam && cam.position.y < -10) {
            console.log("[CloudVerse] Camera fell, respawning...");
            cam.position.copyFrom(this._respawnPosition);
            if ("setTarget" in cam) {
                (cam as any).setTarget(Vector3.Zero());
            }
        }
    }
}
