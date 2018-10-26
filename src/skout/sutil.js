/* jshint esversion: 6 */

const GOOGLE_UA = 'UA-128159763-1';
const GOOGLE_UUID = 'google.analytics.uuid';

export default class SUtil {

    static getDocument() {
        return sketch.fromNative(context.document);
    }

    static toGroupNames(name) {
        return name.toLowerCase().split('/').map(x => x.trim().replace(/ /g, '-'));
    }

    static toClassName(name) {
        return name.toLowerCase().replace(/(?!-)(?!_)(\W*)/g, '');
    }

    static cssStyle(styleText) {
        const style = {};
        styleText.split(';').forEach(x => {
            if (x.indexOf(':') !== -1) {
                const kv = x.split(':');
                style[kv[0].trim()] = kv[1].trim();
            }
        });
        return style;
    }

    static toRgb(color) {
        var r = Math.round(color.red() * 255);
        var g = Math.round(color.green() * 255);
        var b = Math.round(color.blue() * 255);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + color.alpha() + ')';
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

}