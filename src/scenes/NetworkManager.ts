import { io, Socket } from "socket.io-client";
import { Scene, Vector3, MeshBuilder, Mesh } from "@babylonjs/core";

export class NetworkManager {
    private socket: Socket;
    private playerId: string | null = null;
    private scene: Scene;
    private playerMesh: Mesh;
    private remotePlayers: { [id: string]: Mesh } = {};

    constructor(scene: Scene, playerMesh: Mesh) {
        this.scene = scene;
        this.playerMesh = playerMesh;
        this.socket = io("/", {
          path: "/socket.io",
        });

        this.socket.on("connect", () => {
            console.log("[🌐 Multiplayer] Connected to server ✅ ID:", this.socket.id);
        });
        this.socket.on("connect_error", (err) => {
            console.error("[❌ Multiplayer] Connection error:", err.message);
        });

        this.socket.on("connect", () => {
            console.log("[Network] Connected:", this.socket.id);
            this.playerId = this.socket.id;

            // Send your own spawn info
            this.socket.emit("new-player", {
                position: playerMesh.position,
                rotation: playerMesh.rotation
            });
        });

        this.socket.on("all-players", (players) => {
            console.log("[🌐 Multiplayer] Existing players:", players);

            for (const id in players) {
                if (id === this.playerId) continue; // Don't spawn yourself

                const data = players[id];

                const remoteMesh = MeshBuilder.CreateBox("remotePlayer_" + id, { size: 1 }, this.scene);
                remoteMesh.position = new Vector3(data.position.x, data.position.y, data.position.z);
                remoteMesh.rotation.y = data.rotation.y;

                this.remotePlayers[id] = remoteMesh;
            }
        });

        this.socket.on("player-joined", (data) => {
            console.log("[Network] New player:", data.id);

            if (data.id === this.playerId) return; // Don't spawn yourself

            const remoteMesh = MeshBuilder.CreateBox("remotePlayer_" + data.id, { size: 1 }, this.scene);
            remoteMesh.position = new Vector3(data.position.x, data.position.y, data.position.z);
            remoteMesh.rotation.y = data.rotation.y;

            this.remotePlayers[data.id] = remoteMesh;
        });

        this.socket.on("player-moved", (data) => {
            const remoteMesh = this.remotePlayers[data.id];
            if (remoteMesh) {
                remoteMesh.position.x = data.position.x;
                remoteMesh.position.y = data.position.y;
                remoteMesh.position.z = data.position.z;
                remoteMesh.rotation.y = data.rotation.y;
            }
        });

        this.socket.on("player-left", (data) => {
            const remoteMesh = this.remotePlayers[data.id];
            if (remoteMesh) {
                remoteMesh.dispose();
                delete this.remotePlayers[data.id];
            }
        });



        // Send movement every frame
        scene.onBeforeRenderObservable.add(() => {
            if (this.socket.connected && playerMesh) {
                this.socket.emit("move", {
                    position: {
                        x: playerMesh.position.x,
                        y: playerMesh.position.y,
                        z: playerMesh.position.z,
                    },
                    rotation: {
                        y: playerMesh.rotation.y
                    }
                });
            }
        });
    }
}
