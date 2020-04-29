let submitButton = document.getElementById("submitButton");

function wait(miliseconds: number): Promise<number> {
    return new Promise((resolve, reject) => {
        window.setTimeout(() => {resolve();}, miliseconds)
    });
}

function colorChanger(el: HTMLElement) {
    const green = () => {
        el.style.backgroundColor = 'green';
        return wait(1000).then(chartreuse);
    }
    const chartreuse = () => {
        el.style.backgroundColor = 'chartreuse';
        return wait(1000).then(green);
    }

    green();
}

colorChanger(submitButton);

// ==== FORM VALIDATION ====
function getCurrentTime(): number {
    const now = new Date(Date.now());
    let time = 0;

    time += now.getHours() * 3600000;
    time += now.getMinutes() * 60000;
    return time;
}

function validateInputField(field: HTMLInputElement): boolean {
    return field.value.trim().length > 0;
}

function validateDateField(field: HTMLInputElement): boolean {
    const val = field.valueAsNumber;
    return val != null && ((val - Date.now()) >= 0);
}

function validateTimeField(field: HTMLInputElement): boolean {
    return true;
    const val = field.valueAsNumber;
    return val != null && ((val - getCurrentTime()) > 0);
}

function validateDestinations(from: HTMLInputElement, to: HTMLInputElement): boolean {
    const fromStr = from.value;
    const toStr = to.value;
    return fromStr !== toStr;
}

function validateForm(): boolean {
    const name = document.getElementById("name") as HTMLInputElement;
    const surname = document.getElementById("surname") as HTMLInputElement;
    const from = document.getElementById("from") as HTMLInputElement;
    const to = document.getElementById("to") as HTMLInputElement;
    const date = document.getElementById("when") as HTMLInputElement;
    const time = document.getElementById("when-time") as HTMLInputElement;

    return validateInputField(name) && validateInputField(surname) &&
        validateDestinations(from, to) && validateDateField(date) && validateTimeField(time);
}

function setButtonStatus() {
    if(validateForm()) {
        submitButton.removeAttribute('disabled');
    }
    else {
        submitButton.setAttribute('disabled', '');
    }
}

// ==== OVERLAY ====
function setOverlayInfo() {
    const name = (document.getElementById("name") as HTMLInputElement).value;
    const surname = (document.getElementById("surname") as HTMLInputElement).value;
    const from = (document.getElementById("from") as HTMLInputElement).value;
    const to = (document.getElementById("to") as HTMLInputElement).value;
    const date = (document.getElementById("when") as HTMLInputElement).value;
    const time = (document.getElementById("when-time") as HTMLInputElement).value;

    let info = document.getElementById("info") as HTMLDivElement;
    info.innerHTML = `Imię: ${name}<br>Nazwisko: ${surname}<br>Z: ${from}<br>Do: ${to}<br>Kiedy: ${date}<br>O której: ${time}`;
}

function setOverlayVisibility(visible: boolean) {
    const displayStyle = (visible) ? "block" : "none";

    let overlay = document.querySelector(".confirmation") as HTMLDivElement;
    overlay.style.display = displayStyle;

    if(visible) {
        setOverlayInfo();
    }
}

function submitFunction(event: Event) {
    if(validateForm()) {
        setOverlayVisibility(true);
    }
    else {
        setButtonStatus();
    }
    event.preventDefault();
}


const form = document.getElementById("reserveForm");
form.addEventListener('input', setButtonStatus);
form.addEventListener('submit', submitFunction);

setButtonStatus();
setOverlayVisibility(false);
