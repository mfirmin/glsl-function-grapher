import Vue from 'vue/dist/vue';

Vue.component('drag-number', {
    props: {
        id: {
            type: String,
            default: '0',
        },
        initialvalue: {
            type: Number,
            default: 0.0,
        },
        resolution: {
            type: Number,
            default: 1.0,
        },
        max: {
            type: Number,
            default: Infinity,
        },
        min: {
            type: Number,
            default: -Infinity,
        },
        'pixels-per-tick': {
            type: Number,
            default: 1,
        },
        fix: {
            type: Number,
            default: 2,
        },
    },
    data() {
        return {
            value: 0.0,
            _resolution: 1, // change in value per pixel dragged
            state: 'drag', // 'drag' or 'input'
            dragging: false,
            mouseStart: [0, 0],
            valueStart: 0,
        };
    },
    created() {
        this.value = Number(this.initialvalue);
        this._resolution = this.resolution !== undefined ? Number(this.resolution) : 1.0;
        // These must be registered to the document so that we can
        // drag beyond the end of the element containing the number
        document.addEventListener('mousemove', (evt) => {
            if (this.dragging) {
                evt.preventDefault();
                this.onDrag(evt);
            }
        });
        document.addEventListener('mouseup', (evt) => {
            if (this.dragging) {
                evt.preventDefault();
                evt.stopPropagation();
                this.onDragFinish(evt);
            }
        });

        document.addEventListener('touchmove', (evt) => {
            if (this.dragging) {
                evt.preventDefault();
                this.onDrag(evt);
            }
        }, { passive: false });

        document.addEventListener('touchend', (evt) => {
            if (this.dragging) {
                evt.preventDefault();
                evt.stopPropagation();
                this.onDragFinish(evt);
            }
        }, { passive: false });
    },
    template: `
        <span
            ref="dn"
            v-if="state === 'drag'"
            class="drag-number"
            @mousedown="onDragStart"
            @touchstart="onDragStart"
            >{{ value.toFixed(fix) }}</span>
        <input
            type="number"
            ref="input"
            v-else-if="state === 'input'"
            @keyup.enter="setDrag"
            @blur="setDrag">
    `,
    methods: {
        setInput() {
            this.state = 'input';
            this.$nextTick(() => {
                this.$refs.input.value = this.value;
                this.$refs.input.focus();
            });
        },
        setDrag() {
            let newValue = Number(this.$refs.input.value);
            if (newValue > this.max) {
                newValue = this.max;
            }
            if (newValue < this.min) {
                newValue = this.min;
            }
            this.value = newValue;
            this.state = 'drag';
        },
        onDragStart(evt) {
            let x;
            let y;
            if (evt.pageX) {
                [x, y] = [evt.pageX, evt.pageY];
            } else if (evt.touches && evt.touches[0] && evt.touches[0].pageX) {
                [x, y] = [evt.touches[0].pageX, evt.touches[0].pageY];
            } else {
                console.warn('Unknown event');
                return;
            }
            this.mouseStart = [x, y];
            this.valueStart = this.value;
            this.dragging = true;
            this.dragged = false;
        },
        onDrag(evt) {
            let x;
            if (evt.pageX) {
                [x] = [evt.pageX];
            } else if (evt.touches && evt.touches[0] && evt.touches[0].pageX) {
                [x] = [evt.touches[0].pageX];
            } else {
                console.warn('Unknown event');
                return;
            }
            // Mark that we are dragging, so we don't accidentally switch to an input on mouseup
            this.dragged = true;
            const delta = Math.floor((x - this.mouseStart[0]) / this.pixelsPerTick);
            let newValue = this.valueStart + delta * this._resolution;
            if (newValue > this.max) {
                newValue = this.max;
            }
            if (newValue < this.min) {
                newValue = this.min;
            }
            this.value = newValue;
        },
        onDragFinish() {
            if (!this.dragged) {
                this.setInput();
            }
            this.dragged = false;
            this.dragging = false;
        },
    },
    watch: {
        value(val) {
            this.$emit('value-changed', {
                id: this.id,
                value: val,
            });
        },
    },
});
