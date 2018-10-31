class Field {
    constructor(width, height, emptySymbol) {
        this._map = Field.createEmptyMap(width, height);
        this._width = width;
        this._height = height;
        this._emptySymbol = emptySymbol;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    isEmpty(row, col) {
        return this._map[row] === undefined
            || this._map[row][col] === undefined
            || this._map[row][col] === this._emptySymbol;
    }

    put(row, col, symbol) {
        this._map[row][col] = symbol;
    }

    get(row, col) {
        if (this._map[row] === undefined || this._map[row][col] === undefined)
            return this._emptySymbol;
        return this._map[row][col];
    }

    getLineByDelta(delta) {
        let result = [];
        let row = delta.start.y;
        let col = delta.start.x;
        for (let index = 0; index < delta.count; index++) {
            let symbol = this.get(row, col);
            result.push({row: row, col: col, symbol: symbol});
            row += delta.delta.y;
            col += delta.delta.x;
        }
        return result;
    }

    get emptyCells() {
        let cells = [];
        for (let row = 0; row < this._height; row++)
            for (let col = 0; col < this._width; col++)
                if (this.isEmpty(row, col))
                    cells.push({row: row, col: col});
        return cells;
    }

    static createEmptyMap(width, height, emptySymbol) {
        const result = [];
        for (let y = 0; y < height; y++) {
            result[y] = [];
            for (let x = 0; x < width; x++)
                result[y][x] = emptySymbol;
        }
        return result;
    }

    static getDeltas(lineSize, row, col) {
        return [
            {start: {x: col - lineSize + 1, y: row - lineSize + 1}, delta: {x: 1, y: 1}, count: lineSize * 2 - 1},
            {start: {x: col, y: row - lineSize + 1}, delta: {x: 0, y: 1}, count: lineSize * 2 - 1},
            {start: {x: col - lineSize + 1, y: row}, delta: {x: 1, y: 0}, count: lineSize * 2 - 1},
            {start: {x: col - lineSize + 1, y: row + lineSize - 1}, delta: {x: 1, y: -1}, count: lineSize * 2 - 1}
        ];
    }

    static checkLineOnWinner(line, symbol, countToWin) {
        let result = [];
        for (let item of line) {
            if (item.symbol === symbol) {
                result.push(item);
            } else {
                result = [];
            }
            if (result.length === countToWin) {
                return result;
            }
        }
        return [];
    }

    static weightLine(line, symbol, emptySymbol) {
        if (line.length % 2 !== 1)
            return 0;
        const index = (line.length + 1) / 2 - 1;
        if (line[index].symbol !== emptySymbol)
            return 0;
        line[index].symbol = symbol;
        let maxLineData = this.getMaxLineData(line.map((cell) => cell.symbol), symbol, emptySymbol);
        line[index].symbol = emptySymbol;
        let count = sumLine(maxLineData) * maxLineData.count * maxLineData.count;
        return count;
    }

    static getMaxLineData(line, symbol, empty) {
        let currentLine = {start: false, end: false, count: 0};
        let result = {start: false, end: false, count: 0};
        for (let i = 0; i < line.length; i++) {
            if (line[i] === symbol) {
                currentLine.count++;
            } else {
                if (line[i] === empty) {
                    if (currentLine.count === 0)
                        currentLine.start = true;
                    else currentLine.end = line[i] === empty;
                }
                if (currentLine.count !== 0) {
                    if (sumLine(result) < sumLine(currentLine))
                        result = currentLine;
                    currentLine = {start: false, end: false, count: 0};
                }
            }
        }
        return result;
    }
}

function sumLine(lineData) {
    return lineData.count +
        (lineData.start ? 1 : 0) +
        (lineData.end ? 1 : 0);
}

export default Field;