const express = require('express');
const app = express();
const User = require('./model/user');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoose = require('mongoose');
//mongoose connection
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/login',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
    .then(() => console.log('Connect to mongoose!!!'))
    .catch(() => console.log('mongoose connection error'));


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(session({ secret: 'NotAgoodSecret', resave: true, saveUninitialized: true }));
app.use(express.urlencoded({ extended: false }));

const requirelogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    next();
}

app.get('/', (req, res) => {
    res.send('THIS IS HOME PAGE BOY!!');
})

app.get('/secret', requirelogin, (req, res) => {
    res.render('secret');
})
app.get('/topsecret', requirelogin, (req, res) => {
    res.send('This is top secret friend');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    req.session.user_id = user._id;
    res.redirect('secret');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    }
    else {
        res.redirect('/login');
    }
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
})


app.listen(3000, () => {
    console.log('Serving on port 3000');
})
