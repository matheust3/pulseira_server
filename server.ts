import { createServer, Server, IncomingMessage, ServerResponse } from "node:http";
import next from "next";
import { WebSocket, WebSocketServer } from "ws";
import { Socket } from "node:net";
import { dependencyContainer } from "./app/_lib/config/dependency-container";
import { DevicesRepository } from "./app/_lib/core/application/repositories/devices-repository";
import { Device } from "./app/_lib/core/domain/models/device";

const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
const handle = nextApp.getRequestHandler();
const clients: Set<WebSocket> = new Set();
const devicesSockets: Map<WebSocket, string> = new Map();
const devicesRepository = dependencyContainer.get<DevicesRepository>("DevicesRepository");

nextApp.prepare().then(() => {
  const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    handle(req, res);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket) => {
    clients.add(ws);
    console.log("New client connected");

    ws.on("message", async (message: Buffer) => {
      console.log(`Message received: ${message}`);

      let data;

      try {
        data = JSON.parse(message.toString());
      } catch (e) {
        console.error("Error parsing message:", e);
      }

      console.log(data);

      if (data.event === "device_info") {
        const device: Device = {
          id: data.deviceId,
          type: data.type,
          firmwareVersion: data.firmware,
        };
        devicesRepository.create(device);
        devicesSockets.set(ws, device.id);

        console.log(`Device ${device.id} connected and added to repository`);

        // Se um novo manager se conectar, envia para ele quais pulseiras já estão conectadas
        if (device.type === "manager") {
          const pulseiras = (await devicesRepository.findAll()).filter((d) => d.type === "pulseira");
          pulseiras.forEach((pulseira) => {
            const info = {
              event: "device_info",
              type: pulseira.type,
              deviceId: pulseira.id,
              firmware: pulseira.firmwareVersion,
            };
            ws.send(JSON.stringify(info));
          });
        }
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      const deviceId = devicesSockets.get(ws);
      devicesSockets.delete(ws);
      if (deviceId) {
        devicesRepository.delete(deviceId);
        console.log(`Device ${deviceId} disconnected and removed from repository`);
      }
      console.log("Client disconnected");
    });
  });

  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    // Criar URL absoluta com base no host do request
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost:3000"}`);
    const pathname = url.pathname;

    if (pathname === "/_next/webpack-hmr") {
      nextApp.getUpgradeHandler()(req, socket, head);
    }

    if (pathname === "/api/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });

  server.listen(3000);
  console.log("Server listening on port 3000");
});
