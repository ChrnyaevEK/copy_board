

Vue.component('collection', {
    props: ['data'],
    data: function(){
        return this.data
    },
    template: `
        <div class="card cc-collection lighten-4" v-bind:class="data.color">
            <div class="card-content valign-wrapper">
                <span class="cc-collection-title">
        {%verbatim%}<a v-bind:href="data.href" class="truncate">{{title}}</a><label>{{data.access_type}}</label>{%endverbatim%}
                </span>
            <i v-show="!data.is_main" class="dropdown-trigger material-icons {{main_color}}-text" v-bind:data-target="'dropdown-' + data.id">more_vert</i>
            </div>
            <ul v-bind:id="'dropdown-' + data.id" class="dropdown-content">
                <li><a class="{{main_color}}-text" v-on:click.prevent="remove">Delete</a></li>
            </ul>
        </div>`,
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
            if (confirm(Toaster.confirmDeleteCard)){
                Card.remove(this)
                    .done(()=>{
                        App.card_holder.remove(this)
                    })
                    .fail(()=>{
                        Toaster.toast(Toaster.error)
                    })
            }
        },
        edit: function() {
            App.regular_card_builder.open_for_edition(this)
        }
    },
    template: `
    <div class="card-regular">
        <div v-bind:class="color" draggable="true" class="lighten-4 card" v-bind:index=index>
            <div class="card-content">
    {%verbatim%}<div class="card-title">{{title}}</div>{%endverbatim%}
                {% if workspace %}
                <ul v-bind:id="'dropdown-card-reg-' + data.id" class="dropdown-content">
                    <li><a class="{{main_color}}-text" v-on:click.prevent="edit" href="#">edit</a></li>
                    <li><a class="{{main_color}}-text" v-on:click.prevent="remove" href="#">remove</a></li>
                </ul>
                {%endif%}
    {%verbatim%}<div class="card-regular-content">{{copy_content}}</div>{%endverbatim%}
            </div>
            <div class="flex-row valign-wrapper">
                <button v-bind:class="color" href="#!" draggable="false" v-on:click="copy" class="btn btn-wide copy lighten-2 truncate">copy</button>
                {% if workspace %}
                <a v-bind:class="color" class="lighten-2 btn btn-slim"><i class="dropdown-trigger material-icons white-text" v-bind:data-target="'dropdown-card-reg-' + data.id">more_vert</i></a>
                {%endif%}
            </div>
        </div>
    </div>
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
            if (confirm(Toaster.confirmDeleteCard)){
                Card.remove(this)
                    .done(()=>{
                        App.card_holder.remove(this)
                    })
                    .fail(()=>{
                        Toaster.toast(Toaster.error)
                    })
            }
        },
        edit: function() {
            App.number_card_builder.open_for_edition(this)
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
            {%verbatim%}<div class="card-title">{{title}}</div>{%endverbatim%}
                    {% if workspace %}
                    <ul v-bind:id="'dropdown-card-num-' + data.id" class="dropdown-content">
                        <li><a class="{{main_color}}-text" v-on:click.prevent="edit" href="#">edit</a></li>
                        <li><a class="{{main_color}}-text" v-on:click.prevent="remove" href="#">remove</a></li>
                    </ul>
                    {%endif%}
        {%verbatim%}<div class="card-iterative-content center-align">{{value}}</div>{%endverbatim%}
                </div>
                <div class="cc-card-action">
                    <button v-bind:class="color" v-on:click="copyPrev" class="btn lighten-2"><i class="material-icons">navigate_before</i></button>
                    <button v-bind:class="color" v-on:click="reload" class="btn lighten-2"><i class="material-icons">loop</i></button>
                    <button v-bind:class="color" v-on:click="copy" class="btn btn-wide lighten-2 truncate">copy</button>
                    <button v-bind:class="color" v-on:click="copyNext" class="btn lighten-2"><i class="material-icons">navigate_next</i></button>
  {% if workspace %}<a v-bind:class="color" class="lighten-2 btn btn-slim"><i class="dropdown-trigger material-icons white-text" v-bind:data-target="'dropdown-card-num-' + data.id">more_vert</i></a>{%endif%}
                </div>
            </div>
        </div>
    
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
        edit: function() {
            App.text_card_builder.open_for_edition(this)
        },
        remove: function() {
            if (confirm(Toaster.confirmDeleteCard)){
                Card.remove(this)
                    .done(()=>{
                        App.card_holder.remove(this)
                    })
                    .fail(()=>{
                        Toaster.toast(Toaster.error)
                    })
            }
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
            {% if workspace %} App.card_holder.$forceUpdate(){%endif%}
        } 
    },
    template: `
        <div class="card-iterative ">
        <div v-bind:class="color" draggable="true" class="lighten-4 card" v-bind:index=index>
                <div class="card-content">
        {%verbatim%}<div class="card-title">{{title}}</div>{%endverbatim%}
        {%verbatim%}<div class="card-iterative-content center-align">{{value}}</div>{%endverbatim%}
                </div>
                {% if workspace %}
                <ul v-bind:id="'dropdown-card-txt-' + data.id" class="dropdown-content">
                    <li><a class="{{main_color}}-text" v-on:click.prevent="edit" href="#">edit</a></li>
                    <li><a class="{{main_color}}-text" v-on:click.prevent="remove" href="#">Delete</a></li>
                </ul>
                {%endif%}
                <div class="cc-card-action">
                    <button v-bind:class="color" v-on:click="copyPrev" class="btn lighten-2"><i class="material-icons">navigate_before</i></button>
                    <button v-bind:class="color" v-on:click="reload" class="btn lighten-2"><i class="material-icons">loop</i></button>
                    <button v-bind:class="color" v-on:click="copy" class="btn btn-wide lighten-2 truncate">copy</button>
                    <button v-bind:class="color" v-on:click="copyNext" class="btn lighten-2"><i class="material-icons">navigate_next</i></button>
  {% if workspace %}<a v-bind:class="color" class="lighten-2 btn btn-slim"><i class="dropdown-trigger material-icons white-text" v-bind:data-target="'dropdown-card-txt-' + data.id">more_vert</i></a>{%endif%}
                </div>
            </div>
        </div>
    `
})
 