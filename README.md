# MERN Flash Sale Ecommerce

Production-style flash sale app for the scenario where 10,000 users compete for 100 products.

## Stack

- React + Vite, Tailwind CSS, Framer Motion, Socket.IO Client
- Node.js, Express, MongoDB/Mongoose, Redis, Socket.IO
- BullMQ payment queue with a 10 second dummy payment gateway
- JWT auth, Helmet, compression, Morgan, rate limiting

## Concurrency Model

The purchase endpoint does not decrement MongoDB directly. It runs a Redis Lua reservation script that atomically:

1. Checks whether the user already has a live reservation.
2. Checks remaining Redis stock.
3. Uses Redis `DECR` to reserve one unit.
4. Stores a per-user reservation key with TTL.
5. Adds the user to the live queue.

Only after that atomic reservation succeeds does the request enter BullMQ. Payment success creates the MongoDB order and marks `purchasedProduct=true`. Payment failure releases the reservation and restores stock with Redis `INCR`.

## Setup

```bash
npm run install:all
```

Start Redis locally:

```bash
docker compose up redis
```

Run the full app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Environment

The root `.env` is used by the backend. A sanitized template is in `.env.example`.

```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/flashsale?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-with-a-long-random-production-secret
PORT=5000
CLIENT_URL=http://localhost:5173
PAYMENT_SUCCESS_RATE=0.82
SALE_INITIAL_STOCK=100
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=replace-with-your-razorpay-secret
```

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/product`
- `POST /api/order/buy`
- `POST /api/order/payment/verify`
- `POST /api/order/payment/fail`
- `GET /api/order/my-orders`
- `GET /api/admin/stats`

## Socket Events

- `stockUpdated`
- `saleStarted`
- `saleEnded`
- `queueUpdated`
- `paymentProcessing`
- `paymentSuccess`
- `paymentFailed`
- `livePurchase`

## Docker

```bash
docker compose up --build
```

The compose file starts Redis, backend, and frontend. MongoDB Atlas is read from `.env`.
