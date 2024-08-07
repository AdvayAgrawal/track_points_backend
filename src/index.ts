import cors from 'cors';
import { CronJob } from 'cron';
import express from 'express';
import fs from 'fs';
import add_points from './manage_points/add_points';
const app = express();
const port = 3001;

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

app.post('/add_points', (req, res) => {
  console.log(req.body.length)
  // add_points(req.body)
  res.send({messsage:"Points added"})
});

app.post('/update_current_points', (req, res) => {
  fs.writeFileSync("./src/usercache/useractions.json", JSON.stringify(req.body,null,2))
  // add_points(req.body)
  res.send({messsage:"Points added"})
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const job = new CronJob(
	'0 0 0 * * *', // cronTime
	async function () {
    const action_data = JSON.parse(fs.readFileSync("./src/usercache/useractions.json", "utf-8"));
		console.log('Starting cron job for actions', action_data.data);
    await add_points(action_data.data)
    console.log('Cron job completed')
	}, // onTick
	null, // onComplete
);

job.start()
