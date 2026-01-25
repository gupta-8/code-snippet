<div align="center">

# 📝 Code Snippet Manager

### A modern, full-stack code snippet management application for developers

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)

[Features](#features) • [Installation](#installation) • [Deployment](#deployment) • [Contributing](#contributing)

---

</div>

## Features

### **Authentication**
- Secure JWT-based authentication
- User registration and login
- Session persistence with refresh tokens

### **Organization**
- **Folders** - Organize snippets into custom folders with color coding
- **Tags** - Add multiple tags to snippets for easy filtering
- **Favorites** - Star important snippets for quick access
- **Search** - Fuzzy search across titles, code, and tags

### **Code Editor**
- Syntax highlighting for 50+ languages
- Multiple themes (dark/light mode)
- Customizable font size, font family, and line height
- Line numbers, word wrap, bracket matching
- Tab-based editing with multiple snippets

### **Customization**
- Dark and light themes
- Multiple accent colors (Teal, Blue, Green, Purple, Orange)
- Compact mode
- Code preview in snippet list
- Adjustable sidebar width

### **Sharing**
- Generate shareable links for snippets
- Public snippet viewing without login
- Copy code with one click
- Download snippets as files

### **Responsive Design**
- Fully responsive for desktop and mobile
- Touch-friendly mobile interface
- Three-dot menu for mobile context actions

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **CodeMirror 6** - Code editor
- **Fuse.js** - Fuzzy search
- **Lucide React** - Icons

### Backend
- **Python 3.11+** - Runtime
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database
- **PyJWT** - Authentication
- **Passlib** - Password hashing

---

## Project Structure

```
code-snippet/
├── backend/
│   ├── server.py           # FastAPI application & routes
│   ├── database.py         # SQLAlchemy models & DB config
│   ├── schemas.py          # Pydantic schemas
│   ├── requirements.txt    # Python dependencies
│   ├── railway.toml        # Railway deployment config
│   └── .env.example        # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Shadcn UI components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── ContextMenu.jsx
│   │   │   └── ...
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities & API
│   │   ├── App.js          # Main application
│   │   └── index.css       # Global styles
│   ├── public/
│   ├── package.json
│   └── railway.toml        # Railway deployment config
│
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── railway.json            # Railway config
```

---

## Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/gupta-8/code-snippet.git
   cd code-snippet
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your settings
   
   # Run the server
   uvicorn server:app --reload --port 8001
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   yarn install  # or npm install
   
   # Create .env file
   echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
   
   # Run the development server
   yarn start  # or npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## Deployment

### Deploy to Railway

Railway is the recommended deployment platform for this application.

#### Option 1: One-Click Deploy (Monorepo)

1. **Create a Railway account** at [railway.com](https://railway.com)

2. **Fork this repository** to your GitHub account

3. **Create a new project** in Railway and select "Deploy from GitHub repo"

4. **Configure services:**
   
   **Backend Service:**
   - Root Directory: `backend`
   - Start Command: `python -m uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Add environment variables:
     ```
     JWT_SECRET=your-super-secret-key-change-this
     ```
   
   **Frontend Service:**
   - Root Directory: `frontend`
   - Start Command: `npm start`
   - Add environment variables:
     ```
     REACT_APP_BACKEND_URL=https://your-backend-service.railway.app
     ```

5. **Deploy** - Railway will automatically build and deploy both services

#### Option 2: Manual Deployment

1. **Deploy Backend:**
   ```bash
   cd backend
   railway init
   railway up
   ```

2. **Deploy Frontend:**
   ```bash
   cd frontend
   railway init
   railway up
   ```

3. **Set environment variables** in Railway dashboard

### Deploy to Other Platforms

#### Vercel (Frontend Only)
```bash
cd frontend
vercel deploy
```

#### Heroku
```bash
# Backend
cd backend
heroku create your-app-backend
git push heroku main

# Frontend
cd frontend
heroku create your-app-frontend
git push heroku main
```

#### Docker
```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Configuration

### Environment Variables

#### Backend (`backend/.env`)
```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this

# Database (optional - defaults to SQLite)
# DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

#### Frontend (`frontend/.env`)
```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login & get tokens |
| POST | `/api/auth/refresh` | Refresh access token |

### Snippets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/snippets` | Get all snippets |
| POST | `/api/snippets` | Create snippet |
| GET | `/api/snippets/:id` | Get snippet by ID |
| PUT | `/api/snippets/:id` | Update snippet |
| DELETE | `/api/snippets/:id` | Delete snippet |
| POST | `/api/snippets/:id/favorite` | Toggle favorite |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/folders` | Get all folders |
| POST | `/api/folders` | Create folder |
| PUT | `/api/folders/:id` | Update folder |
| DELETE | `/api/folders/:id` | Delete folder |

### Tags
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tags` | Get all tags |

### Sharing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/share/:id` | Get shared snippet (public) |

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Security

For security concerns, please see our [Security Policy](SECURITY.md).

---

## Support

- Create an [Issue](https://github.com/gupta-8/code-snippet/issues)
- Start a [Discussion](https://github.com/gupta-8/code-snippet/discussions)