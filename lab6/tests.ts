import { expect } from 'chai';
import { driver, Key } from 'mocha-webdriver';

const filePath = 'file:///home/jadw1/MIM/WWW/WWW-Course/lab6/index.html';

function getTodayDate(addDays: number = 0): string {
    const today = new Date(Date.now());
    today.setDate(today.getDate() + addDays);
    return today.toISOString().split('T')[0];
}

async function fillValidInput(name: string = 'Test', surname: string = 'Testowy', when: string = getTodayDate(1)) {
    await driver.find('#name').sendKeys(name);
    await driver.find('#surname').sendKeys(surname);
    await driver.find('#from').sendKeys(Key.ARROW_DOWN);
    await driver.find('#from').sendKeys(Key.RETURN);
    await driver.find('#to').sendKeys(Key.ARROW_DOWN);
    await driver.find('#to').sendKeys(Key.ARROW_DOWN);
    await driver.find('#to').sendKeys(Key.RETURN);
    await driver.find('#when').sendKeys(when);
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
        await driver.find('#when').sendKeys(getTodayDate(-5));

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
        await driver.find('#submitButton').doClick();

        expect(await driver.find('.confirmation').getCssValue('display')).to.be.equal('block');
    });

    it('checking overlay text', async function() {
        this.timeout(2000);

        const name = "checking";
        const surname = "overlay";
        const when = getTodayDate(4);

        await driver.get(filePath);

        await fillValidInput(name, surname, when);
        await driver.find('#submitButton').doClick();

        const infoText = await driver.find('#info').then(e => e.getText());

        expect(infoText).to.include('Imię: ' + name);
        expect(infoText).to.include('Nazwisko: ' + surname);
        expect(infoText).to.include('Z: lodz');
        expect(infoText).to.include('Do: katowice');
        expect(infoText).to.include('Kiedy: ' + when);
    });

    it('checking if links under overlay can be clicked', async function() {
        this.timeout(2000);
        const navLinkSelector = 'body > div.grid-container > nav > ul > li:nth-child(1) > a';
        const tableLinkSelector = '#loty_tabelka > tbody > tr:nth-child(2) > td:nth-child(1) > a';

        await driver.get(filePath);

        await fillValidInput();
        await driver.find('#submitButton').doClick();

        expect(await driver.find(navLinkSelector).click().then(() => false).catch(error => true)).to.equal(true);
        expect(await driver.find(tableLinkSelector).click().then(() => false).catch(error => true)).to.equal(true);
    });
});