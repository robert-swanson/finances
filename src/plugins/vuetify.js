import Vue from "vue";
import Vuetify from "vuetify/lib";
// import Vuetify from "src/plugins/vuetify";
import "vuetify/dist/vuetify.min.css";
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#105361', // #E53935
                secondary: colors.red.lighten4, // #FFCDD2
                accent: colors.blue, // #3F51B5
            },
        }
    }
});
