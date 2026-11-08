
const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// File locations
const dataFolder = path.join(__dirname, "data");
const usersFolder = path.join(dataFolder, "users");
const accountsFile = path.join(dataFolder, "accounts.json");

// Create storage folders if they don't exist
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

if (!fs.existsSync(usersFolder)) {
    fs.mkdirSync(usersFolder);
}

if (!fs.existsSync(accountsFile)) {
    fs.writeFileSync(accountsFile, "[]");
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "survey-project-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax"
    }
}));

// Serve CSS and JavaScript
app.use("/public", express.static(path.join(__dirname, "public")));

// Website pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/create-account.html", (req, res) => {
    res.sendFile(path.join(__dirname, "create-account.html"));
});

app.get("/form.html", (req, res) => {
    res.sendFile(path.join(__dirname, "form.html"));
});

app.get("/records.html", (req, res) => {
    res.sendFile(path.join(__dirname, "records.html"));
});

// Read account list
function readAccounts() {
    return JSON.parse(fs.readFileSync(accountsFile, "utf8"));
}

// Account creation
app.post("/api/create-account", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password || !username.trim() || !password.trim()) {
        return res.status(400).json({
            message: "Username and password are required."
        });
    }

    const accounts = readAccounts();

    // Check for duplicate usernames
    if (accounts.some(account => account.username === username.trim())) {
        return res.status(409).json({
            message: "That username is already taken."
        });
    }

    // Generate a unique account ID
    let id;

    do {
        id = String(Math.floor(10000 + Math.random() * 90000));
    } while (accounts.some(account => account.accountFile === `users/${id}.json`));

    const accountFile = `users/${id}.json`;

    // Create individual account file
    const userData = {
        id: id,
        username: username.trim(),
        formData: null
    };

    fs.writeFileSync(
        path.join(usersFolder, `${id}.json`),
        JSON.stringify(userData, null, 4)
    );

    // Add account to account list
    accounts.push({
        username: username.trim(),
        password: password,
        accountFile: accountFile
    });

    fs.writeFileSync(accountsFile, JSON.stringify(accounts, null, 4));

    res.json({
        message: "Account created successfully!",
        id: id
    });
});

// Login
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    const accounts = readAccounts();

    const account = accounts.find(
        account =>
            account.username === username &&
            account.password === password
    );

    if (!account) {
        return res.status(401).json({
            message: "Incorrect username or password."
        });
    }

    const id = path.basename(account.accountFile, ".json");

    req.session.accountId = id;

    res.json({
        message: "Login successful!",
        id: id
    });
});

// Check currently logged-in account
app.get("/api/me", (req, res) => {
    if (!req.session.accountId) {
        return res.status(401).json({
            message: "Not logged in."
        });
    }

    res.json({
        id: req.session.accountId
    });
});

// Load the logged-in user's survey
app.get("/api/form", (req, res) => {
    if (!req.session.accountId) {
        return res.status(401).json({
            message: "Please log in."
        });
    }

    const id = req.session.accountId;
    const userFile = path.join(usersFolder, `${id}.json`);

    if (!fs.existsSync(userFile)) {
        return res.status(404).json({
            message: "Account not found."
        });
    }

    const userData = JSON.parse(fs.readFileSync(userFile, "utf8"));

    res.json({
        formData: userData.formData
    });
});

// Save the logged-in user's survey
app.post("/api/form", (req, res) => {
    if (!req.session.accountId) {
        return res.status(401).json({
            message: "Please log in."
        });
    }

    const id = req.session.accountId;
    const userFile = path.join(usersFolder, `${id}.json`);

    if (!fs.existsSync(userFile)) {
        return res.status(404).json({
            message: "Account not found."
        });
    }

    const userData = JSON.parse(fs.readFileSync(userFile, "utf8"));

    // Save every submitted survey field
    userData.formData = {
        name: req.body.name ?? "",
        age: req.body.age ?? "",
        color: req.body.color ?? "",
        platform: req.body.platform ?? "",
        hours: req.body.hours ?? "",
        about: req.body.about ?? ""
    };

    fs.writeFileSync(userFile, JSON.stringify(userData, null, 4));

    res.json({
        message: "Survey saved successfully."
    });
});

// Get all account IDs and their survey responses
app.get("/api/records", (req, res) => {
    if (!req.session.accountId) {
        return res.status(401).json({
            message: "Please log in."
        });
    }

    const accounts = readAccounts();
    const records = [];

    accounts.forEach(account => {
        const id = path.basename(account.accountFile, ".json");
        const userFile = path.join(usersFolder, `${id}.json`);

        if (fs.existsSync(userFile)) {
            const userData = JSON.parse(fs.readFileSync(userFile, "utf8"));

            records.push({
                id: userData.id,
                formData: userData.formData
            });
        }
    });

    res.json({ records: records });
});

// Start server
app.listen(PORT, () => {
    console.log(`Survey website running at http://localhost:${PORT}`);
});
