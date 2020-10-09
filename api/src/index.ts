import express from "express";
import morgan from 'morgan';
import bodyParser, { json } from 'body-parser';
import * as http from 'http';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import cors from 'cors';

import { registerSocket } from './socketConnection';
import config from './config';
import { requestServiceAccountWatch } from "./helpers";

const app = express();
const server = http.createServer(app);
const googleClient = new OAuth2Client(config.clientId);

registerSocket(server);

console.log(config);

app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://localhost:8080'
  ],
  credentials: true,
  exposedHeaders: ['set-cookie']
}));
app.use(morgan('combined'));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(session({
  secret: 'secret',
  resave: false,
  unset: 'destroy',
  name: 'session',
  saveUninitialized: false,
  cookie: {
    maxAge: 600000,
    secure: true,
  },
  genid: (req) => (
    uuidv4()
  ),
}));


app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from api!',
  });
});

const verifyAccessToken = async (token: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: config.clientId,
  });
  const payload = ticket.getPayload();
  const id = payload?.sub;
  const name = payload?.name;
  const email = payload?.email;
  return id ? { id, name, email } : null;
};

app.post('/login_google', async (req, res) => {
  try {
    if (!req.session) throw new Error('Sessions in unitialized');
    const { tokenObj } = req.body;
    const userData = await verifyAccessToken(tokenObj.id_token);
    if (!userData) throw new Error('Can\'t verify token');
    req.session.user = userData;
    console.log(req.session);
    res.cookie('session', JSON.stringify(userData));
    res.status(200).json({ userData });
  } catch(err) {
    res.status(403).json({ error: `Invalid access token. Error: ${err.message}` });
  }
});


app.post('/logout', async (req, res) => {
  try {
    if (!req.session) throw new Error('Sessions in unitialized');
    req.session.destroy((err) => { throw new Error(err) });
    res.status(200).json({ msg: 'Session finished' });
  } catch(err) {
    res.status(403).json({ error: `Invalid access token. Error: ${err.message}` });
  }
});

app.get('/check_session', async (req, res) => {
  console.log(req.session);
  res.json({ session: req.session });
});

app.post('/watch-account', async (req, res) => {
  const { accountId } = req.body;

  try {
    const response = await requestServiceAccountWatch(accountId);
    const responseJson = await response.json();
    res.json(responseJson);
  } catch(error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

  
server.listen(config.apiPort, () => {
  console.log(`API listening at http://localhost:${config.apiPort}`)
});