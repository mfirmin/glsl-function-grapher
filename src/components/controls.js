export const controls = {
    data() {
        return {
            opaque: 1,
            xBounds: [-1, 1],
            yBounds: [-1, 1],
            zBounds: [-1, 1],
            styleObject: {
                border: '1px solid black',
                width: '200px',
            },
        };
    },
    template: `
        <div :style="styleObject">
            <input id="opacity" type="checkbox" @input="opacityUpdated" checked>
            <label for="opacity">Opaque</label>
            <br>
            X bounds: [<drag-number :initialvalue="xBounds[0]"></drag-number>, <drag-number :initialvalue="xBounds[1]"></drag-number>]
            <br>
            Y bounds: [<drag-number :initialvalue="yBounds[0]"></drag-number>, <drag-number :initialvalue="yBounds[1]"></drag-number>]
            <br>
            Z bounds: [<drag-number :initialvalue="zBounds[0]"></drag-number>, <drag-number :initialvalue="zBounds[1]"></drag-number>]
        </div>
    `,
    methods: {
        opacityUpdated(event) {
            this.$emit('opacity-updated', +event.target.checked);
        },
    },
};
