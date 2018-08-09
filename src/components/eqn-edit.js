import Vue from 'vue/dist/vue';

Vue.component('eqn-edit', {
    props: ['equationhtml'],
    data() {
        return {
            styleObject: {
                'font-size': 'large',
            },
        };
    },
    template: `
        <span :style="styleObject">
            <span v-for="node in equationhtml">
                <drag-number
                    v-if="node.type === 'coefficient'"
                    :resolution="0.1"
                    :pixels-per-tick="2.0"
                    :initialvalue="node.value"
                    :id="node.id"
                    :key="node.id"
                    @value-changed="valueChanged">
                </drag-number>
                <span class="variable" v-else-if="node.type === 'variable'">{{ node.id }}</span>
                <span v-else-if="node.type === 'static'">{{ node.value }}</span>
                <span v-else-if="node.type === 'power'">
                    <eqn-edit :equationhtml="node.value" @coefficient-changed="$emit('coefficient-changed', $event)"></eqn-edit><sup>{{ node.power }}</sup>
                </span>
                <span v-else-if="node.type === 'error'" class="error">{{ node.value }}</span>
            </span>
        </span>
    `,
    methods: {
        valueChanged(val) {
            this.$emit('coefficient-changed', val);
        },
    },
});
