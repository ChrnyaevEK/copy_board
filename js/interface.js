$(document).ready(function () {

    var regCard = {
        title: 'Test button',
        content: 'Test button body',
        color: 'green'
    }

    var iterCard = {
        title: 'Test iter button',
        color: 'green',
        values: [1, 2, 3, 4, 5],
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
        cCardHolder.prepend(DND.init(ccard.origin))
    }
    cCardRegularBuilder.init()

    let cCardIterativeBuilder = new CCardIterativeBuilder()
    cCardIterativeBuilder.build = ccard => {
        cCardHolder.prepend(DND.init(ccard.origin))
    }
    cCardIterativeBuilder.init()

    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(regCard).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(regCard).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(regCard).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(regCard).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(regCard).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilder.CCard(iterCard).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilder.CCard(iterCard).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilder.CCard(iterCard).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilder.CCard(iterCard).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilder.CCard(iterCard).origin))
})