export const dragNumber = {
    props: ['initialvalue'],
    data: function () {
        return {
            value: 0.0,
            resolution: 1, // change in value per pixel dragged
            state: 'drag', // 'drag' or 'input'
            dragging: false,
            mouseStart: [0, 0],
            valueStart: 0,
        };
    },
    created: function() {
        this.value = this.initialvalue;
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
                this.onDragFinish(evt);
            }
        });
    },
    template: `
        <span
            ref="dn"
            v-if="state === 'drag'"
            class="drag-number"
            @mousedown="onDragStart"
            @mouseup="onClick"
            >{{ value }}</span>
        <input
            type="number"
            ref="input"
            v-else-if="state === 'input'"
            v-model.number.lazy="value"
            @keyup.enter="setDrag"
            @blur="setDrag">
    `,
    methods: {
        setInput: function() {
            this.state = 'input';
            this.$nextTick(() => {
                this.$refs.input.focus();
            });
        },
        setDrag: function() {
            this.state = 'drag';
        },
        onDragStart: function(evt) {
            this.mouseStart = [evt.pageX, evt.pageY];
            this.valueStart = this.value;
            this.dragging = true;
            this.dragged = false;
        },
        onDrag: function(evt) {
            // Mark that we are dragging, so we don't accidentally switch to an input on mouseup
            this.dragged = true;
            const delta = evt.pageX - this.mouseStart[0];
            this.value = this.valueStart + delta * this.resolution;
        },
        onDragFinish: function() {
            this.dragged = false;
            this.dragging = false;
        },
        onClick: function() {
            // Only fire if we haven't dragged during this click
            // NOTE: It is necessary that this method is fired AFTER onDragFinish
            if (!this.dragged) {
                this.setInput();
            }
        }
    },
    watch: {
        value: function(val) {
            this.$emit('value-changed', {
                key: this.$vnode.key,
                value: val,
            });
        },
    },
};
