import 'mocha';
import { expect } from 'chai';
import { Meme, MemesStorage } from '../src/meme';
import { strict } from 'assert';

describe('Meme test', () => {

    it('should update actial price', () => {
        const initPrice = 123;
        const meme = new Meme(1, 'test', initPrice, 'url');

        expect(meme.price).to.equal(initPrice);

        const newPrice = 321;
        meme.setPrice(newPrice);

        expect(meme.price).to.equal(newPrice);
    });

    it('should add old price to history', () => {
        const initPrice = 123;
        const meme = new Meme(1, 'test', initPrice, 'url');

        const newPrice = 321;
        meme.setPrice(newPrice);

        expect(meme.pricesHistory[meme.pricesHistory.length - 1]).to.equal(initPrice);

        const newerPrice = 1000;
        meme.setPrice(newerPrice);
        expect(meme.pricesHistory[meme.pricesHistory.length - 1]).to.equal(newPrice);
    })
});

function checkStoregeGet(storege: MemesStorage, id: number) {
    expect(storege.getMeme(id).id).to.equal(id);
}

describe('MemeStorage test', () => {

    it('should return meme with given id', () => {
        const storage = new MemesStorage();

        storage.addMeme(new Meme(1, 'meme1', 1, 'url'));
        storage.addMeme(new Meme(2, 'meme2', 1, 'url'));
        storage.addMeme(new Meme(3, 'meme3', 1, 'url'));
        storage.addMeme(new Meme(4, 'meme4', 1, 'url'));
        storage.addMeme(new Meme(5, 'meme5', 1, 'url'));

        checkStoregeGet(storage, 1);
        checkStoregeGet(storage, 3);
        checkStoregeGet(storage, 4);
    });

    it('should return best 3 memes', () => {
        const storage = new MemesStorage();

        storage.addMeme(new Meme(1, 'third', 300, 'url'));
        storage.addMeme(new Meme(2, 'meme2', 1, 'url'));
        storage.addMeme(new Meme(3, 'best', 1000, 'url'));
        storage.addMeme(new Meme(4, 'meme4', 100, 'url'));
        storage.addMeme(new Meme(5, 'second', 500, 'url'));

        const bests = storage.getTop3();

        expect(bests[0].id).to.equal(3);
        expect(bests[1].id).to.equal(5);
        expect(bests[2].id).to.equal(1);
    });
});

describe('MemeStorage with less then 3 elements', () => {

    it('should return empty list', () => {
        const storage = new MemesStorage();
        const bests = storage.getTop3();

        expect(bests.length).to.equal(0);
    });

    it('should return 1 meme', () => {
        const storage = new MemesStorage();

        storage.addMeme(new Meme(1, 'meme1', 1, 'url'));

        const bests = storage.getTop3();

        expect(bests.length).to.equal(1);
        expect(bests[0].id).to.equal(1);
    });

    it('should return 2 memes in correct order', () => {
        const storage = new MemesStorage();

        storage.addMeme(new Meme(1, 'meme1', 1, 'url'));
        storage.addMeme(new Meme(2, 'meme2', 1000, 'url'));

        const bests = storage.getTop3();

        expect(bests.length).to.equal(2);
        expect(bests[0].id).to.equal(2);
        expect(bests[1].id).to.equal(1);
    });
})