const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { corsMiddleware, ensureCorsHeaders } = require("./middleware/cors");
require("dotenv/config")
const { ping } = require("./utils/keepAlive");

// MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

// MongoDB connection with retry logic
const connectWithRetry = async () => {
    console.log('Attempting to connect to MongoDB...');
    try {
        await mongoose.connect(process.env.CONNECTION_STRING, mongooseOptions);
        console.log("Database Connected Successfully!");
        
        // Set up MongoDB connection error handlers
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
            setTimeout(connectWithRetry, 5000);
        });

        return true;
    } catch (err) {
        console.error("Database Connection Failed!");
        console.error("Error details:", err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
        return false;
    }
};

// Apply CORS middleware before routes
app.use(corsMiddleware);
app.use(ensureCorsHeaders);

// Handle preflight requests
app.options('*', corsMiddleware);

// Middleware
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Enhanced debug middleware
app.use((req, res, next) => {
    console.log('\n--- Incoming Request ---');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Origin:', req.get('origin'));
    console.log('----------------------\n');
    next();
});

// Routes
const categoryRoute = require("./routes/category");
const productRoute = require("./routes/products");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const ordersRoute = require("./routes/orders");
const couponsRoute = require("./routes/coupons");
const authMiddleware = require("./middleware/auth");

// Enhanced health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        time: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV,
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Public routes for GET operations
app.get('/api/category', async (req, res, next) => {
    try {
        const route = categoryRoute.stack.find(r => r.route?.path === '/' && r.route.methods.get);
        if (route) {
            await route.route.stack[0].handle(req, res, next);
        }
    } catch (error) {
        next(error);
    }
});

app.get('/api/products', async (req, res, next) => {
    try {
        const route = productRoute.stack.find(r => r.route?.path === '/' && r.route.methods.get);
        if (route) {
            await route.route.stack[0].handle(req, res, next);
        }
    } catch (error) {
        next(error);
    }
});

app.get('/api/products/:id', async (req, res, next) => {
    try {
        const route = productRoute.stack.find(r => r.route?.path === '/:id' && r.route.methods.get);
        if (route) {
            await route.route.stack[0].handle(req, res, next);
        }
    } catch (error) {
        next(error);
    }
});

// Protected routes (require authentication)
app.use('/api/auth', authRoute);
app.use('/api/user', authMiddleware, userRoute);
app.use('/api/category', authMiddleware, categoryRoute);
app.use('/api/products', authMiddleware, productRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/coupons', couponsRoute);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('\n--- Error Occurred ---');
    console.error('Time:', new Date().toISOString());
    console.error('Path:', req.path);
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    console.error('--------------------\n');

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Something went wrong!',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// Start server only after successful database connection
const startServer = async () => {
    const isConnected = await connectWithRetry();
    if (isConnected) {
        const port = process.env.PORT || 3000;
        const server = app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
            console.log('CORS enabled for origins:', corsMiddleware.origin);
            console.log('Environment:', process.env.NODE_ENV);
            
            // Start the keep-alive ping
            if (process.env.NODE_ENV === 'production') {
                ping();
                console.log('Keep-alive ping service started');
            }
        });

        // Handle server shutdown gracefully
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Server closed');
                mongoose.connection.close(false, () => {
                    console.log('MongoDB connection closed');
                    process.exit(0);
                });
            });
        });
    }
};

// Start the server
startServer();
