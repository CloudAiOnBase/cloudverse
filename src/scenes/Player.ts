import {
    Scene,
    Vector3,
    MeshBuilder,
    UniversalCamera,
    Mesh,
    PhysicsImpostor,
    KeyboardEventTypes
} from "@babylonjs/core";

export class Player {
    public mesh: Mesh;
    public camera: UniversalCamera;
    private _inputMap: { [key: string]: boolean } = {};

    constructor(scene: Scene) {
        // Create invisible body
        this.mesh = MeshBuilder.CreateBox("playerBody", { width: 1, depth: 1, height: 2 }, scene);
        this.mesh.position = new Vector3(0, 5, 0);
        this.mesh.isVisible = false;

        // Physics
        this.mesh.physicsImpostor = new PhysicsImpostor(
            this.mesh,
            PhysicsImpostor.BoxImpostor,
            { mass: 1, friction: 0.5, restitution: 0 },
            scene
        );

        // Camera setup (not parented)
        this.camera = new UniversalCamera("playerCam", this.mesh.position.clone().add(new Vector3(0, 1.5, 0)), scene);
        this.camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

        scene.activeCamera = this.camera;

        // Keyboard input
        scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key.toLowerCase();
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                this._inputMap[key] = true;
            } else if (kbInfo.type === KeyboardEventTypes.KEYUP) {
                this._inputMap[key] = false;
            }
        });

        // Update loop
        scene.onBeforeRenderObservable.add(() => {
            // Sync camera position to mesh
            this.camera.position.copyFrom(this.mesh.position).addInPlace(new Vector3(0, 1.5, 0));

            // Mouse look → rotate player mesh on Y
            this.mesh.rotation.y = this.camera.rotation.y;
            this.camera.rotation.x = Math.max(Math.min(this.camera.rotation.x, Math.PI / 2), -Math.PI / 2);
            this.camera.rotation.z = 0;

            // Movement
            const direction = this._getDirection();
            const vel = this.mesh.physicsImpostor?.getLinearVelocity() || Vector3.Zero();
            const moveSpeed = 4;

            const newVel = new Vector3(direction.x * moveSpeed, vel.y, direction.z * moveSpeed);
            this.mesh.physicsImpostor?.setLinearVelocity(newVel);

            // Jump
            if (this._inputMap[" "] && Math.abs(vel.y) < 0.1) {
                this.mesh.physicsImpostor?.applyImpulse(new Vector3(0, 5, 0), this.mesh.getAbsolutePosition());
            }
        });
    }

    private _getDirection(): Vector3 {
        const y = this.mesh.rotation.y;
        const forward = new Vector3(Math.sin(y), 0, Math.cos(y)).normalize();
        const right = Vector3.Cross(forward, Vector3.Up()).normalize();

        let move = Vector3.Zero();

        if (this._inputMap["w"] || this._inputMap["z"]) move = move.add(forward);
        if (this._inputMap["s"]) move = move.subtract(forward);
        if (this._inputMap["a"] || this._inputMap["q"]) move = move.subtract(right);
        if (this._inputMap["d"]) move = move.add(right);

        move.y = 0;
        return move.normalize();
    }
}

