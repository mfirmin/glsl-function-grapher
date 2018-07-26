export const mainGraph = {
    data: function () {
        return {
            styleObject: {
                border: '1px solid black',
                width: '50vw',
                height: '75vh',
            },
        };
    },
    template: `
        <div v-bind:style="styleObject"></div>
    `,
};

