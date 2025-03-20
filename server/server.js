import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import net from "net";
import dotenv from "dotenv";

dotenv.config();
const app = new Hono();
app.use('api/*', cors());

const TCP_HOST = "localhost"; // Change if TCP server is running elsewhere
const TCP_PORT = 5000;

// Function to send and receive data from the TCP server
const sendToTCPServer = (message) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.connect(TCP_PORT, TCP_HOST, () => {
      console.log("Connected to TCP server");
      client.write(message);
    });

    client.on("data", (data) => {
      console.log("Received from TCP server:", data.toString());
      resolve(data.toString());
      client.destroy(); // Close connection after receiving data
    });

    client.on("error", (err) => {
      console.error("TCP Connection Error:", err);
      reject(err);
    });

    client.on("close", () => {
      console.log("TCP Connection Closed");
    });
  });
};

// Hono API Route
app.get("/api/tcp", async (c) => {
  try {
    const response = await sendToTCPServer("prop");
    return c.json({ message: "Response from TCP server", data: response });
  } catch (error) {
    return c.json({ error: "TCP connection failed", details: error.message }, 500);
  }
});

const PORT = process.env.PORT || 3001;
serve({ fetch: app.fetch, port: PORT });

console.log(`🚀 Hono server running at http://localhost:${PORT}`);
