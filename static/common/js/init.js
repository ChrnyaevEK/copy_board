var masonry;
let cCardHolder;
let cCardRegularBuilder;
let cCardIterativeBuilder;
let cCardCollectionBuilder;
let cCardCollectionHolder;

$(document).ready(function () {
    $('.sidenav').sidenav();
    $('.modal').modal();
    $('.datepicker').datepicker();
    $('.tooltipped').tooltip();
    $('select').formSelect();
    $('.collapsible').collapsible();
    $('.fixed-action-btn').floatingActionButton();
    $('.dropdown-trigger').dropdown();
    $('.tabs').tabs();
    masonry = $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: '.grid-item',
        percentPosition: true,
        gutter: 3,
        horizontalOrder: true,
        transitionDuration: '0.6s'
      });
});

$(document).ready(function () {
    var regCard = {
        title: 'Test button',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc maximus sodales ex, non pellentesque dui condimentum quis. Cras sit amet nibh eu lacus fermentum dapibus non vel justo.',
        color: 'blue'
    }

    var iterCard = {
        title: 'Test iter button',
        color: 'green',
        from: 12,
        to: 44,
        step: 10,
        autoCopy: true,
        random: false,
    }

    cCardHolder = new CCardHolder()
    cCardRegularBuilder = new CCardRegularBuilder()
    cCardIterativeBuilderNumbers = new CCardIterativeBuilderNumbers()
    cCardIterativeBuilderText = new CCardIterativeBuilderText()
    // cCardCollectionBuilder = new CCardCollectionBuilder()
    // cCardCollectionHolder = new CCardCollectionHolder()

    // cCardCollectionBuilder.build = ccollection => {
    //     cCardCollectionHolder.append(ccollection)
    //     ccollection.origin.find('.dropdown-trigger').dropdown();
    // }

    cCardRegularBuilder.build = ccard => {
        cCardHolder.prepend(DND.init(ccard.origin))
    }
    cCardIterativeBuilderNumbers.build = ccard => {
        cCardHolder.prepend(DND.init(ccard.origin))
    }
    cCardIterativeBuilderText.build = ccard => {
        cCardHolder.prepend(DND.init(ccard.origin))
    }
    cCardRegularBuilder.init()
    cCardIterativeBuilderNumbers.init()
    cCardIterativeBuilderText.init()
    // cCardCollectionBuilder.init()

    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(deepCopy(regCard)).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(deepCopy(regCard)).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(deepCopy(regCard)).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(deepCopy(regCard)).origin))
    cCardHolder.prepend(DND.init(new cCardRegularBuilder.CCard(deepCopy(regCard)).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilderNumbers.CCard(deepCopy(iterCard)).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilderNumbers.CCard(deepCopy(iterCard)).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilderNumbers.CCard(deepCopy(iterCard)).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilderNumbers.CCard(deepCopy(iterCard)).origin))
    cCardHolder.prepend(DND.init(new cCardIterativeBuilderNumbers.CCard(deepCopy(iterCard)).origin))
})