let eventMixin = {
    on: function (eventName, handler) {
        if (!this._eventHandlers) this._eventHandlers = {};
        if (!this._eventHandlers[eventName]) {
            this._eventHandlers[eventName] = [];
        }
        this._eventHandlers[eventName].push(handler);
    },

    off: function (eventName, handler) {
        let handlers = this._eventHandlers && this._eventHandlers[eventName];
        if (!handlers) return;
        for (let i = 0; i < handlers.length; i++) {
            if (handlers[i] === handler) {
                handlers.splice(i--, 1);
            }
        }
    },

    trigger: function (eventName) {
        if (!this._eventHandlers || !this._eventHandlers[eventName]) {
            return;
        }
        let handlers = this._eventHandlers[eventName];
        for (let i = 0; i < handlers.length; i++) {
            handlers[i].apply(this, [].slice.call(arguments, 1));
        }
    }
};

export default eventMixin;