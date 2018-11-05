/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import beautify from 'js-beautify';

const GOOGLE_UA = 'UA-128159763-1';
const GOOGLE_UUID = 'google.analytics.uuid';

export default class SUtil {

    static getDocument() {
        return sketch.fromNative(context.document);
    }

    static toGroupNames(name) {
        return name.toLowerCase().split('/').map(x => x.trim().replace(/ /g, '-'));
    }

    static toComponentName(name) {
        return name.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w|-+)/g, (match, index) => {
            return match === '-' ? '' : match.toUpperCase();
        }) + 'Component';
    }

    static toHash(text) {
        var hash = 0,
            i, chr;
        if (text.length === 0) return hash;
        for (i = 0; i < text.length; i++) {
            chr = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    static copyResource(resource, folder) {
        SUtil.addFolder(folder);
        const toPath = `${folder}/${resource}`;
        const toUrl = NSURL.alloc().initFileURLWithPath(toPath);
        const fromUrl = context.plugin.urlForResourceNamed(resource);
        SUtil.removeItem(toPath);
        NSFileManager.defaultManager().copyItemAtURL_toURL_error_(fromUrl, toUrl, nil);
    }

    static addFolder(path) {
        if (!NSFileManager.defaultManager().fileExistsAtPath_(path)) {
            NSFileManager.defaultManager().createDirectoryAtPath_attributes(path, {
                withIntermediateDirectories: true
            });
        }
    }

    static removeItem(path) {
        if (NSFileManager.defaultManager().fileExistsAtPath_(path)) {
            NSFileManager.defaultManager().removeItemAtPath_error_(path, nil);
        }
    }

    static saveTextFile(text, path, name) {
        SUtil.addFolder(path);
        NSString.stringWithString(text).writeToFile_atomically_encoding_error_(
            path + '/' + name, true, NSUTF8StringEncoding, null
        );
    }

    static openFolder(path) {
        NSWorkspace.sharedWorkspace().selectFile_inFileViewerRootedAtPath(path, nil);
    }

    static exportLayer(object, path, name, format) {
        format = format || 'svg'; // !!!
        const doc = context.document;
        var exportFormat = MSExportFormat.alloc().init();
        var exportRequest = MSExportRequest.exportRequestFromExportFormat_layer_inRect_useIDForName(
            exportFormat, object, object.frame().rect(), false
        );
        exportRequest.setShouldTrim(false);
        exportRequest.setFormat(format);
        exportRequest.setScale(2);
        // Artboard background color
        exportRequest.setBackgroundColor(object.backgroundColor());
        doc.saveExportRequest_toFile(exportRequest, path + '/' + name + '.' + format);
    }

    static googleAnalytics(category, action, label, value) {
        let uuid = NSUserDefaults.standardUserDefaults().objectForKey(GOOGLE_UUID);
        if (!uuid) {
            uuid = NSUUID.UUID().UUIDString();
            NSUserDefaults.standardUserDefaults().setObject_forKey(uuid, GOOGLE_UUID);
        }
        let url = 'https://www.google-analytics.com/collect?v=1';
        // Tracking ID
        url += '&tid=' + GOOGLE_UA;
        // Source
        url += '&ds=sketch' + MSApplicationMetadata.metadata().appVersion;
        // Client ID
        url += '&cid=' + uuid;
        // pageview, screenview, event, transaction, item, social, exception, timing
        url += '&t=event';
        // App Name
        url += '&an=' + encodeURI(context.plugin.name());
        // App ID
        url += '&aid=' + context.plugin.identifier();
        // App Version
        url += '&av=' + context.plugin.version();
        // Event category
        url += '&ec=' + encodeURI(category);
        // Event action
        url += '&ea=' + encodeURI(action);
        // Event label
        if (label) {
            url += '&el=' + encodeURI(label);
        }
        // Event value
        if (value) {
            url += '&ev=' + encodeURI(value);
        }
        const session = NSURLSession.sharedSession();
        const task = session.dataTaskWithURL(NSURL.URLWithString(NSString.stringWithString(url)));
        task.resume();
    }

    static beautifyHtml(html) {
        html = html.replace(/<svg/gm, '\r<svg');
        return beautify.html(html, {
            indent_with_tabs: true,
            preserve_newlines: true,
            max_preserve_newlines: 0,
            keep_array_indentation: true,
            break_chained_methods: true,
            wrap_line_length: 0,
            wrap_attributes: false,
            end_with_newline: true,
            extra_liners: true,
            unformatted: []
        });
    }

    static beautifyCss(css) {
        return beautify.css(css, {
            indent_with_tabs: true,
            preserve_newlines: true,
            max_preserve_newlines: 1,
            keep_array_indentation: true,
            break_chained_methods: true,
            wrap_line_length: 0,
            end_with_newline: true,
            brace_style: 'collapse,preserve-inline',
        });
    }

    static beautifyJs(js) {
        return beautify.js(js);
    }

    static getResourceText(resourceName) {
        const url = context.plugin.urlForResourceNamed(resourceName);
        const resource = NSString.alloc().initWithContentsOfURL(url);
        return resource;
    }

}