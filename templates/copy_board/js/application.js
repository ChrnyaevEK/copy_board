class App {
    static collection_builder;
    static regular_card_builder;
    static number_card_builder;
    static text_card_builder;
    static card_holder;

    static cards = [
            {% autoescape off %}
            {%for item in cards%}
            {{item}},
            {%endfor%}
            {% endautoescape %}
        ]
}

{% if workspace %}
{% if collection_builder %}
App.collection_builder = new Vue({
    el: '#collection_builder',
    data: {
        title: '',
        color: '{{Constants.default_color}}',
        access_type: '{{Constants.default_access_type}}',
    },
    methods: {
        create: function(event){
            $.post({
                url : "{% url 'collection_create' %}",
                data: {
                    data: JSON.stringify({
                        title: this.title,
                        color: this.color,
                        access_type: this.access_type,
                    }),
                    csrfmiddlewaretoken: csrftoken,
                },
                success : (response) => { 
                    collection_holder.collections.unshift(response) 
                },
                error: (response) => { Toaster.toast(Toaster.error); cl (response) },
            })
        }
    }
})
{%endif%}

App.regular_card_builder = new Vue({
    el: '#regular_card_builder',
    data: {
        card: {},
        edition_mode: false,
    },
    methods: {
        open_for_edition: function(data) {
            this.card = deepCopy(plainVue(data))  // Vue to plain obj
            this.edition_mode = true  // Change buttons
            UI.card_builder.open(0)  // Open editor
        },
        update_create: function() {
            this.card.card_type = 'regular'
            Card.update_create(this.card)
                .done((response)=>{
                    App.card_holder.replace(response, true)
                    this.clean()
                })
                .fail((response)=>{
                    Toaster.toast(Toaster.error)
                })
        },
        clean: function() {
            this.card = {}
            this.edition_mode = false
        },
    }
})

App.number_card_builder = new Vue({
    el: '#number_card_builder',
    data: {
        card: {},
        edition_mode: false,
        expected: undefined,
        error: undefined,
    },
    watch: {
        'card.endless': function(val){
            if (val) this.random = false
            this.updateExpected()
        },
        'card.random': function(val){
            if (val) this.endless = false
        },
        'card.from_val': function() {this.updateExpected()},
        'card.to_val': function() {this.updateExpected()},
        'card.step_val': function() {this.updateExpected()},
    },
    methods: {
        open_for_edition: function(data) {
            this.card = deepCopy(plainVue(data))  // Vue to plain obj
            this.edition_mode = true  // Change buttons
            this.updateExpected()
            UI.card_builder.open(1)  // Open editor
        },
        update_create: function() {
            if (this.error) return
            this.card.card_type = 'number'
            Card.update_create(this.card)
                .done((response)=>{
                    App.card_holder.replace(response, true)
                    this.clean()
                })
                .fail((response)=>{
                    Toaster.toast(Toaster.error)
                })
        },
        updateExpected: function(){
            let to = parseFloat(this.card.to_val) || undefined
            let from = parseFloat(this.card.from_val) || undefined
            let step = parseFloat(this.card.step_val) || undefined
            to = this.card.endless ? step * 10 : to
            try {
                this.expected = `${JSON.stringify(range(from, to, step))} ${this.card.endless ? '...' : ''}`
            } catch (err) {
                this.expected = ''
                this.error = true
                return
            }
            if (!range(from, to, step).length) {
                this.expected = ''
                this.error = true
            } else {
                this.error = false
            }
        },
        clean: function() {
            this.card = {}
            this.expected = undefined
            this.error = undefined
            this.edition_mode = false
        },
    }
})

App.text_card_builder = new Vue({
    el: '#text_card_builder',
    data: {
        card: {},
        edition_mode: false,
        expected: undefined,
    },
    watch: {
        'card.delimeter': function(){this.updateExpected()},
        'card.content': function(){this.updateExpected()},
        'card.remove_whitespace': function(){this.updateExpected()},
    },
    methods: {
        open_for_edition: function(data) {
            this.card = deepCopy(plainVue(data))  // Vue to plain obj
            this.edition_mode = true  // Change buttons
            UI.card_builder.open(2)  // Open editor
        },
        update_create: function() {
            this.card.card_type = 'text'
            Card.update_create(this.card)
                .done((response)=>{
                    App.card_holder.replace(response, true)
                    this.clean()
                })
                .fail((response)=>{
                    Toaster.toast(Toaster.error)
                })
        },
        updateExpected: function(){
            if (this.card.delimiter && this.card.content) {
                let values = []
                for (let value of this.card.content.split(this.card.delimiter)) {
                    value = this.card.remove_whitespace ? value.trim() : value
                    if (value) values.push(value)
                }
                this.expected = values
            }
        },
        clean: function() {
            this.card = {}
            this.expected = undefined
            this.edition_mode = false
        },
    }
})

