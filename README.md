
---

## 🚀 Arquitectura

El proyecto usa **NestJS** con comunicación entre microservicios mediante **RabbitMQ**.

### 🔗 Flujo general

1. El cliente (Postman, Angular, etc.) realiza una petición al **Gateway**.
2. El **Gateway** usa `@ClientProxy` para enviar el mensaje al microservicio correspondiente.
3. El microservicio procesa la solicitud y devuelve la respuesta al Gateway.
4. El Gateway responde al cliente.

---

## 🧠 Servicios actuales

### 1. `api-gateway`
- Expone los endpoints HTTP (REST).
- Valida y genera JWT.
- Se comunica con los microservicios usando RabbitMQ.

**Endpoints principales:**
| Método | Ruta | Descripción |
|--------|-------|-------------|
| POST | `/auth/login` | Autenticación de usuario |
| GET | `/me` | Devuelve el usuario actual autenticado (token JWT requerido) |

### 2. `microservice-users`
- Maneja usuarios, registro, login y validación.
- Expone patrones de mensaje como:
  - `{ cmd: 'auth.validate' }`

**Ejemplo de mensaje recibido:**
```json
{
  "cmd": "auth.validate",
  "data": { "email": "admin@cobradores.com", "password": "123456" }
}
```
Respuesta esperada:
```json

{
  "ok": true,
  "user": {
    "id": 1,
    "email": "admin@cobradores.com",
    "name": "Admin"
  }
}
```

⚙️ Instalación
1. Clonar el repositorio
git clone https://github.com/tuusuario/APP_COBRADORES_API.git
cd APP_COBRADORES_API

2. Instalar dependencias
pnpm install


Si no tenés pnpm:
npm install -g pnpm

🐇 Configuración de RabbitMQ

Iniciar RabbitMQ localmente con Docker:

docker run -d --hostname my-rabbit --name rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management


Acceder al panel de control:
👉 http://localhost:15672

Usuario: guest
Contraseña: guest

🔧 Variables de entorno

Cada microservicio y el gateway tienen su propio .env (no se sube al repositorio).

Ejemplo api-gateway/.env:

PORT=3000
JWT_SECRET=supersecreto
RABBITMQ_URL=amqp://guest:guest@localhost:5672


Ejemplo microservice-users/.env:

RABBITMQ_URL=amqp://guest:guest@localhost:5672
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=123456
DB_NAME=cobradores

🧩 Ejecución

1. Iniciar microservicios

# En una terminal
cd microservice-users
pnpm run start:dev

# En otra terminal
cd microservice-payments
pnpm run start:dev

2. Iniciar Gateway
cd api-gateway
pnpm run start:dev

🧪 Pruebas con Postman
🔹 Login

POST → http://localhost:3000/auth/login

{
  "email": "admin@cobradores.com",
  "password": "123456"
}

🔹 Perfil (requiere token)

GET → http://localhost:3000/me
Header:

Authorization: Bearer <token>


Respuesta:

{
  "ok": true,
  "user": {
    "id": 1,
    "email": "admin@cobradores.com",
    "name": "Admin"
  }
}

🧰 Stack Tecnológico

Node.js + NestJS

RabbitMQ (mensajería entre microservicios)

PostgreSQL o cualquier base SQL (a definir)

JWT para autenticación

pnpm para manejo de dependencias

TypeScript

📦 Estructura básica de carpetas
APP_COBRADORES_API/
│
├── api-gateway/
│   ├── src/
│   │   ├── auth/
│   │   ├── guards/
│   │   ├── controllers/
│   │   ├── main.ts
│   │   └── app.module.ts
│   └── .env
│
├── microservice-users/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── main.ts
│   │   └── app.module.ts
│   └── .env
│
└── microservice-payments/
    ├── src/
    ├── ...
    └── .env

