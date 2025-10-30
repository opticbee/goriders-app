// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// Assuming you have a db.js file that sets up your MySQL connection
const db = require('./db'); 

const app = express();
const server = http.createServer(app);

// --- WebSocket Setup ---
// These modules need the main HTTP server to create the WS server
const { router: rideRouter, wss } = require('./routes/ride')(server);
const driverRoutes = require('./routes/driver')(wss);


// --- Global Middleware Setup ---
app.use(cors({
  origin: [
        'http://localhost:5500',
        'http://1227.0.0.1:5500',
        'http://localhost:3000',
        'https://goriders.in',
        
        // common dev origins (browsers / ionic dev server)
        'http://localhost:3000',
        'http://localhost:8100',
        'http://localhost:8080',
        'http://127.0.0.1:8000',

        // Capacitor / Ionic / WebView origins (CRITICAL for mobile)
        'capacitor://localhost',
        'ionic://localhost',
        'http://localhost',      
        'https://localhost',     
        'file://',
    ], 
  credentials: true
}));

// Body-parsing middleware with a high limit (50MB) for non-file uploads
const jsonMiddleware = express.json({ limit: '50mb' });
const urlencodedMiddleware = express.urlencoded({ limit: '50mb', extended: true });

app.use(cookieParser());

// Essential for admin to view driver documents, served as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Apply JSON parsing middleware only to routes that handle JSON bodies
app.use('/api/auth', jsonMiddleware, urlencodedMiddleware, authRoutes);
app.use('/api/user', jsonMiddleware, urlencodedMiddleware, userRoutes);

// Driver registration uses Multer's body parsing internally, so NO explicit jsonMiddleware here
app.use('/api/driver', driverRoutes); 
app.use('/api/admin', jsonMiddleware, urlencodedMiddleware, require('./routes/admin'));
app.use('/api/ride', jsonMiddleware, urlencodedMiddleware, rideRouter); 

// NOTE: Frontend Serving routes removed as requested.

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Ensure that if the error is from Multer, the client gets a useful message
    if (err.message && err.message.startsWith('File upload error:')) {
        return res.status(413).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Something went wrong on the server!' });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT} (API Only)`);
    // Check DB state if db.js exposes it
});
