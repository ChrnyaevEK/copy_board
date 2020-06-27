$(document).ready(function () {

    var regCard = {
        title: 'Test button',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc maximus sodales ex, non pellentesque dui condimentum quis. Cras sit amet nibh eu lacus fermentum dapibus non vel justo.',
        color: 'green'
    }

    var iterCard = {
        title: 'Test iter button',
        color: 'green',
        values: [100, 223, 3111, 43232, 511112],
        autoRepeat: false,
        autoCopy: true,
        random: true,
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

    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(deepCopy(regCard)).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(deepCopy(regCard)).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(deepCopy(regCard)).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(deepCopy(regCard)).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(deepCopy(regCard)).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilder.CCard(deepCopy(iterCard)).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilder.CCard(deepCopy(iterCard)).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilder.CCard(deepCopy(iterCard)).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilder.CCard(deepCopy(iterCard)).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilder.CCard(deepCopy(iterCard)).origin))
})