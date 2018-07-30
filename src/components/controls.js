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
            X bounds: [<drag-number :initialvalue="xBounds[0]"></drag-number>, <drag-number :initialvalue="xBounds[1]"></drag-number>]
            <br>
            Y bounds: [<drag-number :initialvalue="yBounds[0]"></drag-number>, <drag-number :initialvalue="yBounds[1]"></drag-number>]
            <br>
            Z bounds: [<drag-number :initialvalue="zBounds[0]"></drag-number>, <drag-number :initialvalue="zBounds[1]"></drag-number>]
        </div>
    `,
};
