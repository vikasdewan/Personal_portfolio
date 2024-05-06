if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const port = process.env.PORT || 3000;
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require("body-parser");

app.set("port", port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/send_email", (req, res) => {
    let { name, email, subject, msg } = req.body;

    const transpoter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'dewanganvikas192@gmail.com',
            pass: process.env.NODEMAILER_PASS,
        }
    });

    let mailOptions = {
        from: 'dewanganvikas192@gmail.com',
        to: email,
        cc: 'dewanganvikas192@gmail.com', // <-- Check this email address
        subject: "Thank you for giving feedback, " + name,
        text: "Thank you for your message: " + msg,
    };

    transpoter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending email:", err);
            req.flash("error", "Failed to send message. Please try again later.");
        } else {
            console.log("Email sent successfully:", info.response);
            req.flash("success", "Message sent successfully.");
        }
        
    });

    res.redirect("/");
});

app.listen(port, () => {
    console.log("App is listening on port: " + port);
});
