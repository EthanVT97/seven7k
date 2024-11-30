import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { messageValidation } from './middleware/validation';
import { createWebhookRouter } from './routes/webhooks';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'SEVEN7K API Server',
        status: 'running',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                profile: 'GET /api/auth/profile'
            },
            messages: {
                list: 'GET /api/messages',
                send: 'POST /api/messages',
                status: 'PATCH /api/messages/:messageId/status'
            },
            webhooks: {
                whatsapp: 'POST /api/webhooks/whatsapp',
                facebook: 'POST /api/webhooks/facebook',
                telegram: 'POST /api/webhooks/telegram',
                line: 'POST /api/webhooks/line',
                viber: 'POST /api/webhooks/viber'
            }
        }
    });
});

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Import routes
import messageRoutes from './routes/messages';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

// Apply routes
app.use('/api/messages', messageValidation, messageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webhooks', createWebhookRouter(io));

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB with options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seven7k', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as mongoose.ConnectOptions)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});