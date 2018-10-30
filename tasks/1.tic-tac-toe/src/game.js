import eventMixin from "./event.js";
import Field from "./field.js";
import Point from "./point.js"

class Game {
    constructor(gameSettings) {
        this._gameSettings = gameSettings;
        this._currentDimension = gameSettings.dimension;
        this._isCrossCurrentPlayer = true;
        this._field = new Field(gameSettings.dimension, gameSettings.dimension, Game.EMPTY);
        this._lastSteps = [];
    }

    static get CROSS() {
        return "X";
    }

    static get ZERO() {
        return "O";
    }

    static get EMPTY() {
        return " ";
    }

    get field() {
        return this._field;
    }

    get currentPlayer() {
        return this._isCrossCurrentPlayer ? Game.CROSS : Game.ZERO;
    }

    get lastSteps() {
        return this._lastSteps;
    }

    get status() {
        return this._status === undefined ? null : this._status;
    }

    get countToWin() {
        return this._gameSettings.countToWin;
    }

    getSymbolFromField(row, col) {
        return this._field.get(row, col);
    }

    makeStep(row, col, symbol) {
        if (this._status !== undefined || !this._field.isEmpty(row, col))
            return;
        this._field.put(row, col, symbol);
        this._lastSteps.push(new Point(col, row));
        this._isCrossCurrentPlayer = !this._isCrossCurrentPlayer;
        const winnerLine = this.getWinningLine(row, col);
        if (winnerLine.length !== 0) {
            this._status = {symbol: symbol, line: winnerLine};
        }
        if (this._field.emptyCells.length < this._currentDimension * this._currentDimension / 2) {
            this.enlargeField(1, 1);
            this.trigger('makeStep', row + 1, col + 1, symbol);
        } else {
            this.trigger('makeStep', row, col, symbol);
        }
    }

    getWinningLine(row, col) {
        if (this._field.isEmpty(row, col))
            return [];
        const currentSymbol = this._field.get(row, col);
        const winnerLines = Field.getDeltas(this._gameSettings.countToWin, row, col)
            .map((deltaData) => this._field.getLineByDelta(deltaData))
            .map((line) => Field.checkLineOnWinner(line, currentSymbol, this._gameSettings.countToWin))
            .filter((line) => line.length !== 0);
        return winnerLines[0] !== undefined ? winnerLines[0] : [];
    }

    enlargeField(dDimensionStart, dDimensionEnd) {
        if (dDimensionStart <= 0 || dDimensionEnd <= 0)
            return;
        const tmpDimension = this._currentDimension + dDimensionStart + dDimensionEnd;
        const newField = new Field(tmpDimension, tmpDimension);
        for (let row = 0; row < this._currentDimension; row++)
            for (let col = 0; col < this._currentDimension; col++)
                newField.put(row + dDimensionStart, col + dDimensionStart, this._field.get(row, col));
        this._currentDimension = tmpDimension;
        this._field = newField;
        this._lastSteps = this._lastSteps.map((point) => point.add(new Point(dDimensionStart, dDimensionStart)));
        this.trigger('enlargeField');
    }
}

for (let key in eventMixin) {
    Game.prototype[key] = eventMixin[key];
}

export default Game;