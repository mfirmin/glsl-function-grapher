
class DragNumber {
    constructor(name, value = 0, callback = null, opts = {}) {
        this._name = name;
        this._value = value;
        this._callback = callback;
        this._elementString = `<div id="${this._name}" class="drag-number">${this._value}</div>`;

        this._resolution = (opts.resolution === undefined) ? 0.1 : opts.resolution;
        this._max = (opts.max === undefined) ? null : opts.max;
        this._min = (opts.min === undefined) ? null : opts.min;
    }

    makeDraggable() {
        const scope = this;

        if (this.element === undefined) {
            console.warn(`Element ${this._name} has not been attached to the page yet`);
            return;
        }

        let dragged   = false;
        let xDown     = null;
        let valueDown = -1;

        function dragStart(event) {
            event.preventDefault();
            dragged = true;
            xDown = event.pageX;
            valueDown = scope._value;
        }

        function dragUpdate(event) {
            if (dragged) {
                const diff = event.pageX - xDown;
                scope.value = valueDown + diff * scope._resolution;
                if (scope._callback !== null) {
                    scope._callback(scope._value);
                }
            }
        }

        function dragEnd() {
            dragged = false;
        }

        this.element.on('mousedown', dragStart);
        $(document).on('mousemove', dragUpdate);
        $(document).on('mouseup', dragEnd);
    }

    destroy() {
        this.element.remove();
        this.callback = null;
    }

    set value(value) {
        let clampedValue = value;
        if (this._max !== null && clampedValue > this._max) { clampedValue = this._max; }
        if (this._min !== null && clampedValue < this._min) { clampedValue = this._min; }
        this._value = clampedValue;
        this.element.text(this._value);
    }

    get value() {
        return this._value;
    }

    get element() {
        if (this._element === undefined) {
            this._element = $(`#${this._name}`);
        }
        return this._element;
    }

    get elementString() {
        return this._elementString;
    }

    set resolution(value) {
        this._resolution = value;
    }

    set callback(callback) {
        this._callback = callback;
    }

}

export default DragNumber;
