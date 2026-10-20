# Streakly

Small ticks, big streaks.

Streakly is a simple habit tracker. You add the habits you want to build, tick them off each day, and it keeps track of your current and longest streaks. Built with the MERN stack.

## Features

- Add habits with a name and an accent color
- Tick off any day of the current week (Mon to Sun); future days are locked
- Current streak and longest streak for each habit
- Yearly history heatmap per habit, GitHub style (click "History" on a card)
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
│   ├── models/Habit.js
│   ├── routes/habits.js
│   └── server.js
└── client/src/
    ├── api/habits.js
    ├── utils/        (streak.js, colors.js)
    ├── components/   (Header, TodaySummary, AddHabitForm, HabitList, HabitCard, WeekDots, YearHeatmap, EditHabitModal)
    ├── App.jsx
    └── main.jsx
```

## Running locally

You need Node.js 18+ and MongoDB (a local install or a free Atlas cluster).

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

## Environment variables

**server/.env**

| Variable     | Example                                 | Notes                          |
| ------------ | --------------------------------------- | ------------------------------ |
| `MONGO_URI`  | `mongodb://127.0.0.1:27017/streakly`    | Local or Atlas connection string |
| `PORT`       | `5000`                                  |                                |
| `CLIENT_URL` | `http://localhost:5173`                 | Allowed CORS origin            |

**client/.env**

| Variable       | Example                 |
| -------------- | ----------------------- |
| `VITE_API_URL` | `http://localhost:5000` |

## API

All routes are under `/api/habits`.

| Method | Route         | Description                                            |
| ------ | ------------- | ------------------------------------------------------ |
| GET    | `/`           | All habits, newest first                               |
| POST   | `/`           | Create a habit `{ name, color }` (400 if name missing) |
| PUT    | `/:id`        | Update name / color                                    |
| DELETE | `/:id`        | Delete a habit                                         |
| PATCH  | `/:id/toggle` | Body `{ date: "YYYY-MM-DD" }`, adds or removes the date |

Unknown or invalid ids return 404. `GET /api/health` returns `{ ok: true }`.

## Deployment

- **Database**: create a free cluster on MongoDB Atlas. Under Network Access, allow `0.0.0.0/0` so Render can connect (Render doesn't have fixed outbound IPs on the free tier).
- **Server on Render**: new Web Service, root directory `server`, build command `npm install`, start command `npm start`. Set `MONGO_URI` and `CLIENT_URL` (your Vercel URL, no trailing slash).
- **Client on Vercel**: import the repo, root directory `client`, framework preset Vite. Set `VITE_API_URL` to your Render URL.
- Render's free tier spins the server down after about 15 minutes of inactivity, so the first request after that can take 30 to 60 seconds. The app shows the loading state while it wakes up.

## Remaining work

These are still open and split up for the team:

1. **Edit habit modal** (`client/src/components/EditHabitModal.jsx`)
   Currently a placeholder. Needs a name input, the color swatches from `utils/colors.js`, Save and Cancel buttons, close on Escape or backdrop click, and an error message if saving fails. `App.jsx` already passes `habit`, `onSave(id, { name, color })` and `onClose`, and the `PUT /api/habits/:id` route is done and tested.

2. **Deploy**
   Follow the Deployment section above: set up Atlas, deploy the server to Render and the client to Vercel, then add the live URLs to the top of this README.

3. **Server-side color validation** (`server/routes/habits.js`)
   The API accepts any string as `color`. Only accept hex colors like `#f97316` and return 400 otherwise, for both POST and PUT.

## Future improvements

- User accounts and authentication
- Daily reminders (email or push notifications)
- Dark mode
