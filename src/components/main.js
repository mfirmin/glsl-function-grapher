import Vue from 'vue/dist/vue';
import { FunctionGrapher } from '../functionGrapher';

Vue.component('main-graph', {
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
        setBrightness(b) {
            this.fg.brightness = b;
        },
        setR(r) {
            this.fg.R = r;
        },
        setXBounds(x) {
            this.fg.xBounds = x;
        },
        setYBounds(y) {
            this.fg.yBounds = y;
        },
        setZBounds(z) {
            this.fg.zBounds = z;
        },
        computeGLSL(eqn, uniforms) {
            let glsl = '';
            for (const node of eqn) {
                if (node.type === 'coefficient') {
                    if (uniforms[`var${node.id}`] === undefined) {
                        uniforms[`var${node.id}`] = { value: node.value, type: 'f' };
                    }
                    glsl += ` var${node.id} `;
                } else if (node.type === 'static') {
                    glsl += node.glsl;
                } else if (node.type === 'power') {
                    // pow(x, y) is undefined for x <= 0, so we just repeat multiplication instead.
                    const innerGLSL = `(${this.computeGLSL(node.value, uniforms)})`;
                    for (let i = 0; i < node.power - 1; i++) {
                        glsl += `${innerGLSL} *`;
                    }
                    glsl += `${innerGLSL}`;
                }
            }
            return glsl;
        },
        setEquation(eqn) {
            const uniforms = {};
            const glsl = this.computeGLSL(eqn, uniforms);

            this.fg.setEquation(glsl, uniforms);
        },
        updateCoefficient(id, value) {
            this.fg.updateCoefficient(id, value);
        },
    },
});
