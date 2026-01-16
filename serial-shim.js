(function () {
  if (navigator.serial) {
    console.log("WebSerial nativo disponible");
    return;
  }
  console.log("Usando FakeSerialPort con reconexión");

  class FakeSerialPort {
    constructor() {
      this.ws = null;
      this.readable = null;
      this.writable = null;
      this.reconnectTimer = null;
    }

    async open(options) {
      this.connect();
      
      this.readable = new ReadableStream({
        start: controller => {
          this.controller = controller;  // guarda para enqueue
        }
      });

      this.writable = new WritableStream({
        write: chunk => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(chunk);
          }
        }
      });
    }

    connect() {
      const url = "ws://127.0.0.1:8765";
      this.ws = new WebSocket(url);
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        console.log("WS conectado");
        clearTimeout(this.reconnectTimer);
        // Opcional: envía un "hello" o config inicial
      };

      this.ws.onmessage = e => {
        if (this.controller) {
          this.controller.enqueue(new Uint8Array(e.data));
        }
      };

      this.ws.onclose = (event) => {
        console.log("WS cerrado:", event.code, event.reason);
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error("WS error:", err);
        this.scheduleReconnect();
      };
    }

    scheduleReconnect() {
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => this.connect(), 1500);  // reintenta en 1.5s
    }

    async close() {
      if (this.ws) this.ws.close();
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      if (this.controller) this.controller.close();
    }
  }

  navigator.serial = {
    async requestPort() {
      return new FakeSerialPort();
    }
  };

  // Opcional: ping desde cliente cada 3s para mantener vivo (Chrome responde auto)
  setInterval(() => {
    if (fakePort?.ws?.readyState === WebSocket.OPEN) {
      fakePort.ws.send(new Uint8Array(0));  // ping vacío
    }
  }, 3000);
})();
