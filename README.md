# Streakly

Small ticks, big streaks.

Streakly is a simple habit tracker. You add the habits you want to build, tick them off each day, and it keeps track of your current and longest streaks. Built with the MERN stack.

## Features

- Add habits with a name and an accent color
- Edit a habit's name, color and weekly goal later (click "Edit" on a card)
- Tick off any day of the current week (Mon to Sun); future days are locked
- Current streak and longest streak for each habit
- Yearly history heatmap per habit, GitHub style (click "History" on a card)
- Weekly goals: aim for 1 to 7 days a week, with "This week 3/5" progress on each card
- Stats view: 30-day completion, perfect days, top streak, an all-habits heatmap, completion by weekday, and a per-habit table
- Reorder habits (move up / down) and archive the ones you've paused, with undo
- Light, dark and system themes
- Welcome panel with a greeting, today's progress ring and a quote of the day
- Emoji icon and category per habit, plus search, category filters and a "To do today" filter
- Achievements (streak, total and perfect-week badges) with confetti when you unlock one or finish the day
- Optional daily reminder time per habit: a browser notification while Streakly is open in a tab
- Keyboard shortcuts: `n` new habit, `/` search, `h` / `s` switch views, `t` theme, `?` help
- Account settings: change name or password, export / import your data as JSON, delete your account
- Today's progress bar ("Today: 2 / 3 done")
- Toggling updates the UI instantly and rolls back if the request fails
- Delete with confirmation
- Loading, empty and "server unreachable" states
- Works on mobile

### How streaks are counted

- **Current streak**: consecutive completed days counting back from today. If today isn't ticked yet, counting starts from yesterday, so the streak doesn't break until the day is actually over.
- **Longest streak**: the longest run of consecutive completed days ever.

Dates are stored as `YYYY-MM-DD` strings and are always generated on the client with `dayjs().format("YYYY-MM-DD")`. The server never decides what "today" is, so the user's local timezone is what counts.

## Tech stack

- **Client**: React (Vite), Tailwind CSS, Axios, day.js
- **Server**: Node.js, Express, Mongoose
- **Database**: MongoDB

## Project structure

```
streakly/
├── server/
│   ├── models/        (Habit.js, User.js)
│   ├── routes/        (habits.js, auth.js)
│   ├── middleware/auth.js
│   ├── lib/validate.js
│   ├── test/
│   ├── app.js         (Express app, no DB connection, so it can be tested)
│   └── server.js      (connects to MongoDB and starts the app)
└── client/src/
    ├── api/          (habits.js, auth.js)
    ├── hooks/        (useTheme, useToasts)
    ├── utils/        (streak.js, stats.js, colors.js, goals.js)
    ├── components/   (HabitCard, HabitList, StatsView, SettingsModal, Modal, ...)
    ├── App.jsx
    └── main.jsx
```

## Running locally

You need Node.js 20.19+ (or 22.12+) and MongoDB (a local install or a free Atlas cluster).

**1. Server**

```bash
cd server
npm install
cp .env.example .env     # then fill in MONGO_URI
npm run dev
```

The API runs on http://localhost:5000. Check http://localhost:5000/api/health, it should return `{ "ok": true }`.

**2. Client** (in a second terminal)

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

## Tests

Both sides use Node's built-in test runner, no extra packages needed.

```bash
cd server && npm test   # input validation
cd client && npm test   # streak and stats calculations
```

## Environment variables

**server/.env**

| Variable     | Example                                 | Notes                          |
| ------------ | --------------------------------------- | ------------------------------ |
| `MONGO_URI`  | `mongodb://127.0.0.1:27017/streakly`    | Local or Atlas connection string |
| `PORT`       | `5000`                                  |                                |
| `CLIENT_URL` | `http://localhost:5173`                 | Allowed CORS origin            |
| `JWT_SECRET` | 96 random hex characters                | Signs login tokens. Optional locally (a dev secret is used, with a warning). **Required in production**, at least 32 characters, or the server won't start |

Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

**Habits from before accounts existed** aren't given to anyone automatically. To assign them to your account, run `npm run claim-habits -- you@example.com` in `server/`.

**client/.env**

| Variable       | Example                 |
| -------------- | ----------------------- |
| `VITE_API_URL` | `http://localhost:5000` |

## API

Everything except `/api/health`, register and login needs an `Authorization: Bearer <token>` header.

**Auth** (`/api/auth`)

| Method | Route          | Description                                                      |
| ------ | -------------- | ---------------------------------------------------------------- |
| POST   | `/register`    | `{ name, email, password }`, returns `{ token, user }`           |
| POST   | `/login`       | `{ email, password }`, returns `{ token, user }`                 |
| GET    | `/me`          | The signed-in user                                               |
| PUT    | `/me`          | `{ name }`, returns a fresh `{ token, user }`                    |
| PUT    | `/me/password` | `{ currentPassword, newPassword }`                               |
| DELETE | `/me`          | `{ password }`, deletes the account and all its habits           |

**Habits** (`/api/habits`)

| Method | Route         | Description                                                                 |
| ------ | ------------- | --------------------------------------------------------------------------- |
| GET    | `/`           | All your habits (archived included), in your chosen order                   |
| POST   | `/`           | Create `{ name, color?, weeklyGoal?, icon?, category?, reminderTime? }`, goes to the top of the list |
| PUT    | `/:id`        | Update any of `name`, `color`, `weeklyGoal` (1 to 7), `archived`, `icon`, `category`, `reminderTime` (`HH:mm`) |
| DELETE | `/:id`        | Delete a habit                                                              |
| PATCH  | `/:id/toggle` | Body `{ date: "YYYY-MM-DD" }`, adds or removes the date                     |
| PUT    | `/reorder`    | Body `{ ids: [...] }`, your habit ids in the new order                      |
| GET    | `/export`     | All habits and history as JSON                                              |
| POST   | `/import`     | Body is an export file; adds its habits (up to 500) next to existing ones   |

Bad input returns 400 with `{ error }`. Unknown or invalid ids return 404. `GET /api/health` returns `{ ok: true }`.

## Deployment

- **Database**: create a free cluster on MongoDB Atlas. Under Network Access, allow `0.0.0.0/0` so Render can connect (Render doesn't have fixed outbound IPs on the free tier).
- **Server on Render**: new Web Service, root directory `server`, build command `npm install`, start command `npm start`. Set `MONGO_URI`, `CLIENT_URL` (your Vercel URL, no trailing slash), `JWT_SECRET` (see above) and `NODE_ENV=production`.
- **Client on Vercel**: import the repo, root directory `client`, framework preset Vite. Set `VITE_API_URL` to your Render URL.
- Render's free tier spins the server down after about 15 minutes of inactivity, so the first request after that can take 30 to 60 seconds. The app shows the loading state while it wakes up.

## Remaining work

- **Deploy**: Follow the Deployment section above: set up Atlas, deploy the server to Render and the client to Vercel, then add the live URLs to the top of this README.

## Future improvements

- Daily reminders (email or push notifications)
