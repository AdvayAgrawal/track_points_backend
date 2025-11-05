import cors from 'cors';
import { CronJob } from 'cron';
import express from 'express';
import fs from 'fs';
import add_points, { actionsOfDayInput, dateToDay, dayToDate, getLastDay } from './manage_points/add_points';
import { getWeeklySummary } from './manage_points/weekly_summary';
import { fetchPointSystem } from './tables/point_system';
import { fetchTargets } from './tables/targets';
import { fetchTotalActionPoints } from './tables/total_action_points';
const app = express();
const port = 3000;

// Configure CORS to allow requests from any origin
const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors());
app.use(express.json());  //important: learn middleware functionality

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/update_current_points', (req, res) => {
  fs.writeFileSync("./src/usercache/useractions.json", JSON.stringify(req.body, null, 2))
  res.send({ messsage: "Points added" })
});

app.get('/uploaded_actions', (req, res) => {
  const data = JSON.parse(fs.readFileSync("./src/usercache/useractions.json", "utf-8"));
  res.send(data);
})

app.get('/weekly_summary', async (req, res) => {
  const action = req.query.action as string;
  try {
    const weekly_summary = await getWeeklySummary(action);
    res.send(weekly_summary);
  } catch (error) {
    res.status(500).send({ error: `Failed to fetch weekly summary for ${action}` });
  }
})


app.get('/tables/point_system', async (req, res) => {
  res.send(await fetchPointSystem());
})

app.get('/tables/targets', async (req, res) => {
  res.send(await fetchTargets());
})

app.get('/tables/total_points', async (req, res) => {
  res.send(await fetchTotalActionPoints());
})

async function updatePointsTillToday() {
  let day = (await getLastDay()) + 1;
  const curDay = dateToDay(new Date())
  console.log(day, curDay)
  console.log(dayToDate(day).toDateString(), (new Date()).toDateString())
  while (day < curDay) {
    await handler();
    day += 1
  }
  console.log("Up to date!")
}


async function handler() {
  const action_data: actionsOfDayInput = JSON.parse(fs.readFileSync("./src/usercache/useractions.json", "utf-8"));
  console.log("*******************************************************")
  console.log('Starting cron job for actions', action_data.actions, "and thoughts", action_data.thought);

  await add_points(action_data);

  //reset user actions for the day
  fs.writeFileSync("./src/usercache/useractions.json", JSON.stringify({ actions: "", thought: "", points: 0 }));
  console.log('Cron job completed at ', new Date().toString())
  console.log("*******************************************************")
}

const job = new CronJob(
  '0 0 0 * * *', // cronTime
  handler, // onTick
);

app.listen(port, async () => {
  // await updatePointsTillToday();
  console.log("Server started at: ", new Date().toString());
  console.log(`Server is running at http://localhost:${port}`);
  job.start();
  // handler()
});

