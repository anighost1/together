import express, { Request, Response } from 'express';
import { config } from 'dotenv'
import cors from 'cors'

import authRoute from './router/auth/auth.route'

config()

const app = express();
const port = process.env.PORT || 6970;

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req: Request, res: Response) => {
    res.send('Together');
});

app.use('/api/auth', authRoute)

app.listen(port, () => {
    console.log(`Together server running at port : ${port}`);
});