import Vue from 'vue/dist/vue';

Vue.component('tip', {
    props: ['text'],
    data() {
        return {
            styleObject: {
                // visibility: 'hidden',
                position: 'absolute',
                'z-index': 100,
            },
            arrowStyle: {
                top: '18px',
                left: '-31px',
                position: 'absolute',
                width: 0,
                height: 0,
                'border-left': '15px solid transparent',
                'border-right': '15px solid transparent',
                'border-bottom': '15px solid lightblue',
                opacity: 0.95,
            },
            bodyStyle: {
                position: 'absolute',
                top: '30px',
                left: '-90px',
                padding: '17px',
                width: '158px',
                'background-color': 'lightblue',
                'box-shadow': '2px 2px 2px darkgrey',
                opacity: 0.95,
            },
            closeStyle: {
                top: '5px',
                right: '5px',
                position: 'absolute',
                cursor: 'pointer',
            },
        };
    },
    template: `
        <span :style="styleObject">
            <div :style="arrowStyle"></div>
            <div :style="bodyStyle">Tip: {{ text }}
                <v-icon
                    small
                    :style="closeStyle"
                    @click="$emit('close')"
                    >close
                </v-icon>
            </div>
        </span>
    `,
});
