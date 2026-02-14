# Notenibo 📚

A modern marketplace platform for students to buy and sell study notes. Built with Next.js 16, TypeScript, and MongoDB.

## 🌟 Features

- **📝 Note Marketplace**: Browse, search, and purchase study notes from fellow students
- **💰 Wallet System**: Integrated balance management for seamless transactions
- **🔐 Secure Authentication**: Sign in with Google or email/password using NextAuth
- **📤 Upload & Sell**: Submit your notes for approval and earn money
- **👨‍💼 Admin Dashboard**: Review submitted notes, manage users, and monitor platform statistics
- **🔔 Telegram Integration**: Automated notifications to admins for new submissions and balance requests
- **☁️ Cloud Storage**: Reliable file storage powered by Cloudflare R2
- **🎨 Modern UI**: Beautiful, responsive interface with Tailwind CSS and Framer Motion animations

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js (Google OAuth & Credentials)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Telegram Bot API

## Screenshots
![](https://raw.githubusercontent.com/moyshik7/notes-web/refs/heads/main/public/demo/6.png)  
![](https://raw.githubusercontent.com/moyshik7/notes-web/refs/heads/main/public/demo/7.png)  
![](https://raw.githubusercontent.com/moyshik7/notes-web/refs/heads/main/public/demo/4.png)  
![](https://raw.githubusercontent.com/moyshik7/notes-web/refs/heads/main/public/demo/5.png)  
![](https://raw.githubusercontent.com/moyshik7/notes-web/refs/heads/main/public/demo/1.png)  
![](https://raw.githubusercontent.com/moyshik7/notes-web/refs/heads/main/public/demo/2.png)  
![](https://raw.githubusercontent.com/moyshik7/notes-web/refs/heads/main/public/demo/8.png)  
![](https://raw.githubusercontent.com/moyshik7/notes-web/refs/heads/main/public/demo/3.png)  

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js >= 22.0.0
- npm or yarn package manager
- MongoDB database (local or cloud instance like MongoDB Atlas)
- Cloudflare R2 bucket and credentials
- Google OAuth credentials (optional, for Google sign-in)
- Telegram Bot token and channel ID (optional, for admin notifications)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/notenibo.git
cd notenibo
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudflare R2
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHANNEL_ID=your_telegram_channel_id
```

### 🔑 Setting up Environment Variables

<details>
<summary><b>MongoDB URI</b></summary>

- Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- Create a new cluster
- Click "Connect" → "Connect your application"
- Copy the connection string and replace `<password>` with your database user password
</details>

<details>
<summary><b>NextAuth Secret</b></summary>

Generate a random secret key:
```bash
openssl rand -base64 32
```
</details>

<details>
<summary><b>Google OAuth</b></summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret
</details>

<details>
<summary><b>Cloudflare R2</b></summary>

1. Sign up for [Cloudflare](https://www.cloudflare.com/)
2. Go to R2 Storage → Create bucket
3. Go to "Manage R2 API Tokens" → Create API token
4. Copy Account ID, Access Key ID, and Secret Access Key
</details>

<details>
<summary><b>Telegram Bot</b></summary>

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow instructions
3. Copy the bot token
4. Create a Telegram channel for admin notifications
5. Add your bot as an admin to the channel
6. Get the channel ID (use [@userinfobot](https://t.me/userinfobot))
</details>

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t notenibo .
docker run -p 3000:3000 --env-file .env.local notenibo
```

## 📁 Project Structure

```
notenibo/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── notes/             # Browse and view notes
│   ├── admin/             # Admin panel
│   ├── sell/              # Upload notes
│   └── ...
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # MongoDB connection
│   ├── r2.ts             # Cloudflare R2 utilities
│   └── telegram.ts       # Telegram notifications
├── models/                # Mongoose models
│   ├── User.ts
│   ├── Note.ts
│   ├── Transaction.ts
│   └── BalanceRequest.ts
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## 👤 User Roles

### Student (Default)
- Browse and purchase notes
- Upload notes for sale (pending admin approval)
- Request balance top-ups
- View purchase history

### Admin
- Approve/reject submitted notes
- Manage balance requests
- View platform statistics
- Delete notes
- Access admin dashboard

### Creating an Admin User

After registering, manually update the user's role in the MongoDB database:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use strong, unique passwords for all services
- Regularly rotate API keys and secrets
- Enable 2FA on all service accounts
- Keep dependencies updated: `npm audit fix`

## 📝 API Routes

Key API endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/notes/upload` - Upload a new note
- `GET /api/notes` - Get all approved notes
- `POST /api/notes/[id]/buy` - Purchase a note
- `GET /api/notes/[id]/download` - Download purchased note
- `POST /api/user/add-balance` - Request balance top-up
- `GET /api/user/dashboard` - Get user dashboard data
- `GET /api/admin/stats` - Get admin statistics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Bug Reports & Feature Requests

If you encounter any bugs or have feature requests, please file an issue on the [GitHub Issues](https://github.com/yourusername/notenibo/issues) page.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ for students, by students