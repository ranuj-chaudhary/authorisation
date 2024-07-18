import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import axios, { isCancel, AxiosError } from "axios";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

const API_URL = "https://secrets-api.appbrewery.com";

//TODO 1: Fill in your values for the 3 types of auth.
const yourUsername = "ranuj";
const yourPassword = "123456";
const yourAPIKey = "500c588c-f363-4abf-a211-4c47fe5aa815";
const yourBearerToken = "cf3f4f68-9498-458a-a9e9-8a1354e58a7c";

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(__dirname + "/views"));

app.get("/", (req, res) => {
  res.render("auth.ejs", { content: "API response" });
});

app.get("/noAuth", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/random`);
    const result = response.data;

    res.render("auth.ejs", { content: JSON.stringify(result) });
  } catch (err) {
    console.log(`Problem fetching the data: ${err.message}`);
    res.render("auth.ejs", {
      error: `Error finding the data: ${err.message}}`,
    });
  }
});

app.get("/apiKey", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/filter?score=5`, {
      params: {
        apiKey: yourAPIKey,
      },
    });
    res.render("auth.ejs", { content: JSON.stringify(response.data) });
  } catch (err) {
    console.log(`Problem creating user: ${err.message}`);
    res.render("auth.ejs", {
      error: `User already exist try again with different credentials: ${err.message}}`,
    });
  }
});
app.get("/basicAuth", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/all?page=2`, {
      auth: {
        username: yourUsername,
        password: yourPassword,
      },
    });
    res.render("auth.ejs", { content: JSON.stringify(response.data) });
  } catch (err) {
    console.log(`Problem creating user: ${err.message}`);
    res.render("auth.ejs", {
      error: `User already exist try again with different credentials: ${err.message}}`,
    });
  }
});

app.get("/bearerToken", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/secrets/1`, {
      headers: {
        Authorization: `Bearer ${yourBearerToken}`,
      },
    });
    const result = response.data;

    res.render("auth.ejs", { content: JSON.stringify(result) });
  } catch (err) {
    console.log(`Problem Verifying Token: ${err.message}`);
    res.render("auth.ejs", {
      error: `You are not authorised to see data: ${err.message}}`,
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
