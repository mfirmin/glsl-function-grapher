import { FunctionGrapher } from '../functionGrapher';

export const mainGraph = {
    data: function () {
        return {
            fg: null,
            styleObject: {
                border: '1px solid black',
                width: '50vw',
                height: '75vh',
            },
        };
    },
    mounted: function() {
        this.fg = new FunctionGrapher(this.$refs.canvas);
        this.fg.go();
    },
    template: `
        <canvas ref="canvas" :style="styleObject"></canvas>
    `,
};

