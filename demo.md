# Streakly demo

A walkthrough for running Streakly locally and showing off every feature, in about 10 minutes.

## 1. Start the app

You need Node.js 18+ and MongoDB running locally (or an Atlas connection string).

**Terminal 1, the API:**

```bash
cd server
npm install
npm run dev
```

`server/.env` must have `MONGO_URI` filled in, for example:

```
MONGO_URI=mongodb://127.0.0.1:27017/streakly
```

You can also pass it for one run without editing the file:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/streakly npm run dev
```

You should see:

```
JWT_SECRET is not set, using the development secret. Never do this in production.
MongoDB connected
Server running on port 5000
```

The warning is expected locally. Check http://localhost:5000/api/health returns `{"ok":true}`.

**Terminal 2, the client:**

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

| Part   | URL                     |
| ------ | ----------------------- |
| Client | http://localhost:5173   |
| API    | http://localhost:5000   |
| Health | http://localhost:5000/api/health |

## 2. Load demo data (optional but recommended)

A fresh account has no history, so the heatmaps and stats look empty. To get a year of realistic data:

1. Create an account (step 3 below).
2. Save the JSON at the end of this file as `streakly-demo.json`.
3. Open **your name → Your data → Import JSON** and pick the file.

Or generate fresh random history relative to today, with the API running:

```bash
node -e '
const day = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toLocaleDateString("en-CA"); };
const hist = (p, len) => Array.from({ length: len }, (_, i) => i).filter((i) => i > 0 && Math.random() < p).map(day);
console.log(JSON.stringify({ habits: [
  { name: "Read 20 pages", color: "#22c55e", weeklyGoal: 5, completedDates: [...hist(0.7, 300), day(0)] },
  { name: "Morning run",   color: "#3b82f6", weeklyGoal: 3, completedDates: hist(0.45, 200) },
  { name: "Meditate",      color: "#a855f7", weeklyGoal: 7, completedDates: [...hist(0.85, 120), day(0), day(1), day(2), day(3)] },
  { name: "Learn Spanish", color: "#eab308", weeklyGoal: 4, completedDates: hist(0.5, 90) },
  { name: "Old habit",     color: "#ef4444", archived: true, completedDates: hist(0.5, 60) },
]}, null, 2));
' > streakly-demo.json
```

Then import `streakly-demo.json` as above.

## 3. Demo script

### Accounts
1. Click **Get Started** → **Create Account**. Use any name, email and a password of 6+ characters.
2. Habits are private: sign out, create a second account, and it starts empty.

### Habits
1. Type a habit name, pick a **color** and a **weekly goal** (1–7 days, 7 = every day), click **Add**. New habits go to the top.
2. Tick today's circle. The **Today** bar at the top updates instantly.
3. Each card shows **Streak**, **Best** and **This week 2/5**. A green ✓ appears once the weekly goal is met.
4. Use the **‹ ›** arrows to go back to earlier weeks and tick past days. Future days are locked.
5. Click **History** on a card for a GitHub-style heatmap of the last year. Hover a square to see its date.
6. Click **Edit** to rename, recolor or change the goal. Escape or clicking outside closes it.

### Make it yours
1. In the add form, open **Icon, category & reminder** to pick an emoji, a category (Health, Fitness, Mind, ...) and an optional reminder time.
2. The welcome panel at the top greets you, shows a progress ring for today and a new quote each day.
3. Tick every habit for today: confetti, and the ring turns green 🎉.
4. Use the search box, category chips and **To do today** above the list to filter.
5. Press **?** for keyboard shortcuts (`n` new habit, `/` search, `h` / `s` switch views, `t` theme).
6. Reminders: account menu → **Account settings → Reminders → Turn on system notifications**. They show while the tab is open.

### Organizing
1. Open the **⋯** menu on a card: **Move up / Move down** reorders. The order is saved, so it survives a refresh.
2. **⋯ → Archive** hides a habit without losing its history. A popup offers **Undo**.
3. At the bottom, open **Archived (n)** to **Restore** or **Delete** it.
4. **⋯ → Delete** removes a habit for good (asks to confirm).

### Stats
Switch to the **Stats** tab (or press `s`):
- **Tiles**: share of check-ins done in the last 30 days, perfect days (every habit ticked), top current streak, active habits.
- **All habits, last year**: heatmap where darker orange means more of your habits were done that day.
- **By day of the week**: completion per weekday over the last 12 weeks. Hover a bar to read its value; by default it names your best day.
- **Per habit**: streak, best, last-30-day completion and how many of the last 12 weeks met the goal.

- **Achievements**: 12 badges for streaks, totals and perfect weeks. Locked ones show your progress.

Archived habits aren't counted in stats.

### Theme
Click the sun / moon / monitor button in the header to cycle **light → dark → system**. The choice is remembered.

### Account settings
Click your **avatar** (top right) → **Account settings**:
- **Profile**: change your display name.
- **Change password**: needs the current one.
- **Your data**: **Export JSON** downloads everything; **Import JSON** adds habits from a file next to your existing ones (importing twice gives duplicates).
- **Delete account**: asks for your password, then removes the account and all its habits.

## 4. Trying the API directly

```bash
# sign up and keep the token
TOKEN=$(curl -s -X POST localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Api","email":"api@example.com","password":"secret1"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# create a habit
curl -s -X POST localhost:5000/api/habits -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"name":"Drink water","weeklyGoal":7}'

