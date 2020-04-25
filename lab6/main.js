var submitButton = document.getElementById("submitButton");
function wait(miliseconds) {
    return new Promise(function (resolve, reject) {
        window.setTimeout(function () { resolve(); }, miliseconds);
    });
}
function colorChanger(el) {
    var green = function () {
        el.style.backgroundColor = 'green';
        return wait(1000).then(chartreuse);
    };
    var chartreuse = function () {
        el.style.backgroundColor = 'chartreuse';
        return wait(1000).then(green);
    };
    green();
}
colorChanger(submitButton);
// ==== FORM VALIDATION ====
function getCurrentTime() {
    var now = new Date(Date.now());
    var time = 0;
    time += now.getHours() * 3600000;
    time += now.getMinutes() * 60000;
    return time;
}
function validateInputField(field) {
    return field.value.trim().length > 0;
}
function validateDateField(field) {
    var val = field.valueAsNumber;
    return val != null && ((val - Date.now()) >= 0);
}
function validateTimeField(field) {
    var val = field.valueAsNumber;
    return val != null && ((val - getCurrentTime()) > 0);
}
function validateDestinations(from, to) {
    var fromStr = from.value;
    var toStr = to.value;
    return fromStr !== toStr;
}
function validateForm() {
    var name = document.getElementById("name");
    var surname = document.getElementById("surname");
    var from = document.getElementById("from");
    var to = document.getElementById("to");
    var date = document.getElementById("when");
    var time = document.getElementById("when-time");
    return validateInputField(name) && validateInputField(surname) &&
        validateDestinations(from, to) && validateDateField(date) && validateTimeField(time);
}
function setButtonStatus() {
    if (validateForm()) {
        submitButton.removeAttribute('disabled');
    }
    else {
        submitButton.setAttribute('disabled', '');
    }
}
// ==== OVERLAY ====
function setOverlayInfo() {
    var name = document.getElementById("name").value;
    var surname = document.getElementById("surname").value;
    var from = document.getElementById("from").value;
    var to = document.getElementById("to").value;
    var date = document.getElementById("when").value;
    var time = document.getElementById("when-time").value;
    var info = document.getElementById("info");
    info.innerHTML = "Imi\u0119: " + name + "<br>Nazwisko: " + surname + "<br>From: " + from + "<br>To: " + to + "<br>Kiedy: " + date + "<br>O kt\u00F3rej: " + time;
}
function setOverlayVisibility(visible) {
    var displayStyle = (visible) ? "block" : "none";
    var overlay = document.querySelector(".confirmation");
    overlay.style.display = displayStyle;
    if (visible) {
        setOverlayInfo();
    }
}
function submitFunction(event) {
    if (validateForm()) {
        setOverlayVisibility(true);
    }
    else {
        setButtonStatus();
    }
    event.preventDefault();
}
var form = document.getElementById("reserveForm");
form.addEventListener('input', setButtonStatus);
form.addEventListener('submit', submitFunction);
setButtonStatus();
setOverlayVisibility(false);
