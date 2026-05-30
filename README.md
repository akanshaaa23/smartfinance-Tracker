SmartFinance — Personal Finance Tracker
A full-stack personal finance dashboard to track income and expenses, set monthly budgets, manage recurring transactions, and visualize spending patterns.
Made with ❤️ 

Features

Add, edit, and delete transactions with category and type tagging
Monthly budget setting with overspend alerts and progress bar
Recurring transaction automation — auto-adds marked transactions each month
Interactive charts — category-wise doughnut and monthly income vs expense bar chart
Real-time search and filters by date range, category, and type
Backup data as JSON and export filtered transactions as CSV
Multi-currency support — INR, USD, EUR, GBP
Offline-first — works without internet; syncs to backend when available
Interactive demo tour — 8-step guided walkthrough built into the app


Tech Stack
LayerTechnologyFrontendHTML, CSS, Vanilla JSChartsChart.js v4BackendNode.js, Express.jsDatabaseMongoDB Atlas (Mongoose)RuntimeES Modules (type: module)

Project Structure
smartfinance_v2/
├── public/
│   ├── finance.html       # Main HTML — landing page + app + demo overlay
│   ├── style.css          # All styles including demo tour
│   └── script.js          # All frontend logic, offline support, demo tour
├── models/
│   └── transaction.js     # Mongoose schema
├── routes/
│   └── routes.js          # CRUD API routes
├── server.js              # Express server + static file serving
├── package.json
└── .env                   # MongoDB URI and PORT

Getting Started
1. Prerequisites

Node.js v18 or above
A MongoDB Atlas account (free tier works)

2. Clone and install
bashgit clone <your-repo-url>
cd smartfinance_v2
npm install
3. Configure environment
Open .env and set your values:
envMONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
4. Run the app
bashnpm start
Then open http://localhost:5000 in your browser.

How to Use

Login — enter any username (no password needed). Your data is stored per username.
Add transactions — click + Add Transaction, fill in date, description, amount, type, and category. Mark as recurring if it repeats monthly.
Sample data — click Sample Data to load demo transactions instantly.
Set budget — enter a monthly limit and click Set. You'll get a warning at 80% and an alert if exceeded.
Filter — search by keyword, filter by date range, category, or type.
Export — download filtered data as CSV or full backup as JSON.
Demo tour — click Interactive Demo on the landing page for a guided walkthrough.


API Endpoints
MethodEndpointDescriptionGET/api/tx/:usernameGet all transactions for a userPOST/api/txAdd a new transactionPUT/api/tx/:idUpdate a transaction by IDDELETE/api/tx/:idDelete a transaction by ID

Offline Support
The app uses a localStorage-first approach. Every action — adding, editing, deleting, importing — saves locally first and syncs to MongoDB in the background. If the server is unavailable, the app continues working and shows an offline notice. Data syncs automatically when the connection is restored.
