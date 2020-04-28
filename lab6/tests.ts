import { expect } from 'chai';
import { driver, Key } from 'mocha-webdriver';

const filePath = 'file:///home/jadw1/MIM/WWW/WWW-Course/lab6/index.html';

function getTodayDate(): string {
    const today = new Date(Date.now());
    return today.getFullYear() + '-' + today.getMonth() + '-' + today.getDay();
}

function getTimePlusMinutes(addMinutes: number = 0): string {
    const now = new Date(Date.now());

    const addHours = (addMinutes > 0) ? Math.floor(addMinutes/60) : Math.ceil(addMinutes/60);
    let hours = now.getHours() + addHours
    let minutes = now.getMinutes() + (addMinutes - addHours * 60);
    if(minutes >= 60) {
        minutes -= 60;
        hours += 1;
    }
    else if(minutes < 0) {
        minutes += 60;
        hours -= 1;
    }
    return hours + ':' + minutes;
}

describe('test submit button', function() {
    it('should be disabled initially', async function() {
        this.timeout(20000);

        await driver.get(filePath);

        expect(await (await driver.find('#submitButton')).getAttribute("disabled")).to.not.be.null;
    });

    it('should be disabled if all form isn\'t filled', async function() {
        this.timeout(20000);

        await driver.get(filePath);

        await driver.find('#name').sendKeys('Test');
        await driver.find('#surname').sendKeys('Testowy');
        await driver.find('#from').sendKeys(Key.ARROW_DOWN);
        await driver.find('#from').sendKeys(Key.RETURN);

        expect(await (await driver.find('#submitButton')).getAttribute("disabled")).to.not.be.null;
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

        expect(await (await driver.find('#submitButton')).getAttribute("disabled")).to.not.be.null;
    });

    it('should be enabled', async function() {
        this.timeout(20000);

        await driver.get(filePath);


        await driver.find('#name').sendKeys('Test');
        await driver.find('#surname').sendKeys('Testowy');
        await driver.find('#from').sendKeys(Key.ARROW_DOWN);
        await driver.find('#from').sendKeys(Key.RETURN);
        await driver.find('#to').sendKeys(Key.ARROW_DOWN);
        await driver.find('#to').sendKeys(Key.ARROW_DOWN);
        await driver.find('#to').sendKeys(Key.RETURN);
        await driver.find('#when').sendKeys(getTodayDate());
        await driver.find('#when-time').sendKeys(getTimePlusMinutes(5));

        expect(await (await driver.find('#submitButton')).getAttribute("disabled")).to.be.equal('true');
    });
});

describe('test overlay', function() {
    it('should not be visible by default', async function() {
        this.timeout(2000);

        await driver.get(filePath);

        expect(await (await driver.find('.confirmation')).getCssValue('display')).to.be.equal('none');
    });

    it('should be visible', async function() {
        this.timeout(2000);

        await driver.get(filePath);

        await driver.find('#name').sendKeys('Test');
        await driver.find('#surname').sendKeys('Testowy');
        await driver.find('#from').sendKeys(Key.ARROW_DOWN);
        await driver.find('#from').sendKeys(Key.RETURN);
        await driver.find('#to').sendKeys(Key.ARROW_DOWN);
        await driver.find('#to').sendKeys(Key.ARROW_DOWN);
        await driver.find('#to').sendKeys(Key.RETURN);
        await driver.find('#when').sendKeys(getTodayDate());
        await driver.find('#when-time').sendKeys(getTimePlusMinutes(5));
        await (await driver.find('#submitButton')).doClick();

        // expect(await (await driver.find('.confirmation')).getCssValue('display')).to.be.equal('block');

        expect(await (await driver.find('.confirmation')).getCssValue('display') === 'block');
    });

    it('checking overlay text', async function() {
        this.timeout(2000);

        const name = "Test";
        const surname = "Testowy";
        const when = getTodayDate();
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


        expect(await (await driver.find('.confirmation')).getCssValue('display') === 'block');
        expect(await (await driver.find('#info')).getText()).to.include('Imię: ' + name);
        expect(await (await driver.find('#info')).getText()).to.include('Nazwisko: ' + surname);
        expect(await (await driver.find('#info')).getText()).to.include('Imię: ' + name);
        expect(await (await driver.find('#info')).getText()).to.include('Z: lodz');
        expect(await (await driver.find('#info')).getText()).to.include('Do: katowice');
        expect(await (await driver.find('#info')).getText()).to.include('Kiedy: ' + when);
        expect(await (await driver.find('#info')).getText()).to.include('O której: ' + time);
    });
});