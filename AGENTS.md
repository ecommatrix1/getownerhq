# Project Agent Instructions

This repository follows a specific architecture. Below are the commands to set up the environment, configure variables, and run tests.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables. You can copy the provided example file:
   ```bash
   cp .env.example .env
   ```
   *Generic Placeholders:* Ensure you have valid keys for database connections, third-party integrations, and API endpoints as defined in the `.env` file. (e.g. `SUPABASE_URL=...`, `API_KEY=...`) Note: For testing purposes, you may need to comment out `VITE_SENTRY_DSN` if you don't have a valid key, or else Sentry will throw an error on load.

3. Run the test suite:
   ```bash
   npm test
   ```
