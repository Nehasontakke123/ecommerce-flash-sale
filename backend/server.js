import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { app } from "./app.js";
import { corsOptions } from "./config/cors.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { ensureSaleProduct, getProductSnapshot } from "./services/productService.js";
import { initSocket, registerAuthenticatedSocket } from "./sockets/socketManager.js";
import "./queues/paymentWorker.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

registerAuthenticatedSocket(io, jwt, env);
initSocket(io);

async function bootstrap() {
  await connectDB();
  const product = await ensureSaleProduct();
  const snapshot = await getProductSnapshot(product._id);

  server.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
    io.emit("saleStarted", {
      productId: product._id,
      remainingStock: snapshot.remainingStock
    });
  });
}

bootstrap().catch((error) => {
  console.error("Server bootstrap failed", error);
  process.exit(1);
});
