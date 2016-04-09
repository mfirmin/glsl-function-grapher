
class VariableElement {
    constructor(name, value = 0) {
        this._name = name;
        this._value = value;

        this.initializeElement();
    }

    initializeElement() {
        this._element = $(`<div id="${this._name}" class="drag-number">${this._value}</div>`);
    }

    set value(value) {
        this._value = value;
        this._element.text(this._value);
    }

    get element() {
        return this._element;
    }


}

export default VariableElement;
