import './src/meme';
import * as db from './src/database';
import { Meme, MemesStorage } from './src/meme';

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

async function main() {
    await db.dropTables().then(() => {
        console.log("Dropping tables if exist.");
    });
    console.log("lool ;-;");
    await db.createTables().then(() => {
        console.log("Creating tables.");
    });

    const storage = new MemesStorage();

    mostExpensive.forEach(m => {
        storage.addMeme(new Meme(m.id, m.name, m.price, m.url));
    });

    await db.addUser('user', 'user').then(() => {
        console.log("User added.");
    });

    await db.addUser('admin', 'admin').then(() => {
        console.log("User added.");
    });

    await db.authUser('test', 'wrong');
    await db.authUser('admin', 'admin');
}


(async() => {
    await main();
})();








