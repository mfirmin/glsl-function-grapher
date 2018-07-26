import { default as FunctionGrapher } from './functionGrapher';
import { components } from './components/index';

import * as math from 'mathjs';

const FG = {
    FunctionGrapher,
    components,
    math: math.default,
};

export default FG;
