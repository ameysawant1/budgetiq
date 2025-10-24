BudgetIQ is a personal finance management web application built with Next.js, React, and Tailwind CSS. It provides users with tools to track, categorize, and analyze their financial data, including transactions, budgets, receipts, and recurring expenses. The app features AI-assisted categorization for smarter insights, multi-currency support, and collaborative expense splitting. It has a public landing area for marketing and user acquisition, and a protected dashboard for authenticated users to manage their finances. The goal is to help users take control of their money with intelligent predictions, automated categorization, and personalized recommendations.

Below is a breakdown of every page in the codebase, based on their content and purpose:

Public Pages (Landing Area)
/ (app/page.tsx): The homepage/landing page. It features a hero section promoting "Smart AI-Powered Budgeting," with calls-to-action for getting started or learning more. It includes sections for features (e.g., smart budgeting, personalized insights, future projections), how it works, testimonials, and navigation links to log in or sign up. This is the entry point for unauthenticated users.

/login (app/login/page.tsx): A login form page for existing users. Users enter their email and password, with options for "remember me" and a forgot password link. On successful login, it redirects to the dashboard. It includes error handling and a link to sign up for new users.

/signup (app/signup/page.tsx): A signup form page for new users. Users provide their full name, email, password (with show/hide toggle and validation for 8+ characters), and agree to terms. It includes a promotional sidebar highlighting features like smart budgeting and insights. On success, it redirects to the dashboard. It has modal error handling for validation issues.

Dashboard Pages (Authenticated Area, under /dashboard)
All dashboard pages are protected and accessible only after login. They share a common layout with a sidebar for navigation and a navbar (which hides landing links when in dashboard mode).

/dashboard (app/dashboard/page.tsx): The main dashboard overview page. It displays summary metrics in cards (e.g., total balance, monthly income, monthly expenses with percentage changes). Includes placeholders for charts (spending overview and category distribution). Features a search bar and an "AI Insights" button. This serves as the central hub for financial summaries.

/dashboard/budget (app/dashboard/budget/page.tsx): Budget management page. Shows budget status per category (e.g., food, housing) with progress bars indicating spent vs. limit amounts. Includes a budget summary card with total budget, spent so far, remaining, and overall health status. Allows adding new budgets via a button.

/dashboard/multi-currency (app/dashboard/multi-currency/page.tsx): Multi-currency management page. Features a currency converter tool with inputs for amount and currency selection. Displays a multi-currency balance (e.g., in EUR and converted to USD). Includes a button to add foreign transactions.

/dashboard/receipt-upload (app/dashboard/receipt-upload/page.tsx): Receipt upload page. Provides a drag-and-drop area for uploading receipt files (images or PDFs). Includes a button to take a photo of a receipt. Currently logs files to console; intended for OCR processing to extract data like totals and vendors.

/dashboard/recurring (app/dashboard/recurring/page.tsx): Recurring transactions page. Displays a table of recurring transactions (e.g., Netflix subscription) with columns for description, amount, category, frequency, next date, status, and actions (renew, edit, delete). Includes a button to add new recurring transactions.

/dashboard/search (app/dashboard/search/page.tsx): Transaction search page. Offers filters for searching transactions (e.g., by text, category, type) with a reset button. Shows a placeholder for search results (e.g., "Search Results (12)").

/dashboard/smart-categorization (app/dashboard/smart-categorization/page.tsx): Smart categorization page. Displays a table of pending transactions needing categorization, with AI-suggested categories (e.g., shopping for Amazon purchases). Users can override suggestions via dropdowns and approve/apply changes. Includes a button to run AI categorization.

/dashboard/split-expenses (app/dashboard/split-expenses/page.tsx): Split expenses page. Shows a list of expense-sharing groups (e.g., "Beach Trip" with people and expense counts). Includes a button to create new groups. Has a placeholder for selecting a group to view/manage shared expenses.

/dashboard/transactions (app/dashboard/transactions/page.tsx): Transactions page focused on adding new transactions. Features a form for quick add (amount, type - expense/income, category, date, description) with tabs for recurring, split, or transfer. Includes buttons for adding expenses, income, or uploading receipts. Currently logs form data to console; intended for backend integration. (Note: While REQUIREMENTS.md mentions a "Transactions viewer," this page is primarily for adding; viewing might be planned or handled elsewhere.)