var regCard = {
    title: 'Test button',
    content: 'Test button body',
    color: 'lime'
}

var iterCard = {
    title: 'Test iter button',
    color: 'yellow',
    values: [1,2,3,4,5],
    autoRepeat: true,
    autoCopy: true,
    random: false,
}

class Data {
    hashCode = s => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
}

let cCardHolder = new CCardHolder()
let cCardRegularBuilder = new CCardRegularBuilder()
cCardRegularBuilder.build = ccard => {
    cCardHolder.prepend(ccard.origin)
}
cCardRegularBuilder.init()

let cCardIterativeBuilder = new CCardIterativeBuilder()
cCardIterativeBuilder.build = ccard => {
    cCardHolder.prepend(ccard.origin)
}
cCardIterativeBuilder.init()