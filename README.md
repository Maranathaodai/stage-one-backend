# String Analyzer Service

A RESTful API for analyzing and storing string properties using Node.js, Express, and MongoDB.

## Features

- Analyze strings and compute various properties (length, palindrome check, character frequency, etc.)
- Store analyzed strings in MongoDB
- Filter strings by multiple criteria
- Natural language query support
- RESTful API design with proper HTTP status codes

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (choose ONE of these simple local dev modes below)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd stage-one-backend
```

1. **Install dependencies**

```bash
npm install
```

1. **Set up environment variables**

- Copy `.env.example` to `.env`

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

- Pick ONE local dev mode below and set `.env` accordingly.

### Local Dev Modes

You have three easy ways to run this project locally. Start with Option A for zero-setup.

#### Option A) In-memory MongoDB (zero install, fastest)

- Set in `.env`:

```env
MONGODB_USE_MEMORY=true
PORT=5051
```

- Data resets on each restart (perfect for quick development/testing).

#### Option B) Local MongoDB (persistent)

- Install MongoDB Community Server (Windows):

```powershell
winget install -e --id MongoDB.Server
net start MongoDB
# If that fails, try: net start "MongoDB Server"
```

- Set in `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/string_analyzer
MONGODB_USE_MEMORY=false
PORT=5051
```

#### Option C) MongoDB Atlas (cloud)

- Get your SRV connection string from Atlas → Connect → "Connect your application".
- Set in `.env` (ensure your password is URL-encoded):

```env
MONGODB_URI=mongodb+srv://<user>:<password-encoded>@cluster.mongodb.net/string_analyzer?retryWrites=true&w=majority
MONGODB_USE_MEMORY=false
PORT=5051
```

- Make sure your IP is allowed in Atlas → Network Access. If corporate antivirus intercepts TLS, you may need to disable SSL inspection or temporarily set `MONGODB_TLS_INSECURE=true` (dev only).

1. **Run database migrations (create indexes)**

```bash
npm run migrate
```

1. **Start the server**

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

1. **Open docs and test**

- Swagger UI: <http://127.0.0.1:5051/docs>
- Health: <http://127.0.0.1:5051/health>

## Dependencies

- **express**: Web framework for Node.js
- **mongodb**: MongoDB driver for Node.js
- **dotenv**: Environment variable management
- **nodemon** (dev): Auto-restart server on file changes

## Environment Variables

```env
# Choose ONE path
# A) In-memory (zero install)
MONGODB_USE_MEMORY=true

# B) Local MongoDB
# MONGODB_URI=mongodb://127.0.0.1:27017/string_analyzer
# MONGODB_USE_MEMORY=false

# C) Atlas
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/string_analyzer
# MONGODB_USE_MEMORY=false

HOST=127.0.0.1
PORT=5051
```

### Using MongoDB Atlas (Cloud)

If you don't have MongoDB installed locally, you can use MongoDB Atlas for free:

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
1. Create a free cluster
1. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/string_analyzer`)
1. Add it to your `.env` file

## API Endpoints

### 1. Create/Analyze String

**POST** `/strings`

```json
{
  "value": "hello world"
}
```

### 2. Get Specific String

**GET** `/strings/{string_value}`

### 3. Get All Strings (with optional filters)

**GET** `/strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a`

### 4. Natural Language Filter

**GET** `/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings`

### 5. Delete String

**DELETE** `/strings/{string_value}`

## Testing the API

You can test the endpoints using:

- **Postman** or **Insomnia** (GUI tools)
- **curl** (command line)
- **VS Code REST Client** extension

Example curl commands (Port 5051):

```bash
# Health check
curl http://127.0.0.1:5051/health

# Create a string
curl -X POST http://127.0.0.1:5051/strings \
  -H "Content-Type: application/json" \
  -d '{"value":"racecar"}'

# Get all strings
curl http://127.0.0.1:5051/strings

# Get specific string
curl http://127.0.0.1:5051/strings/racecar

# Filter strings
curl "http://127.0.0.1:5051/strings?is_palindrome=true"

# Natural language query
curl "http://127.0.0.1:5051/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings"

# Delete a string
curl -X DELETE http://127.0.0.1:5051/strings/racecar
```

## Project Structure

```text
stage-one-backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   └── stringController.js
│   ├── services/         # Business logic
│   │   └── stringAnalyzer.js
│   ├── models/           # Database connection and schemas
│   │   ├── db.js
│   │   └── migrate.js
│   ├── routes/           # API routes
│   │   └── stringRoutes.js
│   └── index.js          # Main application file
├── .env.example          # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## Deployment

This API can be deployed to:

- Railway (recommended)
- Heroku
- AWS (EC2, ECS, Lambda)
- Any Node.js hosting platform

Make sure to:

1. Set environment variables on your hosting platform
1. Use MongoDB Atlas for cloud database
1. Ensure your MongoDB allows connections from your hosting IP

## License

ISC
