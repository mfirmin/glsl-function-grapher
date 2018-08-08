import Vue from 'vue/dist/vue';

Vue.component('controls', {
    props: ['variables'],
    data() {
        return {
            opaque: 1,
            xBounds: [-1, 1],
            yBounds: [-1, 1],
            zBounds: [-1, 1],
            styleObject: {
                border: '1px solid black',
                'background-color': '#e4e4e4',
                'box-shadow': '2px 2px 1px grey',
                'border-radius': '1px',
                padding: '2px',
                position: 'relative',
                height: '100%',
            },
        };
    },
    template: `
        <div :style="styleObject">
            <div id="settings">
                <div>
                    <strong>Settings</strong>
                    <p>
                    Greyscale: <input type="checkbox" @change="$emit('greyscale-updated', $event.target.checked)">
                    <br>
                    Opacity: <drag-number
                        id="opacity"
                        ref="opacity"
                        :initialvalue="1.0"
                        :resolution="0.01"
                        :pixels-per-tick="5.0"
                        :min="0.0"
                        :max="1.0"
                        @value-changed="$emit('opacity-updated', $event)">
                    </drag-number>
                    <br>
                    Brightness: <drag-number
                        id="brightness"
                        ref="brightness"
                        :initialvalue="1.0"
                        :resolution="0.1"
                        :pixels-per-tick="5.0"
                        :min="0.0"
                        :max="10.0"
                        @value-changed="$emit('brightness-updated', $event)">
                    </drag-number>
                    <br>
                    Sharpness: <drag-number
                        id="sharpness"
                        ref="sharpness"
                        :initialvalue="1.0"
                        :resolution="0.02"
                        :pixels-per-tick="5.0"
                        :min="0.0"
                        :max="2.0"
                        @value-changed="$emit('r-updated', $event)">
                    </drag-number>
                    <span class="help">
                        <v-icon
                            small
                            slot="activator"
                            :style="{ color: '#555' }"
                            >help
                        </v-icon>
                        <div class="tooltip">
                            Adjusts the "sharpness" of the render.
                            Lower values produce a sharper image, but lead to rendering artefacts.
                            Higher values will produce a blurrier image.
                        </div>
                    </span>
                    <br>
                    X bounds: [
                        <drag-number
                            id="xBounds0"
                            ref="xBounds0"
                            :resolution="0.02"
                            :pixels-per-tick="5.0"
                            :max="xBounds[1]"
                            :initialvalue="xBounds[0]"
                            @value-changed="setXBounds(0, $event)">
                        </drag-number>,
                        <drag-number
                            id="xBounds1"
                            ref="xBounds1"
                            :resolution="0.02"
                            :pixels-per-tick="5.0"
                            :min="xBounds[0]"
                            :initialvalue="xBounds[1]"
                            @value-changed="setXBounds(1, $event)">
                        </drag-number>
                    ] <v-icon
                        small
                        :style="{ color: '#555' }"
                        @click="resetBounds('X')"
                        >refresh</v-icon>
                    <br>
                    Y bounds: [
                        <drag-number
                            id="yBounds0"
                            ref="yBounds0"
                            :resolution="0.02"
                            :pixels-per-tick="5.0"
                            :max="yBounds[1]"
                            :initialvalue="yBounds[0]"
                            @value-changed="setYBounds(0, $event)">
                        </drag-number>,
                        <drag-number
                            id="yBounds1"
                            ref="yBounds1"
                            :resolution="0.02"
                            :pixels-per-tick="5.0"
                            :min="yBounds[0]"
                            :initialvalue="yBounds[1]"
                            @value-changed="setYBounds(1, $event)">
                        </drag-number>
                    ] <v-icon
                        small
                        :style="{ color: '#555' }"
                        @click="resetBounds('Y')"
                        >refresh</v-icon>
                    <br>
                    Z bounds: [
                        <drag-number
                            id="zBounds0"
                            ref="zBounds0"
                            :resolution="0.02"
                            :pixels-per-tick="5.0"
                            :max="zBounds[1]"
                            :initialvalue="zBounds[0]"
                            @value-changed="setZBounds(0, $event)">
                        </drag-number>,
                        <drag-number
                            id="zBounds1"
                            ref="zBounds1"
                            :resolution="0.02"
                            :pixels-per-tick="5.0"
                            :min="zBounds[0]"
                            :initialvalue="zBounds[1]"
                            @value-changed="setZBounds(1, $event)">
                        </drag-number>
                    ] <v-icon
                        small
                        :style="{ color: '#555' }"
                        @click="resetBounds('Z')"
                        >refresh</v-icon>
                    </p>
                </div>
            </div>
            <hr class="controls-separator">
            <div id="variables">
                <strong>Variables</strong>
                <span class="help">
                    <v-icon
                        small
                        slot="activator"
                        :style="{ color: '#555' }"
                        >help
                    </v-icon>
                    <div class="tooltip">
                        Variables are represented by alphabetic characters other than 'x', 'y', and 'z'. If present in the equation, their values can be adjusted below.
                    </div>
                </span>
                <p>
                    <div v-for="(value, name) in variables">
                        {{ name }}: <drag-number
                            :key="value.id"
                            :id="name"
                            :resolution="0.02"
                            :pixels-per-tick="5.0"
                            :initialvalue="value.value"
                            @value-changed="$emit('variable-changed', $event)">
                        </drag-number>
                    </div>
                </p>
            </div>
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

        resetBounds(which) {
            switch (which) {
                case 'X':
                    this.$refs.xBounds0.value = -1;
                    this.$refs.xBounds1.value = 1;
                    break;
                case 'Y':
                    this.$refs.yBounds0.value = -1;
                    this.$refs.yBounds1.value = 1;
                    break;
                case 'Z':
                    this.$refs.zBounds0.value = -1;
                    this.$refs.zBounds1.value = 1;
                    break;
                default:
                    break;
            }
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
