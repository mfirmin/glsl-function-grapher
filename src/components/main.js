import { FunctionGrapher } from '../functionGrapher';

export const mainGraph = {
    data() {
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
    mounted() {
        this.fg = new FunctionGrapher(this.$refs.container);
        this.fg.go();
    },
    template: `
        <div :style="outerStyle">
            <div ref="container" :style="innerStyle"></div>
        </div>
    `,
    methods: {
        setOpacity(o) {
            this.fg.opacity = o;
        },
        setEquation(eqn) {
            const uniforms = {};
            let glsl = '';
            for (const node of eqn) {
                if (node.type === 'coefficient') {
                    uniforms[`var${node.id}`] = { value: node.value, type: 'f' };
                    glsl += ` var${node.id} `;
                } else if (node.type === 'static') {
                    glsl += node.glsl;
                }
            }

            this.fg.setEquation(glsl, uniforms);
        },
        updateCoefficient(id, value) {
            this.fg.updateCoefficient(id, value);
        },
    },
};
