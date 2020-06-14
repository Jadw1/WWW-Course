import express from 'express';
import { Meme, MemesStorage } from './meme';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import * as db from './database'
import session from 'express-session'
const connectSqlite = require('connect-sqlite3');

const SqliteStore = connectSqlite(session);
const app = express();
const storage = new MemesStorage();
const csrfProtection = csurf({cookie: true});
const secret = 'tajny sekret';


app.use(cookieParser(secret));
app.use(session({
    secret,
    cookie: {maxAge: 15*60*1000},
    resave: false,
    saveUninitialized: true,
    store: new SqliteStore()
}));
app.set('view engine', 'pug');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use((req, res, next) => {
    if(!req.session?.views) {
        req.session.views = {};
    }
    req.session.views[req.path] = (req.session.views[req.path] || 0) + 1;
    next();
});

app.get('/', (req, res) => {
    storage.getTop3().then(top => {
        console.log(req.session.username);
        res.render('index', { title: 'Meme market', message: 'Hello there!', top3: top, username: req.session.username });
    });
});

app.get('/meme/:memeId(\\d+)', csrfProtection, (req, res, next) => {
    storage.getMeme(parseInt(req.params.memeId, 10)).then(meme => {
        if(!meme)
            next();

        meme.getPricesHistory().then(history => {
            res.render('meme', { title: 'Meme market', meme, history, username: req.session.username, csrfToken: req.csrfToken() });
        });
    });
 });

 app.post('/meme/:memeId(\\d+)', csrfProtection, async (req, res, next) => {
    const meme = await storage.getMeme(parseInt(req.params.memeId, 10));
    const price = req.body.price;
    const parsedPrice = parseInt(price, 10);
    const user = req.session.username;

    if(isNaN(parsedPrice) || parsedPrice < 0 || user === undefined)
        next();
    if(!meme)
        next();
    await meme.setPrice(price, user);

    meme.getPricesHistory().then(history => {
        res.render('meme', { title: 'Meme market', meme, history, username: req.session.username, csrfToken: req.csrfToken() });
    });
 });

 app.get('/login', csrfProtection, (req, res) => {
     res.render('login', { title: 'Meme market', csrfToken: req.csrfToken() });
 });

 app.post('/login', csrfProtection, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.authUser(username, password).then(correct => {
        if(correct) {
            req.session.regenerate(err => {
                if(err) {
                    res.render('login', { title: 'Meme market', errorMsg: err, csrfToken: req.csrfToken() });
                    return;
                }

                req.session.username = username;
                res.redirect('/');
            });
        }
        else {
            res.render('login', { title: 'Meme market', errorMsg: 'invalid pass', csrfToken: req.csrfToken() });
        }
    }, err => {
        res.render('login', { title: 'Meme market', errorMsg: err, csrfToken: req.csrfToken() });
    }).catch(err => {
        res.render('login', { title: 'Meme market', errorMsg: err, csrfToken: req.csrfToken() });
    })
 });

 app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.error(err);
        }
        res.redirect('/');
    });
 });

 app.use((req, res) => {
     res.status(404);
     res.render('404');
 });

const server = app.listen(1500, () => {
    console.log(`App is running at http://localhost:1500/ in ${app.get('env')} mode`);
    console.log('Press Ctrl+C to stop.');
});