# User Management System

A comprehensive user management system for EVM address-based authentication with fan token integration and social media profiles using native SQLite.

## Overview

This system provides:
- **User Registration/Login** with EVM addresses
- **Role-based Access Control** (Admin/User)
- **Social Media Integration** (Twitter, YouTube, Telegram, TikTok)
- **Fan Token Management** for Chiliz blockchain integration
- **Admin Address Management** for club administrators
- **JWT-based Authentication** with proper middleware
- **Native SQLite Database** with better-sqlite3 for optimal performance

## Database Schema

### Users Table
- `id`: Unique identifier (generated)
- `evmAddress`: Ethereum address (unique)
- `role`: USER or ADMIN
- `twitterId`, `youtubeId`, `telegramId`, `tiktokId`: Social media identifiers
- `createdAt`, `updatedAt`: Timestamps

### TikTok Profiles Table
- `id`: Unique identifier (generated)
- `username`: TikTok username (unique)
- `displayName`, `bio`: Profile information
- `followers`, `following`: Statistics
- `verified`: Verification status

### Fan Tokens Table
- `id`: Unique identifier (generated)
- `evmAddress`: Token contract address (unique)
- `name`, `symbol`: Token details
- `clubName`: Associated club name

### User-Fan Token Relationships
- Links users to their fan tokens with balance information
- Supports multiple tokens per user

### Admin Addresses Table
- Manages which EVM addresses have admin privileges
- Supports activation/deactivation of admin status

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login with EVM address

### User Profile Management
- `GET /api/users/profile` - Get current user's profile
- `PUT /api/users/profile` - Update current user's profile
- `PUT /api/users/profile/:userId` - Update specific user's profile (admin/owner only)

### Fan Token Management
- `POST /api/users/fan-tokens` - Add fan token to current user
- `POST /api/users/:userId/fan-tokens` - Add fan token to specific user (admin/owner only)
- `DELETE /api/users/fan-tokens/:tokenEvmAddress` - Remove fan token from current user
- `DELETE /api/users/:userId/fan-tokens/:tokenEvmAddress` - Remove fan token from specific user (admin/owner only)

### Admin Functions
- `GET /api/users/all` - Get all users (admin only)
- `POST /api/users/admin-addresses` - Add admin address (admin only)
- `DELETE /api/users/admin-addresses/:evmAddress` - Remove admin address (admin only)
- `DELETE /api/users/:userId` - Delete user (admin only)

## Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "user-id",
  "evmAddress": "0x...",
  "role": "USER|ADMIN"
}
```

### Middleware Types
- `requireAuth`: Requires valid JWT token
- `requireAdmin`: Requires admin role
- `requireOwnershipOrAdmin`: Requires user to own resource or be admin
- `optionalAuth`: Optional authentication

### Usage Examples

#### Register User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "evmAddress": "0x1234567890123456789012345678901234567890",
    "twitterId": "username123",
    "youtubeId": "channelId123"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "evmAddress": "0x1234567890123456789012345678901234567890"
  }'
```

#### Update Profile (with JWT)
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "twitterId": "newUsername",
    "tiktokId": "tiktok-profile-id"
  }'
```

#### Add Fan Token
```bash
curl -X POST http://localhost:3000/api/users/fan-tokens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tokenEvmAddress": "0xabcdef1234567890123456789012345678901234",
    "balance": "1000000000000000000"
  }'
```

## Security Features

### Input Validation
- EVM address format validation (0x + 40 hex characters)
- Zod schema validation for all inputs
- SQL injection protection via prepared statements

### Access Control
- Role-based permissions (USER/ADMIN)
- Resource ownership verification
- JWT token expiration (7 days default)

### Data Protection
- Sensitive data exclusion from responses
- Secure password-less authentication via EVM addresses
- Database connection pooling and prepared statements

## Database Implementation

### Native SQLite with better-sqlite3
- **High Performance**: Synchronous API for better performance
- **Memory Efficient**: Lightweight SQLite implementation
- **Type Safety**: Full TypeScript support with proper interfaces
- **Prepared Statements**: Protection against SQL injection
- **Foreign Key Support**: Proper relational integrity
- **Indexes**: Optimized queries with proper indexing

### Key Features
- **Automatic Table Creation**: Tables are created automatically on startup
- **ID Generation**: Custom ID generation for unique identifiers
- **Timestamp Management**: Automatic timestamp updates
- **Foreign Key Constraints**: Proper relationships between tables
- **Indexes**: Performance-optimized queries

## Fan Token Integration

The system is designed to work with Chiliz fan tokens:
- **Token Discovery**: Automatically creates token records when users add them
- **Balance Tracking**: Stores token balances as strings to handle large numbers
- **Multi-token Support**: Users can hold multiple different fan tokens
- **Club Association**: Supports linking tokens to specific clubs

## TikTok Profile Integration

- **Foreign Key Relationship**: Users can link to TikTok profiles
- **Profile Management**: CRUD operations for TikTok profiles
- **Search Functionality**: Search profiles by username or display name
- **User Association**: Track which users are associated with profiles

## Admin Management

### Admin Address System
- **Centralized Control**: Maintain list of admin EVM addresses
- **Dynamic Updates**: Add/remove admin privileges without code changes
- **Automatic Role Assignment**: Users with admin addresses get ADMIN role
- **Status Management**: Activate/deactivate admin addresses

### Admin Functions
- View all users with pagination
- Delete users
- Manage admin addresses
- Access any user's profile for management

## Environment Configuration

Required environment variables:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
```

## Database Setup

1. Install dependencies:
```bash
npm install better-sqlite3 jsonwebtoken
npm install -D @types/better-sqlite3 @types/jsonwebtoken
```

2. Start the server (database is created automatically):
```bash
npm run dev
```

The database tables and indexes are created automatically when the server starts for the first time.

## Error Handling

The system provides comprehensive error handling:
- **Validation Errors**: Detailed field-level validation feedback
- **Authentication Errors**: Clear 401/403 responses
- **Database Errors**: Graceful handling of constraint violations
- **General Errors**: Consistent error response format

## Performance Optimizations

- **Prepared Statements**: All queries use prepared statements for better performance
- **Indexes**: Strategic indexing on frequently queried fields
- **Connection Management**: Efficient database connection handling
- **Memory Usage**: Optimized memory usage with better-sqlite3

## Future Enhancements

- **Blockchain Integration**: Real-time fan token balance checking
- **Social Media Verification**: OAuth integration for social platforms
- **Notification System**: User activity notifications
- **Analytics**: User engagement and token holding analytics
- **Rate Limiting**: Per-user API rate limiting
- **Audit Logging**: Track all user actions and changes
- **Database Migrations**: Version-controlled schema changes
- **Backup System**: Automated database backups