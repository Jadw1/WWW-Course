export class Meme {
    id: number;
    name: string;
    price: number;
    url: string;
    pricesHistory: number[];

    constructor(id: number, name: string, price: number, url: string) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.url = url;
        this.pricesHistory = [];
    }

    setPrice(price: number) {
        this.pricesHistory.push(this.price);
        this.price = price;
    }
}

export class MemesStorage {
    memes: Meme[];

    constructor() {
        this.memes = [];
    }

    addMeme(meme: Meme) {
        this.memes.push(meme);
    }

    addMemes(memes: Meme[]) {
        this.memes = this.memes.concat(memes);
    }

    getTop3(): Meme[] {
        const sorted = this.memes.sort((m1, m2) => {
            return m1.price > m2.price ? -1 : 1;
        });

        return sorted.slice(0, 3);
    }

    getMeme(id: number): Meme {
        let result: Meme = null;
        this.memes.forEach(meme => {
            if(meme.id === id) {
                result = meme;
            }
        });

        return result;
    }
}