import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


// SALTING AND HASING



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
      // GENERATE HASH FOR PASSWORD
 

        const insertQuery = db.query(
          "INSERT INTO users (email,pass) VALUES($1, $2)",
          [email, hash]
        );
        if (insertQuery.command === "INSERT") {
          res.render("secrets.ejs");
        }
     
    }
  } catch (err) {
    res.send("query failed", err.message);
  }
});

app.post("/login", async (req, res) => {
  const { username: email, password } = req.body;
  try {
    const query = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    console.log(query);
    if (query.rows.length == 1) {
      res.render("secrets.ejs");
    } else {
      res.send("You are not authorised to login register to login.");
    }
  } catch (err) {
    res.send("query failed", err.message);
  }
});

// LISTEN TO PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
