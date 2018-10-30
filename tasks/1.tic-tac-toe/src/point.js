class Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    add(point) {
        return new Point(this._x + point.x, this._y + point.y);
    }
}

export default Point;