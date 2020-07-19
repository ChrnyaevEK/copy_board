/**
 * Class wraps Jquery element and implements parse(filling) logic
 * Parser should fill element with data
 */
class Block {
    constructor(element) {
        // JQ element (clone of template)
        this.origin = element
        // Stores references to appended objects
        this.content = []
    }

    /**
     * Function apply parser on this.origin
     * @param {object} [data] data to pass into parser
     * @param {function(tag, data)} parser function to fill element with data
     * @example
     * tag = $('<div></div>')
     * parser = (tag, data)=>{tag.find('div').text(data.text)}
     * block = new Block(tag)
     * block.init({text:'PUT ME INTO DIV'}, parser)
     * Expected: block.origin ---> <div>PUT ME INTO DIV</div>
     */
    init(data, parser) {
        parser.call(this, this.origin, data)
    }

    /**
     * Append block.origin to this.origin
     * @param {Block} block object to append
     */
    append(block) {
        if (Array.isArray(block)) {
            this.content.push(...block)
            for (let subBlock of block) {
                this.origin.append(subBlock.origin)
            }
        } else {
            this.content.push(block)
            this.origin.append(block.origin)
        }
    }

    /**
     * Prepend block.origin to this.origin
     * @param {Block} block object to append
     */
    prepend(block) {
        if (Array.isArray(block)) {
            this.content.unshift(...block)
            for (let subBlock of block) {
                this.origin.prepend(subBlock.origin)
            }
        } else {
            this.content.unshift(block)
            this.origin.prepend(block.origin)
        }
    }

    clean() {
        this.origin.empty()
        this.content = []
    }

    hide() { this.origin.addClass('hidden') }

    show() { this.origin.removeClass('hidden') }

    isHidden() { return this.origin.hasClass('hidden') }
}

/**
 * class wraps Block to implement template logic
 * @extends Block
 */
class Template extends Block {
    /**
     * Pass a template name
     * @param {string} template name of template
     */
    constructor(template) {
        super($(`.${template}.template`).clone())
        this.origin.removeClass('template')
    }
}

// -------------------------------------------------------------------------
class CCard extends Template {
    copyNoFormat(text) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    }

    static toast(text) {
        M.toast({
            displayLength: 1500,
            html: `<span><span class="ccard-copy-toast">${text === undefined ? 'Nothing to copy!' : text}</span><div><span class="right">Copied!</span></div></span>`,
        })
    }
}

// ------------------------------------------------------------------------- 

class CCardRegularBuilder extends Block {
    CCard = class extends CCard {
        constructor(data) {
            super('ccard-regular')
            this.origin.find('[field=color] ,[field=color] a').addClass(data.color)
            this.origin.find('[field=title]').text(data.title)
            if (data.content) {
                this.origin.find('[field=content]').text(data.content).removeClass('hidden')
                this.origin.find('[field=copy]').click((event) => {
                    __noEventPropagation(event)
                    this.copyNoFormat()
                })
            }
            this.content = data.content
        }

        copyNoFormat() {
            if (this.content !== undefined) {
                super.copyNoFormat(this.content)
                CCard.toast(this.content)
            } else {
                CCard.toast()
            }
        }
    }

    constructor() {
        super($('#ccard-builder li.ccard-builder-regular form'))
        this.title = this.origin.find('[name=title]')
        this.copy_content = this.origin.find('[name=copy_content]')
        this.save = this.origin.find('[type=submit]')
    }

    init() {
        this.origin.change((event) => {
            __noEventPropagation(event)
            this.validate()
        })

        this.origin.ajaxForm({
            url : '/copy_board/ccard/regular/create/',
            success : (response) => { this.build(new this.CCard(response)) },
            error:()=>{ alert('An error occurred, try again later..') },
        })
    }

    validate() {
        if (this.title.val() && this.copy_content.val()) {
            this.save.removeAttr('disabled')
        } else {
            this.save.attr('disabled', '')
        }
    }
}

