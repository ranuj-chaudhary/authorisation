import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

// SALTING AND HASING
const saltRounds = 10;
// CONNECT TO DATABASE
const { Client } = pg;

const db = new Client({
  user: "postgres",
  password: "123456",
  host: "localhost",
  port: 5432,
  database: "practice_authentication",
});

db.connect();

// SET UP SERVER
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// GET REQUESTS
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", async (req, res) => {
  res.render("register.ejs");
});

// POST REQUESTS
app.post("/register", async (req, res) => {
  try {
    const { username: email, password } = req.body;

    const query = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (query.rows.length > 0) {
      res.send("Email Already exist.");
    } else {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);

      const insertQuery = await db.query(
        "INSERT INTO users (email,pass) VALUES($1, $2)",
        [email, hash]
      );
      if (insertQuery.command === "INSERT") {
        res.render("secrets.ejs");
      } else {
        res.send("query failed");
      }
    }
  } catch (err) {
    res.send("query failed", err.message);
  }
});

app.post("/login", async (req, res) => {
  const { username: email, password: inputPassword } = req.body;

  try {
    const query = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (query.rows.length == 1) {
      // GET HASH FROM DATABASE
      const queryHash = await db.query(
        "SELECT pass FROM users WHERE email = $1",
        [email]
      );
     const { pass: queryPassword } = queryHash.rows[0];

    // AUTHENTICATE PASSWORD WITH HASH
     const authenticated = bcrypt.compareSync(inputPassword, queryPassword);
    
    // GIVE ACCESS IF AUTHENTICATED
      if (authenticated) {
        res.render("secrets.ejs");
      } else {
        res.send(
          "You are not authorised to login check your password and try again.",
            );
      }
    }
  } catch (err) {
    console.log(err);
    res.send("query failed");
  }
});

// LISTEN TO PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
