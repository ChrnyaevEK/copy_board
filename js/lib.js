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