class CCardIterativeBuilderNumbers extends Block {
    CCard = class extends CCard {
        constructor(data) {
            super('ccard-iterative')

            this.from = data.from
            this.to = data.to
            this.step = data.step
            this.endless = data.endless
            this.lastValue = data.from
            this.autoRepeat = data.autoRepeat
            this.autoCopy = data.autoCopy
            this.random = data.random

            this.origin.find('[field=color], [field=color] a').addClass(data.color)
            this.origin.find('[field=title]').text(data.title)
            this.origin.find('[field=copy-prev]').click((event) => {
                __noEventPropagation(event)
                this.copyPrevious()
            })
            this.origin.find('[field=copy]').click((event) => {
                __noEventPropagation(event)
                this.copyNoFormat()
            })
            this.origin.find('[field=copy-next]').click((event) => {
                __noEventPropagation(event)
                this.copyNext()
            })
            this.origin.find('[field=reload]').click((event) => {
                __noEventPropagation(event)
                this.lastValue = this.from
                if (this.autoCopy) this.copyNoFormat()
                this.updateValue()
            })
            this.updateValue()
        }

        copyPrevious() {
            if (!this.random && this.lastValue - this.step >= this.from) {
                this.lastValue -= this.step
            } else if (this.random) {
                this.lastValue = rand(this.from, this.to, this.step)
            } else if (this.autoRepeat) {
                this.lastValue = this.from
            } else {
                CCard.toast('--- No values before ---')
                return
            }

            this.updateValue()
            if (this.autoCopy) {
                this.copyNoFormat()
            }
        }

        copyNext() {
            if (!this.random && this.lastValue + this.step < this.to) {
                this.lastValue += this.step
            } else if (this.random) {
                this.lastValue = rand(this.from, this.to, this.step)
            } else if (this.autoRepeat) {
                this.lastValue = this.to
            } else {
                CCard.toast('--- No values after ---')
                return
            }
            this.updateValue()
            if (this.autoCopy) this.copyNoFormat()
        }

        copyNoFormat() {
            if (this.lastValue) {
                super.copyNoFormat(this.lastValue)
                CCard.toast(this.lastValue)
            } else {
                CCard.toast()
            }
        }

        updateValue() {
            this.origin.find('[field=value]').text(this.lastValue)
            CCardHolder.update()
        }
    }

    constructor() {
        super($('#ccard-builder li.ccard-builder-iterative-num form'))

        this.valid = false

        this.title = this.origin.find('[name=title]')
        this.from_val = this.origin.find('[name=from_val]')
        this.to_val = this.origin.find('[name=to_val]')
        this.step_val = this.origin.find('[name=step_val]')
        this.endless = this.origin.find('[name=endless]')
        this.repeat = this.origin.find('[name=repeat]')
        this.random = this.origin.find('[name=random]')
        this.auto_copy = this.origin.find('[name=auto_copy]')
        this.expected = this.origin.find('[field=expected]')
        this.error = this.origin.find('[field=error]')
        this.save = this.origin.find('[type=submit]')
    }

    init() {
        this.origin.change((event) => {
            __noEventPropagation(event)
            if (this.endless.prop('checked')) {
                this.random.prop('checked', false).attr('disabled', '')
                this.to_val.attr('disabled', '')
            } else {
                this.to_val.removeAttr('disabled')
                this.random.removeAttr('disabled')
            }
            if (this.random.prop('checked')) {
                this.endless.prop('checked', false).attr('disabled', '')
                this.repeat.prop('checked', true).attr('disabled', '')
            } else {
                this.repeat.removeAttr('disabled')
                this.endless.removeAttr('disabled')
            }
            this.parseRangeInput()
        })
        this.origin.ajaxForm({
            url : '/copy_board/ccard/iter/number/create/',
            success : (response) => { this.build(new this.CCard(response)) },
            error:()=>{ alert('An error occurred, try again later..') },
        })
    }

    parseRangeInput() {
        let from = parseInt(this.from_val.val())
        let to = parseInt(this.to_val.val())
        let step = parseInt(this.step_val.val())
        let endless = this.endless.prop('checked')
        if (from !== NaN && to !== NaN && step !== NaN) {
            try {
                to = endless ? step * 10 : to
                this.expected.text(`${JSON.stringify(range(from, to, step))} ${endless ? '...' : ''}`)
            } catch (err) {
                this.expected.text('')
                this.error.text('This range may not be created...').removeClass('hidden')
                this.valid = false
                return
            }
            this.error.text('').addClass('hidden')
            if (range(from, to, step).length) {
                this.valid = true
            } else {
                this.valid = false
                this.error.text('Empty range may not be created...').removeClass('hidden')
            }
            this.validate()
        } else {
            this.valid = false
        }
    }

    validate() {
        if (this.title.val().trim() && this.valid) {
            this.save.removeAttr('disabled')
            return
        }
        this.save.attr('disabled', '')
    }
}

