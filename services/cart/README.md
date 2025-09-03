# Cart Service

Node.js Express microservice for shopping cart management in LocalMart.

## 🎯 Educational Purpose

This service demonstrates **Node.js microservice development** and **service-to-service communication**:

- **Language Diversity**: Node.js vs Go (catalog) vs Python (users)
- **Service Communication**: Cart → Catalog API calls for product data
- **Redis Caching**: Fast cart storage with session-like behavior
- **JWT Authentication**: Shared token validation across services
- **Real-world Cart Logic**: Add/remove items, stock validation, totals

## 🚀 Features

- **Add Items**: Add products to user cart with quantity
- **Get Cart**: Retrieve cart with enriched product details
- **Update Quantities**: Modify item quantities with stock validation
- **Remove Items**: Remove individual items or clear entire cart
- **Stock Validation**: Real-time stock checking via catalog service
- **User Isolation**: JWT-based user-specific carts
- **Redis Storage**: Fast, temporary cart storage

## 🏗️ Architecture

### Tech Stack
- **Node.js 18**: JavaScript runtime
- **Express**: Web framework
- **Redis**: Cart storage and caching
- **JWT**: Authentication (shared with users service)
- **Axios**: HTTP client for service communication

### Service Dependencies
- **Users Service**: JWT token validation
- **Catalog Service**: Product data and stock validation
- **Redis**: Cart data storage

### Project Structure
```
services/cart/
├── src/
│   ├── config/           # Configuration management
│   ├── middleware/       # Express middleware (auth, etc.)
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── utils/           # Utilities (Redis, logger)
│   └── server.js        # Main application file
├── package.json         # Dependencies and scripts
└── Dockerfile          # Container configuration
```

## 📝 API Endpoints

### Cart Operations
```http
GET    /api/v1/cart              # Get user's cart
POST   /api/v1/cart/items        # Add item to cart
PUT    /api/v1/cart/items/:id    # Update item quantity
DELETE /api/v1/cart/items/:id    # Remove item from cart
DELETE /api/v1/cart              # Clear entire cart
```

### System
```http
GET    /health                   # Health check
```

## 💡 Key Learning Concepts

### Service-to-Service Communication
```javascript
// Cart service calls catalog service for product data
const product = await catalogService.getProduct(productId)

// Validates stock before adding to cart
const validation = await catalogService.validateProduct(productId, quantity)
```

### Redis Cart Storage
```javascript
// User-specific cart keys
const cartKey = `cart:user:${userId}`

// Cart data structure
{
  items: [
    {
      productId: 1,
      quantity: 2,
      addedAt: "2025-01-03T01:00:00Z"
    }
  ],
  total: 39.98,
  itemCount: 2
}
```

### JWT Authentication
```javascript
// Shared JWT secret with users service
const decoded = jwt.verify(token, config.jwt.secret)

// Extract user info for cart operations
req.user = {
  id: parseInt(decoded.sub),
  email: decoded.email,
  isAdmin: decoded.is_admin
}
```

## 🛠️ Development

### Local Development
```bash
cd services/cart

# Install dependencies
npm install

# Start with auto-reload
npm run dev

# Start production mode
npm start
```

### Docker Development
```bash
# Start all services including cart
docker-compose up -d

# Check cart service health
curl http://localhost:8082/health

# View cart service logs
docker-compose logs cart
```

## 🧪 Testing the Cart

### Prerequisites
- Users service running (for JWT tokens)
- Catalog service running (for products)
- Redis running (for cart storage)

### Example Cart Flow
```bash
# 1. Login to get JWT token
TOKEN=$(curl -s -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.access_token')

# 2. Add item to cart
curl -X POST http://localhost:8082/api/v1/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'

# 3. Get cart contents
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8082/api/v1/cart

# 4. Update item quantity
curl -X PUT http://localhost:8082/api/v1/cart/items/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'

# 5. Remove item
curl -X DELETE http://localhost:8082/api/v1/cart/items/1 \
  -H "Authorization: Bearer $TOKEN"

# 6. Clear cart
curl -X DELETE http://localhost:8082/api/v1/cart \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Configuration

Environment variables:
```bash
CART_PORT=8082
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET_KEY=your-secret-key
CATALOG_SERVICE_URL=http://catalog:8080
USERS_SERVICE_URL=http://users:8081
NODE_ENV=production
LOG_LEVEL=info
```

## 🔍 Microservice Patterns Demonstrated

### Service Discovery
- **Environment-based**: Services communicate via container names
- **Health Checks**: Monitor dependency health

### Data Consistency
- **Stock Validation**: Real-time checks before cart operations
- **Product Enrichment**: Always fetch latest product data

### Caching Strategy
- **Redis TTL**: Cart expires after 7 days
- **Fast Retrieval**: Cart operations without database load

### Error Handling
- **Circuit Breaking**: Graceful handling of catalog service failures
- **Input Validation**: Comprehensive request validation
- **Structured Logging**: JSON logs for observability

## 🌟 Next Steps

This cart service foundation enables:
- **Checkout Process**: Integration with orders service
- **Inventory Management**: Stock reservation during checkout
- **Cart Persistence**: Database backup for important carts
- **Real-time Updates**: WebSocket notifications for cart changes
- **Analytics**: Cart abandonment and conversion tracking

Perfect for demonstrating modern Node.js microservice patterns! 🛒