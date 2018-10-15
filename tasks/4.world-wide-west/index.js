// Отвечает является ли объект уткой.
isDuck = function (obj) {
    return obj && obj.quacks && obj.swims;
};

// Отвечает является ли объект собакой.
isDog = function (obj) {
    return obj instanceof Dog;
};

Card.prototype.getCustomDescriptions = function () {
    return [getAnimalType(this)];
};

function getAnimalType(card) {
    let result = [];
    if (isDuck(card))
        result.push("Утка");
    if (isDog(card))
        result.push("Собака");
    const rawResult = result.join('-');
    return rawResult.length === 0 ? "Существо" : rawResult;
}

// Основа для утки.
function Duck(name, damage) {
    Card.call(this, name || "", damage || 2);
    this.quacks = () => { console.log('quack') };
    this.swims = () => { console.log('float: both;') };
}

Duck.prototype = Object.create(Card.prototype);
Duck.prototype.constructor = Duck;

// Основа для собаки.
function Dog(name, damage) {
    Card.call(this, name || "", damage || 1);
    this.swims = () => { console.log('float: none;') };
}

Dog.prototype = Object.create(Card.prototype);
Dog.prototype.constructor = Dog;

function Trasher(name) {
    Dog.call(this, name || "", 5);

}

Trasher.prototype = Object.create(Dog.prototype);
Trasher.prototype.constructor = Trasher;

function Gatling(name) {
    Card.call(this, name, 6);
}

Gatling.prototype = Object.create(Card.prototype)
Gatling.prototype.constructor = Gatling;
Gatling.prototype.attack = function (gameContext, continuation) {
    const taskQueue = new TaskQueue();
    const {oppositePlayer, position} = gameContext;
    const table = oppositePlayer.table;

    for (let i = 0; i < table.length; i++) {
        taskQueue.push(onDone => {
            const oppositeCard = table[i];
            if (oppositeCard && i != position) {
                taskQueue.push(onDone => this.view.showAttack(onDone));
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
            } else {
                onDone();
            }
        });
    }
    taskQueue.continueWith(continuation);
};

Trasher.prototype.modifyTakenDamage = function(value, fromCard, gameContext, continuation) {
    const taskQueue = new TaskQueue();

    taskQueue.push(onDone => {
        this.view.signalAbility(onDone);

    });

    taskQueue.continueWith(() => continuation(--value));
};
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Dog(),
    new Dog(),
    new Trasher("TRASHER"),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальная функция, позволяющая управлять скоростью всех анимаций.
function getSpeedRate() {
    return 1;
}

// Запуск игры.
game.play(false, (winner) => {
    //alert('Победил ' + winner.name);
});
