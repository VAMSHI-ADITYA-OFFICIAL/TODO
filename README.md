# TODO Application

A full-stack todo application built with Next.js, Express.js, and MongoDB. Features user authentication, todo management, and a responsive design with dark/light mode support.

## 🚀 Features

### Authentication

- User registration and login
- JWT-based authentication with refresh tokens
- Secure password hashing with bcrypt
- Protected routes and middleware

### Todo Management

- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Real-time optimistic updates
- Responsive design for mobile and desktop

### UI/UX

- Modern, clean interface with Tailwind CSS
- Dark/Light mode toggle
- Mobile-first responsive design
- Shadcn/ui components
- Toast notifications
- Loading skeletons

### Technical Features

- TypeScript for type safety
- React Query for state management
- Optimistic updates for better UX
- Server-side rendering with Next.js
- RESTful API with Express.js
- MongoDB with Mongoose ODM

## 🏗️ System Architecture

For a detailed system design and architecture overview, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📁 Project Structure

```
TODO/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router structure
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── login/          # Login page and actions
│   │   ├── signup/         # Signup page and actions
│   │   ├── todos/          # Todo management pages
│   │   └── services/       # API services and utilities
│   ├── components/ui/      # Shadcn/ui components
│   ├── lib/               # Utility functions
│   └── public/            # Static assets
├── backend/                # Express.js backend API
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middlewares/   # Custom middleware
│   │   └── utils/         # Utility functions
│   └── dist/             # Compiled JavaScript
└── README.md
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui + Radix UI
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios

### Backend

- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5
- **Database**: MongoDB with Mongoose 8.18.1
- **Authentication**: JWT + bcrypt
- **CORS**: Enabled for cross-origin requests
- **Environment**: dotenv for configuration

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TODO
```

### 2. Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Environment Setup

Create environment files for both frontend and backend:

#### Backend Environment (.env in backend folder)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
NODE_ENV=development
```

#### Frontend Environment (.env.local in frontend folder)

```env
NEXT_PUBLIC_BASE_URL=http://localhost:5000
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (if installed locally)
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env with your Atlas connection string
```

### 5. Run the Application

#### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

#### Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📱 Usage

### Authentication

1. **Sign Up**: Create a new account with email and password
2. **Login**: Sign in with your credentials
3. **Logout**: Click the logout button in the header

### Todo Management

1. **Create Todo**: Add new todos with title and description
2. **Edit Todo**: Click the edit button to modify todo details
3. **Toggle Status**: Mark todos as complete/incomplete
4. **Delete Todo**: Remove todos with confirmation dialog
5. **Mobile View**: Use the popover menu on mobile devices

### Theme

- Toggle between light and dark mode using the theme button
- Theme preference is saved in localStorage

## 🔧 Development

### Available Scripts

#### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

#### Backend

```bash
npm run dev      # Start development server with nodemon
npm run build    # Compile TypeScript
npm run start    # Start production server
```

### API Endpoints

#### Authentication

- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/refresh` - Refresh access token

#### Todos

- `GET /api/todos` - Get user todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## 🎨 UI Components

### Custom Components

- **Button**: Customizable button component with variants
- **Input**: Form input with validation
- **TodoCard**: Individual todo display with actions
- **TodoList**: List of todos with pagination
- **Header**: Navigation with user details and theme toggle
- **MobileMenu**: Mobile-friendly popover menu

### Shadcn/ui Components

- Alert Dialog
- Popover
- Switch
- Checkbox

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Refresh token rotation
- Protected API routes
- CORS configuration
- Input validation and sanitization

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation with mobile menu
- Touch-friendly interactions
- Optimized for various screen sizes

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)

1. Create a new project on your preferred platform
2. Connect your GitHub repository
3. Set environment variables
4. Deploy the application

### Database

- Use MongoDB Atlas for production
- Update connection string in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check connection string in environment variables

2. **CORS Issues**

   - Verify backend CORS configuration
   - Check frontend API base URL

3. **Authentication Issues**

   - Clear localStorage and cookies
   - Check JWT secret configuration

4. **Build Errors**

   - Clear node_modules and reinstall dependencies
   - Check TypeScript configuration

5. **Testing**

- Unit and integration tests written using **Jest** and **React Testing Library**.
- API route tests use **node-mocks-http** with **MSW** for mocking requests.
- Development assisted with **Cursor AI** to speed up test generation and refactoring.

## 📞 Support

For support, email vamshiadityaofficial@gmail.com or create an issue in the repository.

---

**Happy Coding! 🎉**
