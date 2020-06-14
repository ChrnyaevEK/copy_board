var button = {
    title: 'Test button',
    description: 'Test description',
    content: 'Test button body',
    color: 'lime'
} 

class Data {
    hashCode = s => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
}

rbb = new RegularButtonBuilder()
rbb.init()
