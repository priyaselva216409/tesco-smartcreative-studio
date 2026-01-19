# Canva-Like Design Editor Backend

## Project Description

This is a fully functional backend for a Canva-like design editor application. It provides user authentication, project management with canvas JSON data, image upload handling, and export functionality to generate final design images from canvas JSON data.

### Features:

- User registration and login with JWT authentication
- Password hashing for security
- Middleware to protect API endpoints
- CRUD operations for user projects (storing canvas JSON data)
- Image upload endpoint supporting PNG and JPG formats
- Export endpoint that converts canvas JSON to PNG/JPEG images
- MongoDB database integration with Mongoose ORM
- CORS enabled for cross-origin requests

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)
- MongoDB instance (local or cloud, e.g., MongoDB Atlas)

## Environment Variables Configuration

Create a `.env` file in the root directory based on `.env.example` and provide values for:

- `PORT` - Port on which the server will run (default: 5000)
- `MONGODB_URI` - MongoDB connection string 
- `JWT_SECRET` - Secret key for JWT token signing and verification

### Example `.env` file:
PORT=5000
MONGODB_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
   

## Installation Steps

1. Clone the repository or download the source code.

2. Navigate to the project directory:

       cd canva-like-backend

3. Install dependencies:

       npm install

## Running the Development Server

Start the server with nodemon for live reload during development:

    npm run dev

The server will start on the port specified in `.env` or default to 5000.

## Building and Starting the Production Server

For production, run:

    npm start

Ensure environment variables are set properly for production.

## API Endpoints Summary

All endpoints are prefixed with `/api`.

### Authentication

- `POST /api/auth/register`  
  Register a new user.  
  **Body:** `{ "username": "string", "email": "string", "password": "string" }`  
  **Response:** JWT token and user data.

- `POST /api/auth/login`  
  Login existing user.  
  **Body:** `{ "email": "string", "password": "string" }`  
  **Response:** JWT token and user data.

### Projects (Protected: require Authorization header with Bearer token)

- `POST /api/projects`  
  Create a new project.  
  **Body:** `{ "title": "string", "canvasData": { ... } }`  
  **Response:** Created project object.

- `GET /api/projects`  
  Get all projects for logged-in user.  
  **Response:** Array of projects.

- `GET /api/projects/:id`  
  Get a single project by ID.  
  **Response:** Project object.

- `PUT /api/projects/:id`  
  Update project title and/or canvasData.  
  **Body:** `{ "title": "string", "canvasData": { ... } }`  
  **Response:** Updated project object.

- `DELETE /api/projects/:id`  
  Delete project by ID.  
  **Response:** Success message.

### File Uploads (Protected)

- `POST /api/uploads/upload`  
  Upload a PNG or JPG image.  
  **Form-data:** Key `file` with image file to upload.  
  **Response:** `{ "fileUrl": "http://<host>/uploads/filename" }`

### Export (Protected)

- `POST /api/export`  
  Export canvas JSON to PNG or JPG image.  
  **Body:** `{ "canvasJSON": { ... }, "format": "png" | "jpeg" }`  
  **Response:** Image file stream with appropriate content-type.

## File Upload Instructions

- Use multipart/form-data with key `file` to upload images.
- Only PNG and JPG images are accepted.
- Max file size is 5 MB.
- Uploaded files are saved in `/uploads` and served statically.

## Export Endpoint Usage

- Send canvas JSON data describing the design.
- Specify image format: `"png"` or `"jpeg"` (default to PNG).
- The endpoint returns a direct image file download.

## Environment Variables List

| Variable     | Description                          | Required |
| ------------ | ---------------------------------- | -------- |
| PORT         | Server listen port                  | No       |
| MONGODB_URI  | MongoDB connection string           | Yes      |
| JWT_SECRET   | Secret key for JWT authentication  | Yes      |

## MongoDB Setup Notes

- Use a MongoDB Atlas cluster or local MongoDB server.
- Make sure the connection string in `MONGODB_URI` has the correct username, password, and database name.
- The backend creates necessary collections automatically.

## Project Structure Explanation
canva-like-backend/
├── controllers/        # Auth, project, upload, export logic
├── models/             # Mongoose schemas
├── routes/             # Express routes
├── middleware/         # JWT authentication middleware
├── uploads/            # Uploaded image files
├── utils/              # Helper utilities
├── server.js           # Application entry point
├── package.json        # Project metadata and dependencies
├── .env.example        # Environment variable template (no secrets)
├── .gitignore          # Ignored files and folders
└── README.md           # Project documentation