# list habits
curl -s localhost:5000/api/habits -H "Authorization: Bearer $TOKEN"

# validation in action: returns 400
curl -s -X POST localhost:5000/api/habits -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"name":"Bad","color":"blue"}'
```

The full route list is in the README's **API** section.

## 5. Tests

```bash
cd server && npm test   # input validation and JWT secret rules
cd client && npm test   # streak and stats calculations
```

## 6. Troubleshooting

| Problem | Fix |
| ------- | --- |
| `MONGO_URI is not set` | Fill in `MONGO_URI` in `server/.env` (see step 1). |
| `MongoDB connection failed` | Start MongoDB (`sudo systemctl start mongod`) or check your Atlas URI and network access. |
| `JWT_SECRET is not set ... required when NODE_ENV=production` | Set `JWT_SECRET` to 32+ random characters. Locally, just don't set `NODE_ENV=production`. |
| Client says "Couldn't reach the server" | Make sure the API is running on port 5000, or set `VITE_API_URL` in `client/.env`. |
| Browser shows a CORS error | `CLIENT_URL` in `server/.env` must match the client's URL exactly (no trailing slash). |
| Port 5000 or 5173 already in use | Change `PORT` in `server/.env` (and `VITE_API_URL` to match), or stop the other process. |
| Signed out after updating | The development token secret changed; sign in again. |
| Old habits from before accounts are missing | Run `npm run claim-habits -- you@example.com` in `server/`. |

## Sample data

Save as `streakly-demo.json` and import it. The dates are fixed, so streaks will only be "current" around late October 2026; use the generator in step 2 for data relative to today.

```json
{
  "habits": [
    {
      "name": "Read 20 pages",
      "color": "#22c55e",
      "weeklyGoal": 5,
      "completedDates": [
        "2026-10-01", "2026-10-02", "2026-10-05", "2026-10-06", "2026-10-07",
        "2026-10-09", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15",
        "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-26",
        "2026-10-27", "2026-10-28", "2026-10-29"
      ]
    },
    {
      "name": "Morning run",
      "color": "#3b82f6",
      "weeklyGoal": 3,
      "completedDates": [
        "2026-10-03", "2026-10-06", "2026-10-08", "2026-10-11", "2026-10-13",
        "2026-10-17", "2026-10-20", "2026-10-22", "2026-10-25", "2026-10-28"
      ]
    },
    {
      "name": "Meditate",
      "color": "#a855f7",
      "weeklyGoal": 7,
      "completedDates": [
        "2026-10-16", "2026-10-17", "2026-10-18", "2026-10-19", "2026-10-20",
        "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25",
        "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29"
      ]
    },
    {
      "name": "Old habit",
      "color": "#ef4444",
      "archived": true,
      "completedDates": ["2026-09-01", "2026-09-02", "2026-09-04", "2026-09-07"]
    }
  ]
}
```