class CCardIterativeBuilderText extends Block  {
    CCard = class extends CCard {
        lastIndex = 0;
        constructor(data) {
            super('ccard-iterative')
            this.values = data.values
            this.autoRepeat = data.autoRepeat
            this.autoCopy = data.autoCopy
            this.random = data.random
            if (this.random) shuffle(this.values)
            this.origin.find('[field=color], [field=color] a').addClass(data.color)
            this.origin.find('[field=title]').text(data.title)
            this.origin.find('[field=copy-prev]').click((event) => {
                __noEventPropagation(event)
                this.copyPrevious()
            })
            this.origin.find('[field=copy]').click((event) => {
                __noEventPropagation(event)
                this.copyNoFormat()
            })
            this.origin.find('[field=copy-next]').click((event) => {
                __noEventPropagation(event)
                this.copyNext()
            })
            this.origin.find('[field=reload]').click((event) => {
                __noEventPropagation(event)
                this.lastIndex = 0
                if (this.random) shuffle(this.values)
                this.updateValue()
                if (this.autoCopy) this.copyNoFormat()
            })
            this.updateValue()
        }

        copyPrevious() {
            if (this.lastIndex > 0) {
                this.lastIndex -= 1
            } else {
                if (this.autoRepeat) {
                    this.lastIndex = this.values.length - 1
                } else {
                    CCard.toast('First value!')
                    return
                }
            }
            this.updateValue()
            if (this.autoCopy) {
                this.copyNoFormat()
            }
        }

        copyNext() {
            if (this.lastIndex < this.values.length - 1) {
                this.lastIndex += 1
            } else {
                if (this.autoRepeat) {
                    this.lastIndex = 0
                } else {
                    CCard.toast('Last value!')
                    return
                }
            }
            this.updateValue()
            if (this.autoCopy) this.copyNoFormat()
        }

        copyNoFormat() {
            if (this.values) {
                super.copyNoFormat(this.values[this.lastIndex])
                CCard.toast(this.values[this.lastIndex])
            } else {
                CCard.toast()
            }
        }

        updateValue() {
            this.origin.find('[field=value]').text(this.values[this.lastIndex])
            CCardHolder.update()
        }
    }

    constructor() {
        super($('#ccard-builder li.ccard-builder-iterative'))
        this.title = this.origin.find('[field=title]')
        this.valid = false
        this.values = undefined
        this.delimiter = this.origin.find('[field="delimiter"]')
        this.content = this.origin.find('[field="content"]')
        this.expected = this.origin.find('[field="expected"]')
        this.color = this.origin.find('[field="color"]')
        this.save = this.origin.find('[field="save"]')
    }

    init() {
        this.color.find('span').click((event) => {
            __noEventPropagation(event)
            this.color.find('span').removeClass('active')
            $(event.target).addClass('active')
        })
        this.title.change((event) => {
            __noEventPropagation(event)
            this.parseSetInput()
        })
        this.save.click((event) => {
            __noEventPropagation(event)
            this.build(new this.CCard(this.parse()))
        })
        this.origin.find('[field="delimiter"], [field="content"], [field="remove-whitespace"]').change((event) => {
            __noEventPropagation(event)
            this.parseSetInput()
        })

    }

    parseSetInput() {
        let delimiter = this.delimiter.val()
        let content = this.content.val()
        if (delimiter && content) {
            let values = []
            for (let value of content.split(delimiter)) {
                value = this.origin.find('[field="remove-whitespace"]').prop('checked') ? value.trim() : value
                if (value) values.push(value)
            }
            this.expected.text(JSON.stringify(values))
            this.values = values
            this.valid = true
            this.validate()
        } else {
            this.valid = false
        }
    }

    validate() {
        if (this.title.val().trim() && this.valid) {
            this.save.removeAttr('disabled')
            return
        }
        this.save.attr('disabled', '')

    }

    parse() {
        return {
            title: this.title.val(),
            color: this.color.find('.active').data('color'),
            values: this.values,
            autoRepeat: this.origin.find('[field="repeat"]').prop('checked'),
            autoCopy: this.origin.find('[field="copy"]').prop('checked'),
            random: this.origin.find('[field="random"]').prop('checked'),
        }

    }
}

class CCardCollectionBuilder extends Block  {

    CCardCollection = class extends Template {
        constructor(data) {
            super('ccollection')
            this.uid = UIDBuilder.generateUID()
            this.origin.find('[field=title]').text(data.title)
            this.origin.find('a[data-target]').attr('data-target', UIDBuilder.buildUID('dropdown', this.uid))
            this.origin.find('ul').attr('id', UIDBuilder.buildUID('dropdown', this.uid))
        }
    }

    constructor() {
        super($('#ccollection-builder'))
        this.title = this.origin.find('[field=title]')
        this.save = this.origin.find('[field=save]')
    }

    init() {
        this.origin.change((event) => {
            __noEventPropagation(event)
            this.validate()
        })
        this.origin.ajaxForm({
            url : '/copy_board/ccollection/create/',
            success : (response) => { 
                this.build(new this.CCardCollection(response))
            },
            error:()=>{
                alert('An error occurred, try again later..')  // TODO
            }
        })
    }

    validate() {
        if (this.title.val()) {
            this.save.removeAttr('disabled')
        } else {
            this.save.attr('disabled', '')
        }
    }
}

// ------------------------------------------------------------------------- CCard holder
class CCardHolder {
    append(origin) {
        masonry.masonry()
            .append(origin)
            .masonry('appended', origin)
            .masonry();
    }

    prepend(origin) {
        masonry.masonry()
            .prepend(origin)
            .masonry('prepended', origin)
            .masonry();
    }
    static update() {
        masonry.masonry()
    }
}

class CCardCollectionHolder extends Block {
    constructor() {
        super($('#ccollection-holder'))
    }
}
