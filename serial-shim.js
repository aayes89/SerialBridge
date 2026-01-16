(function () {

  // Si existe WebSerial real (desktop), NO hacemos nada
  if (navigator.serial) {
    console.log("WebSerial nativo disponible");
    return;
  }

  console.log("WebSerial NO disponible, usando FakeSerialPort");

  class FakeSerialPort {
    constructor() {
      this.ws = null;
      this.readable = null;
      this.writable = null;
    }

    async open(options) {
      const url = "ws://127.0.0.1:8765";

      this.ws = new WebSocket(url);
      this.ws.binaryType = "arraybuffer";

      await new Promise((resolve, reject) => {
        this.ws.onopen = resolve;
        this.ws.onerror = reject;
      });

      this.readable = new ReadableStream({
        start: controller => {
          this.ws.onmessage = e => {
            controller.enqueue(new Uint8Array(e.data));
          };
          this.ws.onclose = () => controller.close();
        }
      });

      this.writable = new WritableStream({
        write: chunk => {
          if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(chunk);
          }
        }
      });
    }

    async close() {
      if (this.ws) this.ws.close();
    }
  }

  navigator.serial = {
    async requestPort() {
      return new FakeSerialPort();
    }
  };

})();
