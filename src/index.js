import { default as FunctionGrapher } from './functionGrapher';
import { default as DragNumber } from './dragNumber';
import { default as EquationElement } from './equationElement';
import { components } from './components/index';

import * as math from 'mathjs';

const FG = {
    FunctionGrapher,
    DragNumber,
    EquationElement,
    components,
    math: math.default,
};

export default FG;
