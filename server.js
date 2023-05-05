if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require("express")
const path = require("path")
const bcrypt = require("bcrypt")
const passport = require('passport')
const passportLocalStrategyInit = require('./passportConfig');
const session = require('express-session')
const flashMsg = require('express-flash')

const app = express();
const PORT = process.env.PORT;

const users = []

passportLocalStrategyInit (
    passport,
    (email) => users.find((user) => user.email === email),
    (id) => users.find((user) => user.id === id)
)

app.use(flashMsg());

app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(express.urlencoded({extended : false}))

app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-validate');
    next();
})

app.post('/login', passport.authenticate("local", {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true    
}))

app.post('/register', async (req, res) => {
    try {
        const encryptedPassword = await bcrypt.hash(req.body.password, 6)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: encryptedPassword
        })
        console.log(users)
        res.redirect('/login')
    } catch (error) {
        console.log(error);
        res.redirect('/register')
    }
})


app.get('/', checkNotAuthenticated, (req, res) => {
    res.render("home.ejs")
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})

app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render("dashboard.ejs", {
        username: req.user.name
    })
})

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/')
    })
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/dashboard')
    }
    next()
}

app.listen(PORT, ()=> {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
})
