function createElement(number) {
    let elem = document.createElement('fieldset');
    elem.innerHTML = "<button class='removebtn'>X</button>" +
        "<h4 class=\"beverage-count\">Напиток №" + number +"</h4>\n" +
        "        <label class=\"field\">\n" +
        "            <span class=\"label-text\">Я буду</span>\n" +
        "            <select>\n" +
        "                <option value=\"espresso\">Эспрессо</option>\n" +
        "                <option value=\"capuccino\" selected>Капучино</option>\n" +
        "                <option value=\"cacao\">Какао</option>\n" +
        "            </select>\n" +
        "        </label>\n" +
        "        <div class=\"field\">\n" +
        "            <span class=\"checkbox-label\">Сделайте напиток на</span>\n" +
        "            <label class=\"checkbox-field\">\n" +
        "                <input type=\"radio\" name=\"milk" + number +"\" value=\"usual\" checked />\n" +
        "                <span>обычном молоке</span>\n" +
        "            </label>\n" +
        "            <label class=\"checkbox-field\">\n" +
        "                <input type=\"radio\" name=\"milk" + number +"\" value=\"no-fat\" />\n" +
        "                <span>обезжиренном молоке</span>\n" +
        "            </label>\n" +
        "            <label class=\"checkbox-field\">\n" +
        "                <input type=\"radio\" name=\"milk"+number+"\" value=\"soy\" />\n" +
        "                <span>соевом молоке</span>\n" +
        "            </label>\n" +
        "            <label class=\"checkbox-field\">\n" +
        "                <input type=\"radio\" name=\"milk"+number+"\" value=\"coconut\" />\n" +
        "                <span>кокосовом молоке</span>\n" +
        "            </label>\n" +
        "        </div>\n" +
        "        <div class=\"field\">\n" +
        "            <span class=\"checkbox-label\">Добавьте к напитку:</span>\n" +
        "            <label class=\"checkbox-field\">\n" +
        "                <input type=\"checkbox\" name=\"options"+number+"\" value=\"whipped cream\" />\n" +
        "                <span>взбитых сливок</span>\n" +
        "            </label>\n" +
        "            <label class=\"checkbox-field\">\n" +
        "                <input type=\"checkbox\" name=\"options"+number+"\" value=\"marshmallow\" />\n" +
        "                <span>зефирок</span>\n" +
        "            </label>\n" +
        "            <label class=\"checkbox-field\">\n" +
        "                <input type=\"checkbox\" name=\"options"+number+"\" value=\"chocolate\" />\n" +
        "                <span>шоколад</span>\n" +
        "            </label>\n" +
        "            <label class=\"checkbox-field\">\n" +
        "                <input type=\"checkbox\" name=\"options"+number+"\" value=\"cinnamon\" />\n" +
        "                <span>корицу</span>\n" +
        "            </label>\n" +
        "        </div>";
    elem.classList.add('beverage');
    return elem;
}

let buttons = document.getElementsByClassName('add-button');
for (let button of buttons) {
    button.addEventListener('click', () => addElement());
}

let counter = 0;
let elements = document.getElementsByTagName('fieldset');
addElement();

function addElement() {
    let button = document.getElementById('button');
    let element = createElement(++counter);
    let removeButton = element.getElementsByClassName('removebtn');
    removeButton[0].addEventListener('click', () => removeElement(element));
    button.parentElement.insertBefore(element, button);
}

function removeElement(element) {
    if (elements.length < 1)
        return;
    element.parentElement.removeChild(element);
}

function openModalWindow() {
    document.getElementsByClassName('modal-test')[0].classList.remove('modal-head');
    return false;
}

let submitbtns = document.getElementsByClassName('submit-button');
submitbtns[0].addEventListener('click', () => openModalWindow());

let forms = document.getElementsByTagName('form');
for (let form of forms) {
    form.addEventListener('submit', (e) => e.preventDefault());
}

let overlays = document.getElementsByClassName('overlay');
for (let overlay of overlays) {
    overlay.addEventListener('click', () => overlay.parentElement.classList.add('modal-head'));
}

