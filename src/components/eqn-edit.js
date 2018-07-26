export const eqnEdit = {
    props: ['equationhtml'],
    data: function () {
        return {
            styleObject: {
                width: '50vw',
                height: '30px',
                'font-size': 'x-large',
            },
        };
    },
    template: `
        <div :style="styleObject" v-html="equationhtml"></div>
    `,
};
