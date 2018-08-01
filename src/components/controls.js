import Vue from 'vue/dist/vue.js';

Vue.component('controls', {
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
            Opacity: <drag-number
                :initialvalue="1.0"
                :resolution="0.01"
                :pixels-per-tick="5.0"
                :min="0.0"
                :max="1.0"
                @value-changed="$emit('opacity-updated', $event)">
            </drag-number>
            <br>
            Brightness: <drag-number
                :initialvalue="1.0"
                :resolution="0.1"
                :pixels-per-tick="5.0"
                :min="0.0"
                :max="10.0"
                @value-changed="$emit('brightness-updated', $event)">
            </drag-number>
            <br>
            R: <drag-number
                :initialvalue="1.0"
                :resolution="0.02"
                :pixels-per-tick="5.0"
                :min="0.0"
                :max="2.0"
                @value-changed="$emit('r-updated', $event)">
            </drag-number>
            <br>
            X bounds: [
                <drag-number
                    :resolution="0.02"
                    :pixels-per-tick="5.0"
                    :max="xBounds[1]"
                    :initialvalue="xBounds[0]"
                    @value-changed="setXBounds(0, $event)">
                </drag-number>,
                <drag-number
                    :resolution="0.02"
                    :pixels-per-tick="5.0"
                    :min="xBounds[0]"
                    :initialvalue="xBounds[1]"
                    @value-changed="setXBounds(1, $event)">
                </drag-number>
            ]
            <br>
            Y bounds: [
                <drag-number
                    :resolution="0.02"
                    :pixels-per-tick="5.0"
                    :max="yBounds[1]"
                    :initialvalue="yBounds[0]"
                    @value-changed="setYBounds(0, $event)">
                </drag-number>,
                <drag-number
                    :resolution="0.02"
                    :pixels-per-tick="5.0"
                    :min="yBounds[0]"
                    :initialvalue="yBounds[1]"
                    @value-changed="setYBounds(1, $event)">
                </drag-number>
            ]
            <br>
            Z bounds: [
                <drag-number
                    :resolution="0.02"
                    :pixels-per-tick="5.0"
                    :max="zBounds[1]"
                    :initialvalue="zBounds[0]"
                    @value-changed="setZBounds(0, $event)">
                </drag-number>,
                <drag-number
                    :resolution="0.02"
                    :pixels-per-tick="5.0"
                    :min="zBounds[0]"
                    :initialvalue="zBounds[1]"
                    @value-changed="setZBounds(1, $event)">
                </drag-number>
            ]
        </div>
    `,
    methods: {
        setXBounds(which, val) {
            this.$set(this.xBounds, which, val.value);
        },
        setYBounds(which, val) {
            this.$set(this.yBounds, which, val.value);
        },
        setZBounds(which, val) {
            this.$set(this.zBounds, which, val.value);
        },
    },
    watch: {
        xBounds(val) {
            this.$emit('x-bounds-updated', {
                which: 'x',
                value: val,
            });
        },
        yBounds(val) {
            this.$emit('y-bounds-updated', {
                which: 'y',
                value: val,
            });
        },
        zBounds(val) {
            this.$emit('z-bounds-updated', {
                value: val,
            });
        },
    },
});

