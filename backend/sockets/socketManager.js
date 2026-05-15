let ioInstance;

function now() {
  return Date.now();
}

export function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.emit("connected", { socketId: socket.id });
  });
}

export function emitEvent(event, payload) {
  if (ioInstance) ioInstance.emit(event, payload);
}

export function emitToUser(userId, event, payload) {
  if (ioInstance) ioInstance.to(`user:${userId}`).emit(event, payload);
}

export function emitActivityUpdate({ type = "info", message, productId, meta }) {
  emitEvent("activityUpdate", {
    id: `${now()}-${Math.random().toString(16).slice(2)}`,
    type,
    message,
    productId,
    meta,
    timestamp: now()
  });
}

export function emitStockUpdate({ productId, stock, sold, queueLength }) {
  emitEvent("stockUpdated", {
    productId,
    stock,
    sold,
    remainingStock: stock,
    soldCount: sold,
    queueLength,
    timestamp: now()
  });
}

export function emitQueueUpdate({ productId, queueLength, userName }) {
  emitEvent("queueUpdated", {
    productId,
    queueLength,
    timestamp: now()
  });

  emitActivityUpdate({
    type: "info",
    productId,
    message: userName
      ? `${userName} entered checkout queue`
      : `Checkout queue updated to ${queueLength}`
  });
}

export function registerAuthenticatedSocket(io, jwt, env) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next();
      const decoded = jwt.verify(token, env.jwtSecret);
      socket.userId = decoded.id;
      next();
    } catch {
      next();
    }
  });

  io.on("connection", (socket) => {
    if (socket.userId) socket.join(`user:${socket.userId}`);
  });
}
