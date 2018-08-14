import Vue from 'vue/dist/vue';
import { FunctionGrapher } from '../functionGrapher';

Vue.component('main-graph', {
    data() {
        return {
            fullscreen: false,
            fg: null,
            outerStyle: {
                'box-shadow': '1px 1px 1px grey',
                'border-radius': '5px',
            },
            innerStyle: {
                width: '100%',
                height: '100%',
                'border-radius': '2px',
            },
            fullscreenIconStyle: {
                color: '#ccc',
                position: 'absolute',
                top: '5px',
                right: '5px',
                cursor: 'pointer',
            },
        };
    },
    mounted() {
        this.fg = new FunctionGrapher(this.$refs.container);
        this.fg.go();
    },
    template: `
        <div :style="outerStyle" :class="{ fullscreen }">
            <div ref="container" :style="innerStyle"></div>
            <v-icon
                large
                :style="fullscreenIconStyle"
                @click="fullscreen = !fullscreen"
            >{{ fullscreen ? 'fullscreen_exit' : 'fullscreen' }}</v-icon>

        </div>
    `,
    methods: {
        setOpacity(o) {
            this.fg.opacity = o;
        },
        setGreyscale(g) {
            this.fg.greyscale = g;
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
                if (node.type === 'coefficient' || node.type === 'variable') {
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
    watch: {
        fullscreen() {
            this.$nextTick(() => {
                this.fg.renderer.setSize(this.$el.offsetWidth, this.$el.offsetHeight);
            });
        },
    },
});
