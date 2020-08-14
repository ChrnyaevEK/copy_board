var collection_builder;
var regular_card_builder;
var number_card_builder;
var text_card_builder;
var card_holder;

Vue.component('collection', {
    props: ['data'],
    data: function(){
        return this.data
    },
    template: `
    {%verbatim%}
        <div class="card cc-collection lighten-4" v-bind:class="data.color">
            <div class="card-content valign-wrapper">
                <span class="cc-collection-title">
                    <a v-bind:href="data.href" class="truncate">{{title}}</a><label>{{data.access_type}}</label>
                </span>
            <i v-show="!data.is_main" class="dropdown-trigger material-icons blue-grey-text" v-bind:data-target="'dropdown-' + data.id">more_vert</i>
            </div>
            <ul v-bind:id="'dropdown-' + data.id" class="dropdown-content">
                <li><a class="blue-grey-text" v-on:click.prevent="remove">Delete</a></li>
            </ul>
        </div>`,
    {%endverbatim%}
    methods: {
        remove: function(){
            if (confirm(Toaster.confirmDeleteCollection)){
                let index = collection_holder.collections.findIndex((el)=> {return el.id == this.id})
                collection_holder.collections.splice(index, 1);
                $.post({
                    url : "{% url 'collection_remove' %}",
                    data: {
                        data: JSON.stringify({
                            id: this.id,
                        }),
                        csrfmiddlewaretoken: csrftoken,
                    },
                    success : (response) => { 
                        Toaster.toast(Toaster.removed); 
                    },
                    error:(response) => { Toaster.toast(Toaster.error); cl (response)},
                })
            }
        }
    }
})

Vue.component('regular_card', {
    props: ['data'],
    data: function(){
        return this.data
    },
    methods: {
        copy: function(){
            Card.copy(this.copy_content)
        },
        remove: function() {
            Card.remove(this)
        }
    },
    template: `
    <div class="card-regular ">
    {%verbatim%}
        <div v-bind:class="color" draggable="true" class="lighten-4 card" v-bind:index=index>
            <div class="card-content">
                <div class="flex-row">
                    <div class="card-title">{{title}}</div>
    {%endverbatim%}
                    {% if workspace %}
                    <i class="dropdown-trigger material-icons blue-grey-text" v-bind:data-target="'dropdown-card-reg-' + data.id">more_vert</i>
                    {%endif%}
                </div>
                {% if workspace %}
                <ul v-bind:id="'dropdown-card-reg-' + data.id" class="dropdown-content">
                    <li><a class="blue-grey-text" v-on:click.prevent="remove" href="#">Delete</a></li>
                </ul>
                {%endif%}
    {%verbatim%}
                <div class="card-regular-content">{{copy_content}}</div>
            </div>
            <div>
                <button v-bind:class="color" href="#!" draggable="false" v-on:click="copy" class="lighten-2 btn btn-wide copy truncate">copy</button>
            </div>
        </div>
    </div>
    {%endverbatim%}
    `
})

