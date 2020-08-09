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
        horizontalOrder: true,
        transitionDuration: '0.6s'
      });
});
