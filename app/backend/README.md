# Backend – API, Bots, and Agent Management

This is the backend for the Fan Leaderboard: a Node.js/Express server that exposes a REST API.

---

## Features

- **Letta Integration**: Stateful LLM agent framework
- **User Management**
- **Tiktok Support**: Connects tiktok accounts
- **Advanced scoring and trust system based on **trust propagation** and a list of **seed accounts**

---

## Architecture Overview

- **Express API**: Handles HTTP requests for agent, secret, tool, and trigger management
- **Bot Services**: Runs both Discord and Telegram bots, relaying messages to/from Letta agents
- **Database**: Local SQLite for persistent data
- **Config**: Centralized, type-safe config (see `config/`)

---

## Security Warning

> **WIP: This backend currently has NO authentication or authorization!**
>
> - Any user can access or modify any agent, secret, or trigger
> - Do NOT use in production without implementing security (see TODOs in code)

---

## Quickstart

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment**

   - Copy `.env.template` to `.env` and fill in required values (Letta, Discord, Telegram, etc.)
   - See config docs and comments for details

3. **Run the backend**

   ```bash
   pnpm start
   # or
   node server.js
   ```

---

## Directory Structure

- `controllers/` – API endpoint logic
- `services/` – Service logic
- `routes/` – Express route definitions
- `middlewares/` – Error handling, validation, etc.
- `database/` – SQLite setup
- `config/` – Centralized config and validation
- `data/` – Local DB and prompt data
- `tests/` – HTTP and unit tests

---

## Environment Variables

- `LETTA_*` – Letta server and agent config
- `DISCORD_*` – Discord bot config
- `TELEGRAM_*` – Telegram bot config
- See `.env.template` for all options

---

## Development & Testing

- Use the HTTP files in `tests/` to try endpoints
- See code comments for extension points

---

## More Info

- [Global README](../../readme.md) – Monorepo overview
- [Frontend README](../frontend/README.md) – Admin dashboard

---

## License

MIT (or project-specific)
