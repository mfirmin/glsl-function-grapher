import DragNumber from './dragNumber';

const VARIABLE_REGEX = /-?(?:\d+\.?\d*|\d*\.\d+)/g;

class EquationElement {
    constructor(id, parent) {
        this._id = id;
        this._parent = parent;
        this._variables = [];
        this._eqnHTML = '';
        this._eqnGLSL = '';
    }

    makeEquation(fn) {
        this.clearVariables();

        this._eqnHTML = '0=';
        this._eqnGLSL = fn;

        let varStr = VARIABLE_REGEX.exec(fn);
        let last   = VARIABLE_REGEX.lastIndex;

        let idx;
        if (varStr === null) {
            idx = fn.length;
        } else {
            idx = varStr.index;
        }

        this._eqnHTML += fn.substring(0, idx);

        let count = 0;
        while (varStr !== null) {
            const name       = `var${String.fromCharCode(97 + count)}`;
            const value      = Number(varStr[0]);
            const dragNumber = new DragNumber(name, value);

            this._eqnHTML += dragNumber.elementString;
            this._eqnGLSL = this._eqnGLSL.replace(value, name);

            this._variables.push({ name, value, dragNumber });

            last = VARIABLE_REGEX.lastIndex;
            varStr = VARIABLE_REGEX.exec(fn);

            if (varStr === null) {
                idx = fn.length;
            } else {
                idx = varStr.index;
            }
            this._eqnHTML += fn.substring(last, idx);
            count++;
        }

        $(this._parent)[0].innerHTML = this._eqnHTML;
        for (let i = 0; i < this._variables.length; i++) {
            this._variables[i].dragNumber.makeDraggable();
        }

        return { eqnHTML: this._eqnHTML, eqnGLSL: this._eqnGLSL, variables: this._variables };
    }

    clearVariables() {
        for (let i = 0; i < this._variables.length; i++) {
            this._variables[i].dragNumber.destroy();
        }
        this._variables.length = 0;
    }

}

export default EquationElement;
