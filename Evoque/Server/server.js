const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors")
require("dotenv/config")

// Production-ready CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            // Development URLs
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            // Production URLs
            'https://evoque-clothing.vercel.app',
            'https://evoque-clothing-admin.vercel.app',
            // Server URL
            'https://evoque-clothing-server.vercel.app'
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`Origin ${origin} not allowed by CORS`);
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    exposedHeaders: ['Content-Length', 'Content-Type']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('----------------------\n');

    // Add CORS headers explicitly
    res.header('Access-Control-Allow-Origin', req.get('origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
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

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Database Connected Successfully!");
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log('CORS enabled for origins:', corsOptions.origin);
    });
})
.catch((err) => {
    console.error("Database Connection Failed!");
    console.error("Error details:", err);
    process.exit(1);
});
