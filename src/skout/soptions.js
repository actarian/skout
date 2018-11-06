/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

export default class SOptions {

    static defaults(options) {
        Object.assign(SOptions, {
            //
            save: true,
            settings: true,
            debug: true,
            inline: false,
            //
            component: {
                export: false,
                inline: true,
            },
            html: {
                relative: true,
                absolute: false,
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
                sprite: true,
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