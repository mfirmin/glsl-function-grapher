import Vue from 'vue/dist/vue';

Vue.component('eqn-input', {
    data() {
        return {
            equation: '',
            inputStyle: {
                'font-size': '16px',
                'background-color': '#eee',
                height: '30px',
                'flex-grow': 1,
            },
            buttonStyle: {
                float: 'right',
            },
        };
    },
    template: `
        <div class="entry">
            <font :style="{ 'font-size': inputStyle['font-size'], 'padding-top': '9px' }"> 0 = </font>
            <input :style="inputStyle" placeholder="f(x,y,z)" v-model="equation" @keyup.enter="graph">
            <button :style="buttonStyle" @click="graph">Graph!</button>
        </div>
    `,
    methods: {
        graph() {
            this.$emit('graph', {
                newEquation: this.equation,
            });
        },
    },
});
