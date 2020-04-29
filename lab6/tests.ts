import { expect } from 'chai';
import { driver, Key } from 'mocha-webdriver';

const filePath = 'file:///home/jadw1/MIM/WWW/WWW-Course/lab6/index.html';

function getTodayDate(addDays: number = 0): string {
    const today = new Date(Date.now());
    today.setDate(today.getDate() + addDays);
    return today.toISOString().split('T')[0];
}

function getTimePlusMinutes(addMinutes: number = 0): string {
    const today = new Date(Date.now());
    today.setTime(today.getTime() + 60000 * addMinutes);
    return today.toISOString().split('T')[1];
}

async function fillValidInput() {
    await driver.find('#name').sendKeys('Test');
    await driver.find('#surname').sendKeys('Testowy');
    await driver.find('#from').sendKeys(Key.ARROW_DOWN);
    await driver.find('#from').sendKeys(Key.RETURN);
    await driver.find('#to').sendKeys(Key.ARROW_DOWN);
    await driver.find('#to').sendKeys(Key.ARROW_DOWN);
    await driver.find('#to').sendKeys(Key.RETURN);
    await driver.find('#when').sendKeys(getTodayDate(1));
    await driver.find('#when-time').sendKeys(getTimePlusMinutes(5));
}


describe('test submit button', function() {
    it('should be disabled initially', async function() {
        this.timeout(20000);

        await driver.get(filePath);

        expect(await driver.find('#submitButton').getAttribute("disabled")).to.not.be.null;
    });

    it('should be disabled if all form isn\'t filled', async function() {
        this.timeout(20000);

        await driver.get(filePath);

        await driver.find('#name').sendKeys('Test');
        await driver.find('#surname').sendKeys('Testowy');
        await driver.find('#from').sendKeys(Key.ARROW_DOWN);
        await driver.find('#from').sendKeys(Key.RETURN);

        expect(await driver.find('#submitButton').getAttribute("disabled")).to.not.be.null;
    });

    it('should be disabled if data is invalid', async function() {
        this.timeout(20000);

        await driver.get(filePath);


        await driver.find('#name').sendKeys('Test');
        await driver.find('#surname').sendKeys('Testowy');
        await driver.find('#from').sendKeys(Key.ARROW_DOWN);
        await driver.find('#from').sendKeys(Key.RETURN);
        await driver.find('#to').sendKeys(Key.ARROW_DOWN);
        await driver.find('#to').sendKeys(Key.RETURN);
        await driver.find('#when').sendKeys(getTodayDate());
        await driver.find('#when-time').sendKeys(getTimePlusMinutes(-60));

        expect(await driver.find('#submitButton').getAttribute("disabled")).to.not.be.null;
    });

    it('should be enabled', async function() {
        this.timeout(20000);

        await driver.get(filePath);

        await fillValidInput();

        expect(await driver.find('#submitButton').getAttribute("disabled")).to.be.null;
    });
});

describe('test overlay', function() {
    it('should not be visible by default', async function() {
        this.timeout(2000);

        await driver.get(filePath);

        expect(await driver.find('.confirmation').getCssValue('display')).to.be.equal('none');
    });

    it('should be visible', async function() {
        this.timeout(2000);

        await driver.get(filePath);

        await fillValidInput();

        expect(await driver.find('#submitButton').getAttribute("disabled")).to.be.null;
        await (await driver.find('#submitButton')).doClick();

        expect(await driver.find('.confirmation').getCssValue('display')).to.be.equal('block');
    });

    /*it('checking overlay text', async function() {
        this.timeout(2000);

        const name = "Test";
        const surname = "Testowy";
        const when = getTodayDate(1);
        const time = getTimePlusMinutes(20);

        await driver.get(filePath);

        await driver.find('#name').sendKeys(name);
        await driver.find('#surname').sendKeys(surname);
        await driver.find('#from').sendKeys(Key.ARROW_DOWN);
        await driver.find('#from').sendKeys(Key.RETURN);
        await driver.find('#to').sendKeys(Key.ARROW_DOWN);
        await driver.find('#to').sendKeys(Key.ARROW_DOWN);
        await driver.find('#to').sendKeys(Key.RETURN);
        await driver.find('#when').sendKeys(when);
        await driver.find('#when-time').sendKeys(time);
        await (await driver.find('#submitButton')).doClick();

        expect(await driver.find('.confirmation').getCssValue('display')).to.be.equal('block');
        expect(await driver.find('#info').getText()).to.include('Imię: ' + name);
        expect(await driver.find('#info').getText()).to.include('Imię: ' + name);
        expect(await driver.find('#info').getText()).to.include('Nazwisko: ' + surname);
        expect(await driver.find('#info').getText()).to.include('Imię: ' + name);
        expect(await driver.find('#info').getText()).to.include('Z: lodz');
        expect(await driver.find('#info').getText()).to.include('Do: katowice');
        expect(await driver.find('#info').getText()).to.include('Kiedy: ' + when);
        expect(await driver.find('#info').getText()).to.include('O której: ' + time.split('.')[0]);
    });

    it('checking if links under overlay can be clicked', async function() {
        this.timeout(2000);

        const name = "Test";
        const surname = "Testowy";
        const when = getTodayDate(1);
        const time = getTimePlusMinutes(20);

        await driver.get(filePath);

        await driver.find('#name').sendKeys(name);
        await driver.find('#surname').sendKeys(surname);
        await driver.find('#from').sendKeys(Key.ARROW_DOWN);
        await driver.find('#from').sendKeys(Key.RETURN);
        await driver.find('#to').sendKeys(Key.ARROW_DOWN);
        await driver.find('#to').sendKeys(Key.ARROW_DOWN);
        await driver.find('#to').sendKeys(Key.RETURN);
        await driver.find('#when').sendKeys(when);
        await driver.find('#when-time').sendKeys(time);
        await driver.find('#submitButton').doClick();

        const selector = 'body > div.grid-container > nav > ul > li:nth-child(1) > a';

        expect(await driver.find('.confirmation').getCssValue('display')).to.be.equal('block');
        expect(await driver.find(selector).click().then(() => false).catch(error => true)).to.equal(true);
    });*/
});