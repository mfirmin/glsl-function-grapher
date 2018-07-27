import { FunctionGrapher } from '../functionGrapher';

export const mainGraph = {
    data: function () {
        return {
            fg: null,
            outerStyle: {
                border: '1px solid black',
                width: '50vw',
                height: '75vh',
            },
            innerStyle: {
                margin: '5px 5px 5px 5px',
                width: 'calc(100% - 10px)',
                height: 'calc(100% - 10px)',
            },
        };
    },
    mounted: function() {
        this.fg = new FunctionGrapher(this.$refs.container);
        this.fg.go();
    },
    template: `
        <div :style="outerStyle">
            <div ref="container" :style="innerStyle"></div>
        </div>
    `,
};