Vue.component('number_card', {
    props: ['data'],
    data: function(){
        return this.data
    },
    methods: {
        reload: function(){
            this.value = this.from_val
            if (this.auto_copy) Card.copy(this.value)
        },
        remove: function() {
            Card.remove(this)
        },
        copy: function(){
            Card.copy(this.value)
        },
        copyNext: function(){
            if (this.endless) {
                this.value += this.step_val
            } else if (!this.random && this.value + this.step_val < this.to_val) {
                this.value += this.step_val
            } else if (this.random) {
                this.value = rand(this.from_val, this.to_val, this.step_val)
            } else if (this.repeat) {
                this.value = this.from_val
            } else {
                Toaster.tost('Last value!')
                return
            }
            if (this.auto_copy) Card.copy(this.value)
        },
        copyPrev: function(){
            if (this.endless) {
                this.value -= this.step_val
            } else if (!this.random && this.value - this.step_val >= this.from_val) {
                this.value -= this.step_val
            } else if (this.random) {
                this.value = rand(this.from_val, this.to_val, this.step_val)
            } else if (this.repeat) {
                this.value = this.to_val
            } else {
                Toaster.toast('First value!')
                return
            }
            if (this.auto_copy) Card.copy(this.value)
        }
    },
    template: `
        <div class="card-iterative">
            <div v-bind:class="color" draggable="true" class="lighten-4 card" v-bind:index=index>
                <div class="card-content">
                    <div class="flex-row">                
    {%verbatim%}
                        <div class="card-title">{{title}}</div>
    {%endverbatim%}
                    {% if workspace %}<i class="dropdown-trigger material-icons blue-grey-text" v-bind:data-target="'dropdown-card-num-' + data.id">more_vert</i>{%endif%}
                    </div>
                    {% if workspace %}
                    <ul v-bind:id="'dropdown-card-num-' + data.id" class="dropdown-content">
                        <li><a class="blue-grey-text" v-on:click.prevent="remove" href="#">Delete</a></li>
                    </ul>
                    {%endif%}
    {%verbatim%}
                    <div class="card-iterative-content center-align">{{value}}</div>
                </div>
                <div class="cc-card-action">
                    <button v-bind:class="color" v-on:click="copyPrev" class="btn lighten-2"><i class="material-icons">navigate_before</i></button>
                    <button v-bind:class="color" v-on:click="reload" class="btn lighten-2"><i class="material-icons">loop</i></button>
                    <button v-bind:class="color" v-on:click="copy" class="btn btn-wide lighten-2 truncate">copy</button>
                    <button v-bind:class="color" v-on:click="copyNext" class="btn lighten-2"><i class="material-icons">navigate_next</i></button>
                </div>
            </div>
        </div>
    {%endverbatim%}
    `
})

Vue.component('text_card', {
    props: ['data'],
    data: function(){
       return this.data
    },
    methods: {
        reload: function(){
            this.last_index = 0
            if (this.auto_copy) Card.copy(this.values[this.last_index])
        },
        copy: function(){
            Card.copy(this.value)
        },
        remove: function() {
            Card.remove(this)
        },
        copyNext: function(){
            if (this.last_index < this.values.length - 1) {
                this.last_index += 1
            } else {
                if (this.repeat) {
                    this.last_index = 0
                } else {
                    Toaster.toast('Last value!')
                    return
                }
            }
            this.setValue()
            if (this.auto_copy) Card.copy(this.value)
        },
        copyPrev: function(){
            if (this.last_index > 0) {
                this.last_index -= 1
            } else {
                if (this.repeat) {
                    this.last_index = this.values.length - 1
                } else {
                    Toaster.toast('First value!')
                    return
                }
            }
            this.setValue()
            if (this.auto_copy) { Card.copy(this.value) }
        },
        setValue: function(){
            this.value = this.values[this.last_index]
            {% if workspace %}card_holder.$forceUpdate(){%endif%}
        } 
    },
    template: `
        <div class="card-iterative ">
    {%verbatim%}
        <div v-bind:class="color" draggable="true" class="lighten-4 card" v-bind:index=index>
                <div class="card-content">
                    <div class="flex-row">
                        <div class="card-title">{{title}}</div>
    {%endverbatim%}
                        {% if workspace %}<i class="dropdown-trigger material-icons blue-grey-text" v-bind:data-target="'dropdown-card-txt-' + data.id">more_vert</i>{%endif%}                    
                    </div>
    {%verbatim%}
            <div class="card-iterative-content center-align">{{value}}</div>
    {%endverbatim%}
                </div>
                {% if workspace %}
                <ul v-bind:id="'dropdown-card-txt-' + data.id" class="dropdown-content">
                    <li><a class="blue-grey-text" v-on:click.prevent="remove" href="#">Delete</a></li>
                </ul>
                {%endif%}
    {%verbatim%}
                <div class="cc-card-action">
                    <button v-bind:class="color" v-on:click="copyPrev" class="btn lighten-2"><i class="material-icons">navigate_before</i></button>
                    <button v-bind:class="color" v-on:click="reload" class="btn lighten-2"><i class="material-icons">loop</i></button>
                    <button v-bind:class="color" v-on:click="copy" class="btn btn-wide lighten-2 truncate">copy</button>
                    <button v-bind:class="color" v-on:click="copyNext" class="btn lighten-2"><i class="material-icons">navigate_next</i></button>
                </div>
            </div>
        </div>
    {%endverbatim%}
    `
})
 
