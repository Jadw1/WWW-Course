import express from 'express';
import { Meme, MemesStorage } from './meme';
import csurf from 'csurf';

const mostExpensive = [
    {
        'id': 10,
        'name': 'Gold',
        'price': 1000,
        'url': 'https://i.redd.it/h7rplf9jt8y21.png'
    },
    {
        'id': 9,
        'name': 'Platinum',
        'price': 1100,
        'url': 'http://www.quickmeme.com/img/90/90d3d6f6d527a64001b79f4e13bc61912842d4a5876d17c1f011ee519d69b469.jpg'
    },
    {
        'id': 8,
        'name': 'Elite',
        'price': 1200,
        'url': 'https://i.imgflip.com/30zz5g.jpg'
    }
];

const app = express();
const storage = new MemesStorage();
const csrfProtection = csurf({cookie: true});

mostExpensive.forEach(m => {
    storage.addMeme(new Meme(m.id, m.name, m.price, m.url));
});

app.set('view engine', 'pug');
app.use(express.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.render('index', { title: 'Meme market', message: 'Hello there!', storage })
});

app.get('/meme/:memeId(\\d+)', csrfProtection, (req, res, next) => {
    const meme = storage.getMeme(parseInt(req.params.memeId, 10));
    if(!meme)
        next();
    res.render('meme', { title: 'Meme market', meme, csrfToken: req.csrfToken() });
 });

 app.post('/meme/:memeId(\\d+)', csrfProtection, (req, res, next) => {
    const meme = storage.getMeme(parseInt(req.params.memeId, 10));
    const price = req.body.price;
    const parsedPrice = parseInt(price, 10);
    if(isNaN(parsedPrice) || parsedPrice < 0)
        next();
    if(!meme)
        next();
    meme.setPrice(price);
    res.render('meme', { title: 'Meme market', meme, csrfToken: req.csrfToken() });
 });

 app.use((req, res) => {
     res.status(404);
     res.render('404');
 });

const server = app.listen(1500, () => {
    console.log(`App is running at http://localhost:1500/ in ${app.get('env')} mode`);
    console.log('Press Ctrl+C to stop.');
});