var True = true
var False = false
var None = undefined

class Toaster {
    static empty = 'Nothing to copy!'
    static error = 'An error occured! Check console for details.'
    static confirmDeleteCollection = 'Are you sure? This will delete all cards too!'
    static confirmDeleteCard = 'Are you sure?'
    static removed = 'Removed'
    static updated = 'Updated'
    static copied(text) {
        M.toast({
            displayLength: 1500,
            html: `<span><span class="card-copy-toast">${text}</span>` + ((text !== undefined && text != Toaster.empty) ? '<div><span class="right">Copied!</span></div>' : '') + '</span>'
        })
    }

    static toast(text) {
        M.toast({
            displayLength: 1500,
            html: `<span><span class="card-copy-toast">${text}</span></span>`,
        })
    }
}

function redirect(href) {
    document.location.href = href
}

function __noEventPropagation(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
}

const range = (start, stop, step = 1) =>
    Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function copyNoFormat(text) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
}

function rand(min, max, step) {
    var delta, range, rand;
    if (arguments.length < 2) {
        max = min;
        min = 0;
    }
    if (!step) {
        step = 1;
    }
    delta = max - min;
    range = delta / step;
    rand = Math.random();
    rand *= range;
    rand = Math.floor(rand);
    rand *= step;
    rand += min;
    return rand;
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

class UIDGenerator {
    static UIDSet = new Set();
    static generateID(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    static registerUID(UID) {
        UIDGenerator.UIDSet.add(UID)
    }

    static generateUID(length) {
        let UID;
        while (true) {
            UID = UIDGenerator.generateID(length)
            if (!UIDGenerator.UIDSet.has(UID)) {
                UIDGenerator.UIDSet.add(UID)
                return UID
            }
        }
    }
}

function plainVue(obj) {
    res = {}
    for (let i of Object.getOwnPropertyNames(obj)) {
        if (i[0] !== '_' && i[0] !== '$' ) res[i] = obj[i]
    }
    return res
}

class UIDBuilder extends UIDGenerator {
    static length = 6
    static delimiter = '__'
    static generateUID() {
        return UIDGenerator.generateUID(UIDBuilder.length)
    }

    static buildUID(type, UID) {
        return `${UID === undefined ? UIDBuilder.generateUID() : UID}${UIDBuilder.delimiter}${type}`
    }

    static parseUID(UID) {
        return UID.split(UIDBuilder.delimiter)[0]
    }
}
var cl = console.log