# 📦 Distributed Logistics Management System (DLMS)

A microservices-based logistics management system with event-driven architecture.

## 🏗️ Architecture

- **Microservices:** Auth, Shipment, Warehouse, Tracking, API Gateway
- **Communication:** REST (synchronous) + RabbitMQ (asynchronous pub/sub)
- **Security:** JWT-based authentication via API Gateway
- **Containerization:** Docker & Docker Compose
- **Database:** PostgreSQL (one database per service)

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Node.js LTS (for local development, not required for infrastructure)

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd ds_new

# Copy environment variables
cp .env.example .env
# Edit .env if needed (defaults work for local development)
```

### Step 2: Start Infrastructure

```bash
# Start PostgreSQL and RabbitMQ
docker-compose up -d

# Verify services are running
docker-compose ps
```

### Step 3: Verify Infrastructure

**PostgreSQL:**
```bash
# Check PostgreSQL is accessible
docker exec -it dlms-postgres psql -U postgres -c "\l"

# You should see: auth_db, shipment_db, warehouse_db, tracking_db
```

**RabbitMQ:**
- Open browser: http://localhost:15672
- Login: `admin` / `admin` (default from .env.example)
- You should see the RabbitMQ management interface

### Step 4: Stop Infrastructure

```bash
# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 📁 Project Structure

```
ds_new/
├── services/
│   ├── auth-service/          # User authentication & JWT
│   ├── shipment-service/      # Shipment CRUD & events
│   ├── warehouse-service/     # Inventory & assignment
│   ├── tracking-service/      # Status tracking & notifications
│   └── api-gateway/           # Single entry point
├── scripts/
│   └── init-databases.sql     # Database initialization
├── docker-compose.yml         # Infrastructure services
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── IMPLEMENTATION_PLAN.md    # Detailed implementation plan
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Key variables:
- `POSTGRES_USER` / `POSTGRES_PASSWORD` - Database credentials
- `RABBITMQ_USER` / `RABBITMQ_PASSWORD` - RabbitMQ credentials
- Database names for each service
- Service ports (will be used in later milestones)

### Default Credentials (Development Only)

- **PostgreSQL:** `postgres` / `postgres`
- **RabbitMQ:** `admin` / `admin`

⚠️ **Change these in production!**

## 🗄️ Databases

The system uses separate databases for each service:

- `auth_db` - User authentication data
- `shipment_db` - Shipment records
- `warehouse_db` - Inventory and assignments
- `tracking_db` - Tracking history

Databases are automatically created on first startup via `scripts/init-databases.sql`.

## 📡 RabbitMQ

- **AMQP Port:** 5672
- **Management UI:** http://localhost:15672
- **Default Exchange:** Direct exchange (configured per service)

## 🧪 Testing Infrastructure

### Test PostgreSQL Connection

```bash
# Connect to PostgreSQL
docker exec -it dlms-postgres psql -U postgres

# List databases
\l

# Connect to specific database
\c auth_db

# Exit
\q
```

### Test RabbitMQ

1. Open http://localhost:15672
2. Login with credentials
3. Check "Overview" tab for broker status
4. Check "Queues" tab (will be empty until services start)

## 📋 Development Milestones

See `IMPLEMENTATION_PLAN.md` for detailed milestone breakdown.

**Current Status:** Milestone 1 - Infrastructure Setup ✅

## 🐛 Troubleshooting

### Port Already in Use

If ports 5432 or 5672 are already in use:

```bash
# Check what's using the port (Windows PowerShell)
netstat -ano | findstr :5432
netstat -ano | findstr :5672

# Edit docker-compose.yml to use different ports
```

### Database Not Created

If databases don't appear:

```bash
# Check PostgreSQL logs
docker logs dlms-postgres

# Manually create databases
docker exec -it dlms-postgres psql -U postgres -c "CREATE DATABASE auth_db;"
```

### RabbitMQ Won't Start

```bash
# Check RabbitMQ logs
docker logs dlms-rabbitmq

# Remove volume and restart
docker-compose down -v
docker-compose up -d
```

## 📚 Next Steps

1. ✅ **Milestone 1:** Infrastructure Setup (Current)
2. ⬜ **Milestone 2:** Auth Service
3. ⬜ **Milestone 3:** API Gateway
4. ⬜ **Milestone 4:** Shipment Service
5. ⬜ **Milestone 5:** Event Infrastructure

See `IMPLEMENTATION_PLAN.md` for complete roadmap.

## 📝 License

[Add your license here]

## 👥 Contributors

[Add contributors here]
