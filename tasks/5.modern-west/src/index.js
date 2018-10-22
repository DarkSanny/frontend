import Card from './Card.js';
import Game from './Game.js';
import {setSpeedRate as setGameSpeedRate} from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card {
    constructor(name, power) {
        super(name || "Creature", power || 1);
    }

    getDescriptions() {
        return [getCreatureDescription(this)]
            .concat(super.getDescriptions());
    }
}

class Duck extends Creature {
    constructor(name, strength) {
        super(name || "Duck", strength || 2);
    }

    quacks() {
        console.log('quack')
    };

    swims() {
        console.log('float: both;')
    };
}

class Dog extends Creature {
    constructor(name, strength) {
        super(name || "Dog", strength || 3);
    }

    swims() {
        console.log('float: none;')
    };
}

class Lad extends Dog {
    constructor() {
        super('Братки', 2);
    }

    static get count() {
        return this._count || 0;
    }

    static set count(value) {
        this._count = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.count++;
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.count--;
        super.doBeforeRemoving(continuation);
    }

    static getBonus() {
        return this.count * (this.count + 1) / 2;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(Lad.getBonus() + value, toCard, gameContext, continuation);
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        let value1 = value - Lad.getBonus();
        super.modifyTakenDamage(value1 < 0 ? 0 : value1, fromCard, gameContext, continuation);
    };

    getDescriptions() {
        return ["Чем их больше, тем они сильнее"]
            .concat(super.getDescriptions());
    }
}

class Rogue extends Creature{
    constructor() {
        super("Изгой", 2);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        if (oppositePlayer.table[position]){
            if (Object.getOwnPropertyNames(oppositePlayer.table[position].__proto__).indexOf('modifyDealedDamageToCreature') != -1) {
                this.modifyDealedDamageToCreature = oppositePlayer.table[position].__proto__.modifyDealedDamageToCreature;
                delete oppositePlayer.table[position].__proto__.modifyDealedDamageToCreature;
            }
            if (Object.getOwnPropertyNames(oppositePlayer.table[position].__proto__).indexOf('modifyTakenDamage') != -1) {
                this.modifyTakenDamage = oppositePlayer.table[position].__proto__.modifyTakenDamage;
                delete oppositePlayer.table[position].__proto__.modifyTakenDamage;
            }
        }
        gameContext.updateView();
        super.doBeforeAttack(gameContext, continuation);
    };
}

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Rogue(),
];
const banditStartDeck = [
    new Lad(),
    new Lad(),
    new Lad(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
setGameSpeedRate(1);

// Запуск игры.
game.play(false, (winner) => {
    //alert('Победил ' + winner.name);
});
