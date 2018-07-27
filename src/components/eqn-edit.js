export const eqnEdit = {
    props: ['equationhtml'],
    data: function () {
        return {
            styleObject: {
                width: '50vw',
                height: '30px',
                'font-size': 'x-large',
            },
        };
    },
    template: `
        <div :style="styleObject">
            <span v-for="node in equationhtml">
                <drag-number v-if="node.type === 'coefficient'" :initialvalue="node.value" :key="node.id" @value-changed="valueChanged"></drag-number>
                <span v-else-if="node.type === 'static'">{{ node.value }}</span>
                <span v-else-if="node.type === 'error'" class="error">{{ node.value }}</span>
            </span>
        </div>
    `,
    methods: {
        valueChanged(val) {
            this.$emit('coefficient-changed', val);
        },
    },
};
