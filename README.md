# Fan Leaderboard

Welcome to the **Fan Leaderboard** repo!

This project provides a full-stack platform

## Project Structure

- `app/backend/` – Node.js/Express API server supporting bots, agent management using Letta.
- `app/frontend/` – Modern React (Vite + Tailwind + shadcn/ui) admin dashboard for managing agents and secrets.


## Goal
> 

```mermaid
graph LR
    
```

## Quick Start

**Quick start Letta**
The project uses letta as a core ai agent framework.
To deploy it, the easiest way is to use this [one click install on railway](https://railway.com/deploy/jgUR1t)
After deploying it, you will have all the required .env var to start the repo

**Quick start Fan Leaderboard**
```
git clone https://github.com/bertrandbuild/fan-leaderboard.git
cd fan-leaderboard
# fill the .env using the app/backend/.env.template
pnpm start # start the backend
# in another terminal
pnpm start:frontend # start the frontend
```

## Tech Stack

- Backend: Node.js, Express, Letta, Sqlite
- Frontend: React (Vite), TailwindCSS, shadcn/ui
- Messaging: Telegram Bot API

## Complementary information

> This project is for development and demo purposes only!

---

