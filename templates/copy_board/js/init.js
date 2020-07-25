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
    cCardHolder = new CCardHolder()
    cCardRegularBuilder = new CCardRegularBuilder()
    cCardIterativeBuilderNumbers = new CCardIterativeBuilderNumbers()
    cCardIterativeBuilderText = new CCardIterativeBuilderText()
    cCardCollectionBuilder = new CCardCollectionBuilder()
    cCardCollectionHolder = new CCardCollectionHolder()

    cCardCollectionBuilder.build = ccollection => {
        cCardCollectionHolder.append(ccollection)
        ccollection.origin.find('.dropdown-trigger').dropdown();
    }

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
    cCardCollectionBuilder.init()
    {% autoescape off %}
    {% for item in collections %}
        cCardCollectionHolder.append(new cCardCollectionBuilder.CCardCollection({{item}}))
    {% endfor %}
    {% for item in cards %}
        {% if item.0 == 'reg' %}
            cCardHolder.append(DND.init(new cCardRegularBuilder.CCard({{ item.1 }}).origin))
        {% elif item.0 == 'num' %}
            cCardHolder.append(DND.init(new cCardIterativeBuilderNumbers.CCard({{ item.1 }}).origin))
        {% else %}
            cCardHolder.append(DND.init(new cCardIterativeBuilderText.CCard({{ item.1 }}).origin))
        {% endif %}
    {% endfor %}
    {% endautoescape %}
    $('.dropdown-trigger').dropdown();
})