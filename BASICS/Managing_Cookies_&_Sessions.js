// Description:
// The most traditional method, where users provide a username and password.
// Security relies heavily on strong password policies and secure storage (hashing).
// Challenges:
// Vulnerable to password breaches, phishing, and brute-force attacks

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-local';
import bodyParser from 'body-parser';
import pg from 'pg';
import bcrypt from 'bcrypt';

// SALTING AND HASING
const saltRounds = 10;
// CONNECT TO DATABASE
const { Client } = pg;

const db = new Client({
  user: 'postgres',
  password: '123456',
  host: 'localhost',
  port: 5432,
  database: 'practice_authentication',
});

db.connect();

// SET UP SERVER
const app = express();
const port = 3000;

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// SETUP PASSPORT
// 1) create session middleware

app.use(
  session({
    secret: 'newsecret',
    resave: false,
    saveUninitialized: true,
  })
);

// 2) Initialise passport
app.use(passport.initialize());

// 3) Set up passport session (enable persistent login sessions)
app.use(passport.session());

// Passport Local Strategy
const LocalStrategy = Strategy;

// Note: use passport middleware
passport.use(
  new LocalStrategy(async function (username, password, cb) {
    // const { username: email, password: inputPassword } = req.body;
    try {
      const user = await db.query('SELECT * FROM users WHERE email = $1', [
        username,
      ]);

      if (user.rows.length == 1) {
        // GET HASH FROM DATABASE

        const queryHash = await db.query(
          'SELECT pass FROM users WHERE email = $1',
          [username]
        );
        const { pass: queryPassword } = queryHash.rows[0];

        // AUTHENTICATE PASSWORD WITH HASH
        const authenticated = bcrypt.compareSync(password, queryPassword);
        console.log(authenticated);

        // GIVE ACCESS IF AUTHENTICATED
        if (authenticated) {
          console.log('authenticated');
          return cb(null, user);
        } else {
          cb(null, false, {
            message:
              'You are not authorised to login check your password and try again.',
          });
        }
      } else {
        return cb(null, false);
      }
    } catch (err) {
      console.log(err);
      return cb(err);
    }
  })
);

// GET REQUESTS
app.get('/', (req, res) => {
  res.render('home.ejs');
});

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated) {
    res.render('secrets.ejs');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/register', async (req, res) => {
  res.render('register.ejs');
});

// POST REQUESTS
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/secrets',
    failureRedirect: '/login',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.post('/register', async (req, res) => {
  try {
    const { username: email, password } = req.body;

    const query = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    if (query.rows.length > 0) {
      res.send('Email Already exist.');
    } else {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);

      const insertQuery = await db.query(
        'INSERT INTO users (email,pass) VALUES($1, $2)',
        [email, hash]
      );
      if (insertQuery.command === 'INSERT') {
        res.render('secrets.ejs');
      } else {
        res.send('query failed');
      }
    }
  } catch (err) {
    // res.send('query failed', err.message);
    return cb(null, false, { message: 'Incorrect username or password.' });
  }
});

// Serialize & Deserialize User
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

// LISTEN TO PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
