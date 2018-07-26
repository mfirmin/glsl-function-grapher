export const eqnInput = {
    data: function () {
        return {
            equation: '',
            styleObject: {
                width: '50vw',
                height: '30px',
                'font-size': 'large',
            },
        };
    },
    template: `
        <span>
            <font v-bind:style="{ 'font-size': styleObject['font-size'] }"> 0 = </font>
            <input v-bind:style="styleObject" placeholder="f(x,y,z)" v-model="equation" @keyup.enter="graph">
            <button v-on:click="graph">Graph!</button>
        </span>
    `,
    methods: {
        graph: function() {
            this.$emit('graph', {
                newEquation: this.equation,
            });
        },
    },
};
