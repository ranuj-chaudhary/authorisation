// ENCRYPTION
// 1) using key to encript password (easy to decipher)
// 2) using aes256 encrypt and decrypt ()

// WHO CAN CRACK THIS PASSWORD
// 1) BRUTE FORCE ATTACKS
// 2) DICTIONARY ATTACKS

// WHERE IS WEAKNESS
// 1) less number of character in password
// 2) using most common and easy passwords and using mobile no
// 3) using weak algorithms (like MD5, SHA1)
// 4) vulnerable to collisions (where two different inputs produce the same hash)

// SOLUTION
// 1) Make password with more then 12 characters with mix of characters
// 2) Use strong hashing algorithms like bcrypt, Argon2, or PBKDF2
// 3) Always use salting to make each password hash unique
// 4) Use multi-factor authentication
// 5) Regularly update and patch your software

/*
Here are the key differences between encryption and hashing:

Reversibility:

Encryption is reversible; encrypted data can be decrypted using the correct key.
Hashing is one-way; once data is hashed, it cannot be reversed.
Purpose:

Encryption is used to protect data confidentiality (e.g., secure communication, file encryption).
Hashing is used for data integrity and verification (e.g., password storage, checksums).

Key Usage:
Encryption requires a key for both encryption and decryption.
Hashing does not use a key (except for HMAC, which uses a secret key for authentication).
Output Length:

Encrypted output varies in length based on input.
Hashed output is always a fixed length, regardless of input size.
Use Cases:

Encryption is used for securing files, emails, messages, and databases.
Hashing is used for password storage, file integrity checks, and digital signatures.
*/

import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import bcrypt from 'bcrypt';

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

// REQUESTS

// GET REQUESTS
app.get('/', (req, res) => {
  res.render('home.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/register', async (req, res) => {
  res.render('register.ejs');
});

// POST REQUESTS
app.post('/register', async (req, res) => {
  try {
    const { username: email, password } = req.body;

    const query = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    if (query.rows.length > 0) {
      res.send('Email Already exist.');
    } else {
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
    res.send('query failed', err.message);
  }
});

app.post('/login', async (req, res) => {
  const { username: email, password: inputPassword } = req.body;

  try {
    const query = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (query.rows.length == 1) {
      // GET HASH FROM DATABASE

      const queryHash = await db.query(
        'SELECT pass FROM users WHERE email = $1',
        [email]
      );
      const { pass: queryPassword } = queryHash.rows[0];

      // AUTHENTICATE PASSWORD WITH HASH
      const authenticated = bcrypt.compareSync(inputPassword, queryPassword);

      // GIVE ACCESS IF AUTHENTICATED
      if (authenticated) {
        res.render('secrets.ejs');
      } else {
        res.send(
          'You are not authorised to login check your password and try again.'
        );
      }
    } else {
      res.send('User not found.');
    }
  } catch (err) {
    console.log(err);
    res.send('query failed');
  }
});

// LISTEN TO PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
