# SerialBridge (Android)

SerialBridge es una aplicación Android que actúa como un puente USB Serial ↔ WebSocket, permitiendo que aplicaciones web interactúen con dispositivos USB serial (Arduino, ESP, radios LoRa, etc.) desde Chrome en Android, donde la Web Serial API no está disponible.

El objetivo es emular un puerto serial accesible vía WebSocket local, manteniendo la conexión estable y persistente mientras el dispositivo USB esté conectado.

## ✨ Características

* USB Host (CDC / UART)
* WebSocket local (ws://127.0.0.1:8765)
* Comunicación bidireccional en tiempo real
* Conexión estable (no se cierra por inactividad)
* Compatible con HTML5 + JavaScript
* Sustituto funcional de navigator.serial en Android
* Arquitectura simple y determinista
* Basado en: usb-serial-for-android y NanoHTTPD / NanoWSD

## 🧠 Arquitectura
```markdown
┌──────────────┐
│  Web App     │
│  (HTML + JS) │
└───────┬──────┘
        │ WebSocket
        │ ws://127.0.0.1:8765
┌───────▼──────┐
│ SerialBridge │
│ Android App  │
│              │
│ ┌──────────┐ │
│ │WebSocket │◄┼────────────┐
│ │  Server  │ │            │
│ └────┬─────┘ │            │
│      │       │            │
│ ┌────▼─────┐ │            │
│ │ USB      │ │            │
│ │ Serial   │ │            │
│ │ Service  │─────────────┘
│ └────┬─────┘
│      │
│   USB OTG
│      │
└──────▼──────┘
   Dispositivo
   USB Serial
```

## 🚀 Flujo de funcionamiento

* La app Android se inicia
* Se levanta un WebSocket Server local
* Se detecta el dispositivo USB serial
* Se solicita permiso USB (una sola vez)
* Se abre el puerto serial
* El loop de lectura permanece activo
* Los datos fluyen:
- USB → WebSocket
- WebSocket → USB
* La conexión solo se pierde si:
- Se desconecta el USB
- Se cierra explícitamente la app

## 📦 Requisitos

* Android con USB Host
* Cable USB OTG
* Dispositivo USB serial (CDC / UART)
* Navegador con soporte WebSocket (Chrome recomendado)

## 🔌 Uso desde JavaScript
```js
const ws = new WebSocket("ws://127.0.0.1:8765");

ws.onopen = () => {
  console.log("Conectado al serial");
};

ws.onmessage = (e) => {
  const data = new TextDecoder().decode(e.data);
  console.log("RX:", data);
};

function send(data) {
  ws.send(new TextEncoder().encode(data));
}
```

## 🔐 Seguridad

* El WebSocket solo escucha en localhost
* No expone puertos externos
* No hay acceso remoto
* 1 cliente WebSocket a la vez (por diseño)

## ⚠️ Limitaciones conocidas

* No soporta múltiples clientes simultáneos
* No hay reconexión automática del WebSocket (lado web)
* No expone selección de puerto USB (usa el primer dispositivo válido)

## 🧪 Casos de uso

* Interfaces web para firmware
* Consolas CLI seriales
* Mesh radios (LoRa, SubGHz)
* Diagnóstico y configuración de nodos
* Sustituto de Web Serial API en Android

## 🛠 Tecnologías

* Kotlin
* Android Service
* USB Host API
* usb-serial-for-android
* NanoHTTPD / NanoWSD
* WebSocket
* HTML5 / JavaScript

## 📌 Estado del proyecto

* 🟢 Funcional
* 🔧 En evolución
* 📦 Apto para uso real

## 👤 Autor

* <b>Allan Ayes Ramírez</b>
* <b>MSc. Educación Tecnológica</b>
* <b>Ingeniero de Software</b>

📄 Licencia

MIT License
