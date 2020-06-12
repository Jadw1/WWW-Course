import express from 'express';
import { Meme, MemesStorage } from './meme';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';

const app = express();
const storage = new MemesStorage();
const csrfProtection = csurf({cookie: true});

app.set('view engine', 'pug');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    storage.getTop3().then(top => {
        res.render('index', { title: 'Meme market', message: 'Hello there!', top3: top });
    });
});

app.get('/meme/:memeId(\\d+)', csrfProtection, (req, res, next) => {
    storage.getMeme(parseInt(req.params.memeId, 10)).then(meme => {
        if(!meme)
            next();

        meme.getPricesHistory().then(history => {
            res.render('meme', { title: 'Meme market', meme, history, csrfToken: req.csrfToken() });
        });
    });
 });

 app.post('/meme/:memeId(\\d+)', csrfProtection, async (req, res, next) => {
    const meme = await storage.getMeme(parseInt(req.params.memeId, 10));
    const price = req.body.price;
    const parsedPrice = parseInt(price, 10);
    if(isNaN(parsedPrice) || parsedPrice < 0)
        next();
    if(!meme)
        next();
    await meme.setPrice(price);

    meme.getPricesHistory().then(history => {
        res.render('meme', { title: 'Meme market', meme, history, csrfToken: req.csrfToken() });
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