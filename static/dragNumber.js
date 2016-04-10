var dragNumber = (function () {
    'use strict';

    class DragNumber {
        constructor(name, value = 0, resolution = 1, callback = null) {
            this._name = name;
            this._value = value;
            this._resolution = resolution;
            this._callback = callback;

            this.initializeElement();
        }

        initializeElement() {
            const scope = this;

            this._element = $(`<div id="${this._name}" class="Drag-number">${this._value}</div>`);

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

            this._element.on('mousedown', dragStart);
            $(document).on('mousemove', dragUpdate);
            $(document).on('mouseup', dragEnd);
        }

        set value(value) {
            this._value = value;
            this._element.text(this._value);
        }

        get value() {
            return this._value;
        }

        get element() {
            return this._element;
        }

        set resolution(value) {
            this._resolution = value;
        }

        set callback(callback) {
            this._callback = callback;
        }


    }

    return DragNumber;

}());