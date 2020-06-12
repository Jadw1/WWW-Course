import * as db from './database';

function infoToMeme(info: db.MemeInfo): Meme {
    const meme = new Meme(info.id, info.title, info.price, info.url);
    return meme;
}

export class Meme {
    id: number;
    name: string;
    price: number;
    url: string;

    constructor(id: number, name: string, price: number, url: string) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.url = url;
    }

    setPrice(price: number): Promise<void> {
        return db.addMemePrice(this.id, price).then(() => {
            this.price = price;
        });
    }

    getPricesHistory(): Promise<number[]> {
        return db.getMemePriceHistory(this.id).then((history: number[]) => {
            history.shift();
            return history;
        });
    }
}

export class MemesStorage {
    addMeme(meme: Meme): Promise<void> {
        return db.addMeme(meme).then(() => {
            db.addMemePrice(meme.id, meme.price);
        });
    }

    getTop3(): Promise<Meme[]> {
        return db.getBestN(3).then((memes: db.MemeInfo[]) => {
            return memes.map(meme => infoToMeme(meme));
        });
    }

    getMeme(id: number): Promise<Meme> {
        return db.getMeme(id).then((meme: db.MemeInfo) => {
            return infoToMeme(meme);
        });
    }
}