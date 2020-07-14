import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import CookieParser from 'cookie-parser';
import 'dotenv/config';
import routes from './routes';
import Logger from './helpers/Logger';

class App {
  private app: express.Express;
  private PORT = process.env.PORT || 9090;

  constructor() {
    this.app = express();

    morgan.token('date', () => new Date().toLocaleString());
    process.env.TZ = 'Africa/Lagos';

    this.app.use(cors());
    this.app.use(CookieParser());
    this.app.use(morgan(':date *** :method :: :url ** :response-time'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(routes);
  }

  boot() {
    this.app.listen(this.PORT, () => {
      Logger.log(`app running on http://localhost:${this.PORT}`);
    });
    return this.app;
  }
}

const app = new App().boot();

export default app;
