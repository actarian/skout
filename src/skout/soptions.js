/* jshint esversion: 6 */

export default class SOptions {

    static defaults(options) {
        Object.assign(SOptions, {
            //
            save: true,
            settings: true,
            debug: true,
            inline: false,
            //
            css: {
                export: true,
            },
            image: {
                compression: 80,
            },
            svg: {
                sprite: false,
            },
            //
            log: {
                layers: false,
            }
            //
        });
        Object.assign(SOptions, options);
    }

    static set(settings) {
        console.log(settings);
        SOptions.settings = settings;
    }

}