{% if workspace %}
{% if collection_builder %}
collection_builder = new Vue({
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

regular_card_builder = new Vue({
    el: '#regular_card_builder',
    data: {
        card: {},
    },
    methods: {
        create: function(){
            $.post({
                url : "{% url 'card_create' 'regular' %}",
                data: {
                    data: JSON.stringify({
                        ...this.card,
                        c_id: '{{c_id}}',
                    }),
                    csrfmiddlewaretoken: csrftoken,
                },            
                success : (response) => { card_holder.cards.unshift(response) },
                error:(response) => { Toaster.toast(Toaster.error); cl (response)},
            })
        }
    }
})

number_card_builder = new Vue({
    el: '#number_card_builder',
    data: {
        card: {},
        expected: '',
        error: '',
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
        create: function() {
            if (this.error) return
            $.post({
                url : "{% url 'card_create' 'number' %}",
                data: {
                    data: JSON.stringify({
                        ...this.card,
                        c_id: '{{c_id}}',
                    }),
                    csrfmiddlewaretoken: csrftoken,
                },   
                success : (response) => { card_holder.cards.unshift(response) },
                error:(response) => { Toaster.toast(Toaster.error); cl (response) },
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
        }
    }
})

text_card_builder = new Vue({
    el: '#text_card_builder',
    data: {
        card: {},
        expected: '',
    },
    watch: {
        'card.delimeter': function(){this.updateExpected()},
        'card.content': function(){this.updateExpected()},
        'card.remove_whitespace': function(){this.updateExpected()},
    },
    methods: {
        create: function() {
            $.post({
                url : "{% url 'card_create' 'text'%}",
                data: {
                    data: JSON.stringify({
                        ...this.card,
                        c_id: '{{c_id}}',
                    }),
                    csrfmiddlewaretoken: csrftoken,
                },
                success : (response) => { 
                    card_holder.cards.unshift(response) 
                },
                error:(response) => {Toaster.toast(Toaster.error); cl (response) },
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
        }
    }
})

collection_holder = new Vue({
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

card_holder = new Vue({
    el: '#card_holder',
    data: {
        cards: [
            {% autoescape off %}
            {%for item in cards%}
            {{item}},
            {%endfor%}
            {% endautoescape %}
        ],
    },
    updated: function(){ 
        masonry.masonry('reloadItems').masonry();
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
            var dr = card_holder.cards[card_holder.cards.findIndex((el)=>{return el.index == DND.dragged.attr('index')})]
            var tr = card_holder.cards[card_holder.cards.findIndex((el)=>{return el.index == DND.target.attr('index')})]
            var mid = dr.index
            dr.index = tr.index
            tr.index = mid
            Card.update(dr)
            Card.update(tr)
            card_holder.$forceUpdate()
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
    static remove(card) {
        if (confirm(Toaster.confirmDeleteCard)){
            let index = card_holder.cards.findIndex((el)=>{
                return el.id == card.id && el.card_type == card.card_type
            })
            if (index !== undefined) {
                card_holder.cards.splice(index, 1)
            }
            let url;
            if (card.card_type == 'regular') {
                url = "{% url 'card_remove' 'regular' %}"
            } else if (card.card_type == 'number') {
                url = "{% url 'card_remove' 'number' %}"
            } else if (card.card_type == 'text') {
                url = "{% url 'card_remove' 'text' %}"
            }
            $.post({
                url : url,
                data: {
                    data: JSON.stringify({
                        c_id: '{{c_id}}',
                        id: card.id,
                    }),
                    csrfmiddlewaretoken: csrftoken,
                },
                success : (response) => { 
                    Toaster.toast(Toaster.removed); 
                },
                error:(response) => { Toaster.toast(Toaster.error); cl (response)},
            })
        }
    }
    static update(card) {
            let url;
            if (card.card_type == 'regular') {
                url = "{% url 'card_update' 'regular' %}"
            } else if (card.card_type == 'number') {
                url = "{% url 'card_update' 'number' %}"
            } else if (card.card_type == 'text') {
                url = "{% url 'card_update' 'text' %}"
            }
            $.post({
                url : url,
                data: {
                    data: JSON.stringify({
                        ...card,
                        c_id: '{{c_id}}',
                    }),
                    csrfmiddlewaretoken: csrftoken,
                },
                error:(response) => { Toaster.toast(Toaster.error); cl (response)},
            })
    }
}

DND.init()