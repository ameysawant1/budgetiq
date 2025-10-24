# BudgetIQ - Personal Finance Dashboard

A modern, responsive personal finance management application built with Next.js, React, and MongoDB. BudgetIQ helps users track expenses, manage budgets, categorize transactions, and gain insights into their spending patterns.

## ✨ Features

- **📊 Dashboard Overview**: Real-time financial summary with spending trends
- **💳 Transaction Management**: Add, view, and categorize transactions
- **🎯 Budget Tracking**: Set and monitor spending limits by category
- **🤖 Smart Categorization**: AI-assisted transaction categorization
- **📄 Receipt Upload**: OCR-powered receipt scanning and data extraction
- **🔄 Recurring Transactions**: Automated recurring payment management
- **🔍 Advanced Search**: Full-text search across transactions and categories
- **✂️ Split Expenses**: Split transactions across multiple categories/payees
- **💱 Multi-Currency Support**: Handle multiple currencies with live exchange rates
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budgetiq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Sign up for a new account or log in

## 📋 Environment Configuration

Copy `.env.example` to `.env` and configure the following variables:

### Required
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secure random string for JWT tokens (64+ characters)
- `NEXTAUTH_SECRET`: Secure random string for NextAuth sessions

### Optional
- `STRIPE_SECRET_KEY`: For payment processing
- `MAILER_DSN`: For email notifications

## 🏗️ Project Structure

```
budgetiq/
├── app/                    # Next.js App Router pages
│   ├── api/v1/            # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Authentication pages
│   └── signup/
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── public/                # Static assets
├── scripts/               # Development and setup scripts
└── types/                 # TypeScript type definitions
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

The project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prettier** for code formatting (recommended)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway

1. Connect your GitHub repository
2. Add MongoDB database service
3. Configure environment variables
4. Deploy

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user info

### Transaction Endpoints

- `GET /api/v1/transactions` - List transactions with filtering
- `POST /api/v1/transactions` - Create new transaction
- `GET /api/v1/transactions/:id` - Get transaction details
- `PUT /api/v1/transactions/:id` - Update transaction
- `POST /api/v1/transactions/:id/categorize` - Categorize transaction

### Other Endpoints

- `GET /api/v1/dashboard` - Dashboard summary data
- `GET /api/v1/budgets` - List budgets
- `POST /api/v1/receipts` - Upload receipt
- `POST /api/v1/ocr` - Process receipt with OCR

## 🗄️ Database Setup

### Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Database will be created automatically on first use

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster and database
3. Get connection string and update `MONGO_URI`

### Database Seeding

Run the setup script to create initial data:
```bash
node scripts/setup.js
```

## 🔒 Security

- JWT-based authentication with secure secrets
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure cookie configuration

## 📱 Responsive Design

BudgetIQ is fully responsive and works on:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Requirements.md](REQUIREMENTS.md) for detailed specifications
- Contact the development team

## 🔄 Version History

- **v0.1.0**: Initial release with core features
  - User authentication
  - Transaction management
  - Dashboard overview
  - Basic budgeting

---

Built with ❤️ using Next.js, React, and MongoDB