App.collection_holder = new Vue({
    el: '#collection_holder',
    data: {
        collections: [
        {% autoescape off %}
        {%for item in collections%}
        {{item}},
        {%endfor%}
        {% endautoescape %}
        ],
    },
    updated: function(){
            $('.dropdown-trigger').dropdown();
    }
})

App.card_holder = new Vue({
    el: '#card_holder',
    data: {
        cards: App.cards,
        componentKey: 0,
    },
    methods: {
        indexof: function(card){
            return this.cards.findIndex((el)=>{
                return el.id == card.id && el.card_type == card.card_type
            })
        },
        replace: function(card, insert) {
            let index = this.indexof(card)
            if (index == -1 && insert) {
                this.cards.unshift(card)
            } else if(index != -1){
                this.$set(this.cards, index, card)
                this.forceRerender()
            }
        },
        remove: function (card) {
            let index = this.indexof(card)
            this.cards.splice(index, 1)
        },
        forceRerender() {
            this.componentKey += 1;
        }
    },
    updated: function(){ 
        masonry.masonry('reloadItems').masonry();
        $('.dropdown-trigger').dropdown();
        DND.init()
    },
})
{%endif%}

class DND {
    static dragged
    static target

    static swap() {
        if (!DND.target.hasClass('dnd-dragged')) {
            var targetParent = DND.target.parent()
            DND.dragged.parent().append(DND.target)
            targetParent.append(DND.dragged)
            var dr = App.card_holder.cards[App.card_holder.cards.findIndex((el)=>{return el.index == DND.dragged.attr('index')})]
            var tr = App.card_holder.cards[App.card_holder.cards.findIndex((el)=>{return el.index == DND.target.attr('index')})]
            var mid = dr.index
            dr.index = tr.index
            tr.index = mid
            Promise.all([Card.update_create(dr), Card.update_create(tr)])
                .then(()=>{App.card_holder.$forceUpdate()}, 
                (response)=>{Toaster.toast(Toaster.error)})
            
        }
        DND.clean()
    }

    static clean() {
        DND.dragged = undefined
        DND.target = undefined
    }

    static init() {  // [draggable="true"].card
        for (let card of $('[class~="grid-item"]')) {
            card = $(card)
            card.on('dragstart', (event) => {
                var dragged = $(event.target).closest('[draggable="true"].card')
                dragged.addClass('dnd-dragged')
                DND.dragged = dragged
                $('[draggable="true"].card').addClass('dnd-dropzone')
            })

            card.on('dragend', (event) => {
                $('[draggable="true"].card').removeClass('dnd-dropzone').removeClass('dnd-dragged').removeClass('dnd-dragover')
            })

            card.on('dragenter', (event) => {
                __noEventPropagation(event)
                $('[draggable="true"].card').removeClass('dnd-dragover')
                var target = $(event.target).closest('[draggable="true"].card')
                target.addClass('dnd-dragover')
                DND.target = target
            })

            card.on('dragover', (event) => {
                __noEventPropagation(event)
            })

            card.on('drop', (event) => {
                __noEventPropagation(event)
                DND.swap()
            })
        }
    }
}

class Card {
    static copy(text) {
        if (text !== undefined) {
            copyNoFormat(text)
            Toaster.copied(text)
        } else {
            Toaster.copied(Toaster.empty)
        }
    }

    static post(url, card){
        return $.post({
            url: url,
            dataType: 'json',
            headers: {
                'X-CSRFToken': csrftoken
            },
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                ...plainVue(card),
                cid: '{{cid}}',
            })
        })
    }

    static remove(card) {  // TODO
            let url;
            if (card.card_type == 'regular') {
                url = "{% url 'card_remove' 'regular' %}"
            } else if (card.card_type == 'number') {
                url = "{% url 'card_remove' 'number' %}"
            } else if (card.card_type == 'text') {
                url = "{% url 'card_remove' 'text' %}"
            }
            return Card.post(url, card)
    }
    static update_create(card) {
            let url;
            if (card.card_type == 'regular') {
                url = "{% url 'card_update_create' 'regular' %}"
            } else if (card.card_type == 'number') {
                url = "{% url 'card_update_create' 'number' %}"
            } else if (card.card_type == 'text') {
                url = "{% url 'card_update_create' 'text' %}"
            }
            return Card.post(url, card)
    }
}

class UI {
    static _card_builder = $('#card_builder')
    static card_builder = {
        open: (index)=>{
            UI._card_builder.collapsible('open', index)
        }
    }
}

DND.init()

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
      });
});
