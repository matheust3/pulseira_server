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
// Novo mapa para rastrear múltiplas conexões por device
const deviceConnections: Map<string, Set<WebSocket>> = new Map();
const devicesRepository = dependencyContainer.get<DevicesRepository>("DevicesRepository");

// Mapa para controlar pings e timeouts
const devicePingStatus: Map<string, { lastPing: number; timeout?: NodeJS.Timeout }> = new Map();

nextApp.prepare().then(() => {
  const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    handle(req, res);
  });

  const wss = new WebSocketServer({ noServer: true });

  // Função para verificar dispositivos inativos
  const checkInactiveDevices = (): void => {
    const now = Date.now();
    const TIMEOUT_MS = 60000; // 60 segundos - aumentado para evitar desconexões desnecessárias

    devicePingStatus.forEach((status, deviceId) => {
      if (now - status.lastPing > TIMEOUT_MS) {
        console.log(`Device ${deviceId} inactive for ${(now - status.lastPing) / 1000}s - checking connections...`);

        // Verificar se ainda há conexões ativas para este device
        const connections = deviceConnections.get(deviceId);
        if (connections && connections.size > 0) {
          // Verificar se alguma conexão ainda está ativa
          let hasActiveConnection = false;
          connections.forEach((socket) => {
            if (socket.readyState === WebSocket.OPEN) {
              hasActiveConnection = true;
            }
          });

          if (!hasActiveConnection) {
            console.log(`No active connections for device ${deviceId} - removing from repository`);
            // Limpar todas as conexões inativas
            connections.clear();
            deviceConnections.delete(deviceId);
            devicePingStatus.delete(deviceId);

            // Remover do repositório
            devicesRepository.delete(deviceId).catch((error) => {
              console.error(`Error deleting device ${deviceId}:`, error);
            });
          } else {
            console.log(`Device ${deviceId} still has active connections - keeping alive`);
            // Atualizar lastPing se há conexões ativas
            status.lastPing = Date.now();
          }
        }
      }
    });
  };

  // Verificar dispositivos inativos a cada 1 segundo
  setInterval(checkInactiveDevices, 1000);

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
        return;
      }

      console.log(data);

      // Atualizar ping status quando receber qualquer mensagem
      const deviceId = devicesSockets.get(ws);
      if (deviceId) {
        const status = devicePingStatus.get(deviceId);
        if (status) {
          status.lastPing = Date.now();
        }
      }

      // Responder a pings
      if (data.event === "ping") {
        ws.send(JSON.stringify({ event: "pong" }));
        return;
      }

      if (data.event === "device_info") {
        const device: Device = {
          id: data.deviceId,
          type: data.type,
          firmwareVersion: data.firmware,
        };

        try {
          // Verificar se o device já existe
          const existingDevice = await devicesRepository.findById(device.id);

          if (!existingDevice) {
            await devicesRepository.create(device);
            console.log(`Device ${device.id} created in repository`);
          } else {
            console.log(`Device ${device.id} already exists - updating connection`);
          }

          // Adicionar socket ao mapeamento
          devicesSockets.set(ws, device.id);

          // Adicionar conexão ao mapa de múltiplas conexões
          if (!deviceConnections.has(device.id)) {
            deviceConnections.set(device.id, new Set());
          }
          deviceConnections.get(device.id)!.add(ws);

          // Inicializar ou atualizar status de ping
          devicePingStatus.set(device.id, { lastPing: Date.now() });

          console.log(`Device ${device.id} connected. Total connections: ${deviceConnections.get(device.id)!.size}`);

          // Se um novo manager se conectar, envia para ele quais pulseiras já estão conectadas
          if (device.type === "manager") {
            const allDevices = await devicesRepository.findAll();
            const pulseiras = allDevices.filter((d) => d.type === "pulseira");

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

          // Se uma nova pulseira se conectar, envia para todos os managers
          if (device.type === "pulseira") {
            const allDevices = await devicesRepository.findAll();
            const managers = allDevices.filter((d) => d.type === "manager");

            managers.forEach((manager) => {
              const info = {
                event: "device_info",
                type: device.type,
                deviceId: device.id,
                firmware: device.firmwareVersion,
              };

              deviceConnections.get(manager.id)?.forEach((socket) => {
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify(info));
                }
              });
            });
          }
        } catch (error) {
          console.error("Error creating device:", error);
        }
      }
    });

    ws.on("close", async () => {
      clients.delete(ws);
      const deviceId = devicesSockets.get(ws);
      devicesSockets.delete(ws);

      if (deviceId) {
        // Remover esta conexão específica do mapa de conexões
        const connections = deviceConnections.get(deviceId);
        if (connections) {
          connections.delete(ws);
          console.log(`Connection closed for device ${deviceId}. Remaining connections: ${connections.size}`);

          // Só remover do repositório se não há mais conexões ativas
          if (connections.size === 0) {
            try {
              const device = await devicesRepository.findById(deviceId);
              if (device?.type === "pulseira") {
                // Notifica os managers que a pulseira foi desconectada
                const allDevices = await devicesRepository.findAll();
                const managers = allDevices.filter((d) => d.type === "manager");
                for (const manager of managers) {
                  const info = {
                    event: "device_disconnected",
                    deviceId: device.id,
                  };

                  deviceConnections.get(manager.id)?.forEach((socket) => {
                    if (socket.readyState === WebSocket.OPEN) {
                      socket.send(JSON.stringify(info));
                    }
                  });
                }
              }

              // Agendar remoção com delay para permitir reconexão
              setTimeout(async () => {
                const currentConnections = deviceConnections.get(deviceId);
                if (!currentConnections || currentConnections.size === 0) {
                  await devicesRepository.delete(deviceId);
                  devicePingStatus.delete(deviceId);
                  deviceConnections.delete(deviceId);
                  console.log(`Device ${deviceId} permanently removed from repository`);
                }
              }, 5000); // 5 segundos de delay
            } catch (error) {
              console.error("Error handling device disconnection:", error);
            }
          }
        }
      }
      console.log("Client disconnected");
    });

    // Enviar ping periodicamente para testar conexão
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: "ping" }));
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Ping a cada 30 segundos

    ws.on("close", () => {
      clearInterval(pingInterval);
    });
  });

  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
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
