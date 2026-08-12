@echo off
echo === Khan Interface — Git Push ===
cd /d "C:\Users\Hp\OneDrive\Desktop\khan dashboard\khan-interface"

set GIT="C:\Program Files\Git\bin\git.exe"

%GIT% config --global user.name "Mohammed Nawaz Khan"
%GIT% config --global user.email "mohammednawazkhan40@gmail.com"
%GIT% config --global init.defaultBranch main

echo Initializing git...
%GIT% init

echo Adding remote...
%GIT% remote remove origin 2>nul
%GIT% remote add origin https://github.com/mohammednawazkhan40/Khan-UI.git

echo Staging files...
%GIT% add .

echo Committing...
%GIT% commit -m "feat: Khan Interface v1 — KM Car Deals AI Business OS

- Complete Next.js 14 + TypeScript + Tailwind CSS frontend
- Premium dashboard (Nawaz Command Center) with KPI cards + charts
- 20 customers, 18 vehicles, 10 finance accounts, 10 RTO tasks (mock data)
- Finance Management with overdue tracking
- RTO Manager with document status tracking
- 7 AI Agents: RTO, Finance, Sales, Accountant, Customer, Vehicle, Business Manager
- Each agent has chat interface + run button + findings
- Calendar & Reminder Engine
- Customers, Vehicles, Transactions, Payments, Sales, Accountant modules
- Documents, Notifications, Settings, Web3 pages
- Collapsible animated sidebar + global search (Ctrl+K) + Quick Add
- Dark/light mode + responsive mobile layout
- Full service/API abstraction layer — ready for backend connection
- .env.example for all integration points"

echo Pushing to GitHub...
%GIT% branch -M main
%GIT% push -u origin main --force

echo.
echo === DONE! Check https://github.com/mohammednawazkhan40/Khan-UI ===
pause
