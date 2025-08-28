'use client'
import { useEffect, useRef, useState } from 'react'

interface Device {
  deviceId: string
  type: string
  firmware: string
  status: 'online' | 'offline'
  connectedAt: Date
}

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([])
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'connecting'
  >('connecting')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnectionStatus('connected')

      // Enviar evento device_info automaticamente quando conectar
      const deviceInfo = {
        event: 'device_info',
        type: 'manager',
        deviceId: `manager_${Date.now()}`,
        firmware: 'web_1.0.0',
      }

      ws.send(JSON.stringify(deviceInfo))
    }

    ws.onclose = () => {
      setConnectionStatus('disconnected')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Ignorar mensagens ping/pong
        if (data.event === 'ping' || data.event === 'pong') {
          return
        }

        // Adicionar device quando receber device_info de pulseira
        if (data.event === 'device_info' && data.type === 'pulseira') {
          setDevices((prevDevices) => {
            // Verificar se o device já existe na lista
            const existingDevice = prevDevices.find(
              (device) => device.deviceId === data.deviceId,
            )

            if (existingDevice) {
              // Atualizar status para online se já existir
              return prevDevices.map((device) =>
                device.deviceId === data.deviceId
                  ? { ...device, status: 'online' as const }
                  : device,
              )
            } else {
              // Adicionar novo device
              const newDevice: Device = {
                deviceId: data.deviceId,
                type: data.type,
                firmware: data.firmware,
                status: 'online',
                connectedAt: new Date(),
              }
              return [...prevDevices, newDevice]
            }
          })
        }

        // Remover device quando receber device_disconnected
        if (data.event === 'device_disconnected') {
          setDevices((prevDevices) =>
            prevDevices.filter((device) => device.deviceId !== data.deviceId),
          )
        }
      } catch (error) {
        // Se não for JSON válido, ignorar
        console.log('Received non-JSON message:', event.data)
      }
    }

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(`{"event":"ping"}`)
      }
    }, 30000) // Ping a cada 30 segundos

    return () => {
      clearInterval(pingInterval)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header com status de conexão */}
        <div
          className={`px-6 py-4 rounded-t-xl border-b ${
            connectionStatus === 'connected'
              ? 'bg-green-50 text-green-700 border-green-100'
              : connectionStatus === 'disconnected'
                ? 'bg-red-50 text-red-700 border-red-100'
                : 'bg-yellow-50 text-yellow-700 border-yellow-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-500'
                    : connectionStatus === 'disconnected'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                }`}
              ></div>
              <span className="font-medium">
                Status do Manager: {connectionStatus}
              </span>
            </div>
            <div className="text-sm">
              Devices conectados:{' '}
              {devices.filter((d) => d.status === 'online').length}
            </div>
          </div>
        </div>

        {/* Lista de devices */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Pulseiras Conectadas
          </h2>

          {devices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">📱</div>
              <p className="text-gray-500">Nenhuma pulseira conectada</p>
              <p className="text-gray-400 text-sm mt-1">
                As pulseiras aparecerão aqui quando se conectarem
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => (
                <div
                  key={device.deviceId}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 truncate">
                      {device.deviceId}
                    </h3>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        device.status === 'online'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {device.status}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-medium">{device.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Firmware:</span>
                      <span className="font-medium">{device.firmware}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conectado:</span>
                      <span className="font-medium">
                        {formatTime(device.connectedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Indicador visual de status */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          device.status === 'online'
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                        }`}
                      ></div>
                      <span className="text-xs text-gray-500">
                        {device.status === 'online'
                          ? 'Online agora'
                          : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer com informações */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Monitor de Pulseiras - Tempo real</span>
            <span>
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
