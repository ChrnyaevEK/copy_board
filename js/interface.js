var cCard = {
    title: 'Test button',
    content: 'Test button body',
    color: 'lime'
}

class Data {
    hashCode = s => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
}

let cCardHolder = new CCardHolder()
let cCardRegularBuilder = new CCardRegularBuilder()
cCardRegularBuilder.onSave = data => {
    cCardHolder.prepend(new CCardRegular(data))
}
cCardRegularBuilder.init()