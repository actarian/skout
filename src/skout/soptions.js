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
            html: {
                responsive: false,
                exact: false,
                inline: false,
            },
            css: {
                folder: 'css/',
                export: true,
            },
            image: {
                folder: 'img/',
                compression: 0.8,
            },
            svg: {
                folder: 'svg/',
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