const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { MongoClient } = require("mongodb");
const app = express();
const ejs = require("ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "mysecret", resave: false, saveUninitialized: true }));
app.set("view engine", "ejs");

const uri = 'mongodb://localhost:27017';
const dbName = 'furnitureDB';
const usersCollectionName = 'users';

async function connectToMongo() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB');
        return client;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

async function registerUser(username, password, usersCollection) {
    try {
        const existingUser = await usersCollection.findOne({ username });

        if (existingUser) {
            throw new Error("Username already exists. Please choose a different one.");
        }

        await usersCollection.insertOne({ username, password });
        console.log(`User ${username} registered successfully.`);
        return true;
    } catch (err) {
        console.error('Error registering user:', err);
        throw err;
    }
}



app.get("/forgot-password", function (req, res) {
    res.render("forgot-password");
});

app.post("/forgot-password", async function (req, res) {
    const { username } = req.body;

    try {
        const client = await connectToMongo();
        const db = client.db(dbName);
        const usersCollection = db.collection(usersCollectionName);

        const user = await usersCollection.findOne({ username });

        if (user) {
            // Here you can implement the logic for sending a password reset email.
            // For simplicity, let's just send a message indicating success.
            res.send("Password reset instructions sent to your email.");
        } else {
            res.send("User not found. Please check the entered username.");
        }
    } catch (err) {
        console.error('Error during forgot password:', err);
        res.send("Error processing forgot password request.");
    }
});



app.get("/delete", async function (req, res) {
    try {
        const client = await connectToMongo();
        const db = client.db(dbName);
        const usersCollection = db.collection(usersCollectionName);

        const usernameToDelete = req.session.userId;

        // Delete the user profile from the database
        await usersCollection.deleteOne({ username: usernameToDelete });

        // Destroy the session after deleting the profile
        req.session.destroy(function (err) {
            if (err) {
                console.error('Error destroying session:', err);
                res.send("Error deleting profile.");
            } else {
                res.redirect("/");
            }
        });
    } catch (err) {
        console.error('Error during profile deletion:', err);
        res.send("Error deleting profile.");
    }
});

app.get("/", function (req, res) {
    if (req.session && req.session.userId) {
        res.render("welcome", { username: req.session.userId });
    } else {
        res.render("login", { forgotPasswordLink: "/forgot-password" });
    }
});

app.post("/login", async function (req, res) {
    const inputid = req.body.username;
    const inputpass = req.body.password;

    try {
        const client = await connectToMongo();
        const db = client.db(dbName);
        const usersCollection = db.collection(usersCollectionName);

        const user = await usersCollection.findOne({
            username: { $regex: new RegExp("^" + inputid, "i") }, // Case-insensitive match
            password: inputpass,
        });

        if (user) {
            req.session.userId = user.username;
            res.redirect("/profile");
        } else {
            res.send("Invalid ID or password");
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.send("Error during login.");
    }
});

app.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
        res.redirect("/");
    });
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", async function (req, res) {
    const { username, password } = req.body;

    try {
        const client = await connectToMongo();
        const db = client.db(dbName);
        const usersCollection = db.collection(usersCollectionName);

        await registerUser(username, password, usersCollection);
        res.send("Registration successful! You can now <a href='/'>login</a>.");
    } catch (err) {
        res.send(`Error registering user: ${err.message}`);
    }
});

app.get("/profile", function (req, res) {
    if (req.session && req.session.userId) {
        res.render("profile", { username: req.session.userId });
    } else {
        res.redirect("/");
    }
});

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
