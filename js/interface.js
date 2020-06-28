let cCardHolder;
let cCardRegularBuilder;
let cCardIterativeBuilder;
let cCardCollectionBuilder;
let cCardCollectionHolder;
$(document).ready(function () {

    var regCard = {
        title: 'Test button',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc maximus sodales ex, non pellentesque dui condimentum quis. Cras sit amet nibh eu lacus fermentum dapibus non vel justo.',
        color: 'blue'
    }

    var iterCard = {
        title: 'Test iter button',
        color: 'green',
        values: [100, 223, 3111, 43232, 511112],
        autoRepeat: false,
        autoCopy: true,
        random: true,
    }

    cCardHolder = new CCardHolder()
    cCardRegularBuilder = new CCardRegularBuilder()
    cCardIterativeBuilder = new CCardIterativeBuilder()
    cCardCollectionBuilder = new CCardCollectionBuilder()
    cCardCollectionHolder = new CCardCollectionHolder()

    cCardCollectionBuilder.build = ccollection => {
        cCardCollectionHolder.append(ccollection)
        ccollection.origin.find('.dropdown-trigger').dropdown();
    }

    cCardRegularBuilder.build = ccard => {
        cCardHolder.prepend(DND.init(ccard.origin))
    }
    cCardIterativeBuilder.build = ccard => {
        cCardHolder.prepend(DND.init(ccard.origin))
    }
    cCardRegularBuilder.init()
    cCardIterativeBuilder.init()
    cCardCollectionBuilder.init()

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