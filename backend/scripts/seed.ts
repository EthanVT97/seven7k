import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
async function main() {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    // Test data
    const users = [
        {
            email: 'user1@example.com',
            password: 'password123',
            name: 'User One',
            role: 'user',
            isActive: true,
        },
        {
            email: 'user2@example.com',
            password: 'password123',
            name: 'User Two',
            role: 'user',
            isActive: true,
        },
        {
            email: 'admin@example.com',
            password: 'admin123',
            name: 'Admin User',
            role: 'admin',
            isActive: true,
        }
    ];

    const conversations = [
        {
            participants: ['user1@example.com', 'user2@example.com'],
            title: 'General Chat',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    const messages = [
        {
            content: 'Hello, how are you?',
            sender: 'user1@example.com',
            recipient: 'user2@example.com',
            role: 'user',
            timestamp: new Date(),
            status: 'delivered',
            platform: 'web'
        },
        {
            content: 'I\'m doing great, thanks! How about you?',
            sender: 'user2@example.com',
            recipient: 'user1@example.com',
            role: 'user',
            timestamp: new Date(Date.now() + 1000 * 60), // 1 minute later
            status: 'delivered',
            platform: 'web'
        },
        {
            content: 'I\'m good too. Let\'s test some markdown:\n\n```python\nprint("Hello World!")\n```',
            sender: 'user1@example.com',
            recipient: 'user2@example.com',
            role: 'user',
            timestamp: new Date(Date.now() + 1000 * 120), // 2 minutes later
            status: 'delivered',
            platform: 'web'
        }
    ];

    try {
        // Clear existing data
        await mongoose.connection.dropDatabase();
        console.log('Dropped existing database');

        // Get database instance
        const db = mongoose.connection.db;
        if (!db) throw new Error('Database not connected');

        // Create collections with schema validation
        await db.createCollection('users', {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["email", "password", "name"],
                    properties: {
                        email: {
                            bsonType: "string",
                            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                        },
                        password: { bsonType: "string" },
                        name: { bsonType: "string" },
                        role: { enum: ["admin", "user"] },
                        isActive: { bsonType: "bool" }
                    }
                }
            }
        });

        await db.createCollection('conversations', {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["participants"],
                    properties: {
                        participants: {
                            bsonType: "array",
                            items: { bsonType: "string" }
                        },
                        title: { bsonType: "string" },
                        createdAt: { bsonType: "date" },
                        updatedAt: { bsonType: "date" }
                    }
                }
            }
        });

        await db.createCollection('messages', {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["content", "sender", "role"],
                    properties: {
                        content: { bsonType: "string" },
                        sender: { bsonType: "string" },
                        recipient: { bsonType: "string" },
                        role: { enum: ["user", "assistant", "system"] },
                        timestamp: { bsonType: "date" },
                        status: { enum: ["sent", "delivered", "read", "unread"] },
                        platform: { bsonType: "string" }
                    }
                }
            }
        });

        // Hash passwords for users
        const hashedUsers = await Promise.all(users.map(async user => ({
            ...user,
            password: await bcrypt.hash(user.password, 10)
        })));

        // Insert data
        await db.collection('users').insertMany(hashedUsers);
        await db.collection('conversations').insertMany(conversations);
        await db.collection('messages').insertMany(messages);

        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main().catch(console.error); 