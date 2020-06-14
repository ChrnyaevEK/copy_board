class CCard extends Template{
    copyNoFormat(text) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    }
}

class CCardRegular extends CCard{
    constructor(data) {
        super('ccard-regular')
        this.color = data.color
        this.title = data.title
        this.description = data.description
        this.content = data.content
    }

    copyNoFormat() {
        if (this.body !== undefined ) super.copyNoFormat(this.body)
    }
}

class CCardBuilder {
    constructor() {
        this.origin = $('#ccard-builder')
        this.collapsible = M.Collapsible.getInstance(this.origin)
    }
}

class RegularCCardBuilder_ extends CCardBuilder{
    constructor() {
        super()
        this.toolIndex = 0
        this.workspace = this.origin.find('li.ccard-regular')
        this.title = this.workspace.find('[field=title]')
        this.description  = this.workspace.find('[field=description]')
        this.content = this.workspace.find('[field=content]')
        this.clearContent = this.workspace.find('[field=textarea-clear]')
        this.color = this.workspace.find('[field=color]')
        this.save = this.workspace.find('[field=save]')
    }

    init() {
        this.color.find('span').click((event)=>{
            __noEventPropagation(event)
            this.color.find('span').removeClass('active')
            $(event.target).addClass('active')
        })
        this.clearContent.click((event)=>{
            __noEventPropagation(event)
            if (this.content.val() && confirm('Are you sure? Text will be lost!')){                
                this.content.val('')
            }
        })
        this.title.change((event)=>{
            __noEventPropagation(event)
            if (this.title.val()) {
                this.save.removeAttr('disabled')
            } else {
                this.save.attr('disabled', '')
            }
        })
        this.save.click((event)=>{ 
            __noEventPropagation(event)
            this.onSave(this.generate())
        })
    }

    generate() {
        return {
            title: this.title.val(),
            description: this.description.val(),
            content: this.content.val(),
            color: this.color.find('.active').data('color')
        }
    }
}

class RegularCCardBuilder extends RegularCCardBuilder_ {
    onSave(data) { 
        // Called on save button request, generated data will be passed
    }
}

