import {entries_map} from "./utility";

const void_els = new Set([
    "br",
    "hr",
    "base",
    "basefont",
    "link",
    "meta",
    "input",
    "keygen",
    "wbr",
    "col",
    "area",
    "embed",
    "frame",
    "img",
    "param",
    "source"
])

function child_fn(i) {
    return i == null || i === false ? '' : i instanceof Array ? i.join('') : i.toString()
}

// const mappings = {
//     xlinkHref: 'xlink:href'
// }

function attr(name: string, value: any): string {
    name = name === 'xlinkHref' ? 'xlink:href' : name;
    if (value == null || value === false) {
        return '';
    } else if (value === true) {
        return ' ' + name;
    }
    if (value instanceof Array && value.length > 0) {
        value = value.join(' ');
    } else if (name === 'style' && typeof value === 'object') {
        value = entries_map(value, (key, val) => key.toString() + ':' + val).join(';');
    }
    return ' ' + name + '="' + value.toString() + '"';
}


export const React = {
    createElement: function (tag: string, attrs: any, ...children: string[]) {
        return '<' + tag + entries_map(attrs, attr).join('') + '>' + (void_els.has(tag) ? '' : children.map(child_fn).join('') + '</' + tag + '>');
    }
}