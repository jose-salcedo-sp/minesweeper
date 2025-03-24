import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import net from "net";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();
app.use("api/*", cors());

/**
 * Singleton class to manage a persistent TCP connection.
 */
class TCPClient {
  static instance;

  /**
   * Creates an instance of TCPClient.
   * @param {string} host - TCP server hostname.
   * @param {number} port - TCP server port.
   */
  constructor(host, port) {
    if (TCPClient.instance) {
      return TCPClient.instance;
    }

    this.host = host;
    this.port = port;
    this.client = null;
    this.isConnected = false;
    this.pendingRequests = [];
    this.currentResolver = null;

    this.connect();

    TCPClient.instance = this;
  }

  /**
   * Establishes a connection to the TCP server.
   * Automatically attempts to reconnect if disconnected.
   */
  connect() {
    this.client = new net.Socket();

    this.client.connect(this.port, this.host, () => {
      console.log("✅ Connected to TCP server");
      this.isConnected = true;

      // Send pending requests after reconnecting
      while (this.pendingRequests.length > 0) {
        const { message, resolve } = this.pendingRequests.shift();
        this.sendMessage(message).then(resolve);
      }
    });

    this.client.on("data", (data) => {
      console.log("📩 Received from TCP server:", data.toString());
      if (this.currentResolver) {
        this.currentResolver(data.toString());
        this.currentResolver = null;
      }
    });

    this.client.on("error", (err) => {
      console.error("❌ TCP Connection Error:", err);
      this.isConnected = false;
    });

    this.client.on("close", () => {
      console.log("⚠️ TCP Connection Closed. Attempting to reconnect...");
      this.isConnected = false;
      setTimeout(() => this.connect(), 2000); // Reconnect after 2 seconds
    });
  }

  /**
   * Sends a message to the TCP server.
   * @param {string} message - Message to send.
   * @returns {Promise<string>} - Resolves with the server response.
   */
  sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        console.log("🔄 TCP client not connected. Queuing request...");
        this.pendingRequests.push({ message, resolve });
        return reject(new Error("TCP connection not established"));
      }

      this.currentResolver = resolve;
      this.client.write(message);
    });
  }

  /**
   * Returns the singleton instance of TCPClient.
   * @returns {TCPClient} - The single instance of TCPClient.
   */
  static getInstance() {
    if (!TCPClient.instance) {
      TCPClient.instance = new TCPClient("localhost", 5000);
    }
    return TCPClient.instance;
  }
}

// Initialize the TCP client singleton
const tcpClient = TCPClient.getInstance();

// Hono API Route
app.post("/api/tcp", async (c) => {
  const body = await c.req.text();
  try {
    const response = await tcpClient.sendMessage(body);
    return c.json({ message: "Response from TCP server", data: response });
  } catch (error) {
    return c.json(
      { error: "TCP connection failed", details: error.message },
      500,
    );
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
serve({ fetch: app.fetch, port: PORT });
console.log(`🚀 Hono server running at http://localhost:${PORT}`);
