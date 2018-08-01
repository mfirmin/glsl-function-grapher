import * as math from 'mathjs';
import './components/index';
import Vue from 'vue/dist/vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

const FG = {
    math: math.default,
    lib: {
        Vue,
    },
};

export default FG;
