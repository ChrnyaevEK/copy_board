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
            html: `<span><span class="ccard-copy-toast">${text === undefined ? 'Nothing to copy!': text}</span><div><span class="right">Copied!</span></div></span>`,
        })
    }
}

class ICCardBuilder extends Block {
    CCard = class { }
    init() {  // Will init JS for element
        throw Error('Not implemented')
    };

    // --- Override ---
    build(ccard) {  // Called on save event, CCard object will be passed
        throw Error('Not implemented')
    };
}

// ------------------------------------------------------------------------- 

class CCardRegularBuilder extends ICCardBuilder {
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
        super($('#ccard-builder li.ccard-builder-regular'))
        this.title = this.origin.find('[field=title]')
        this.content = this.origin.find('[field=content]')
        this.clearContent = this.origin.find('[field=textarea-clear]')
        this.color = this.origin.find('[field=color]')
        this.save = this.origin.find('[field=save]')
    }

    init() {
        this.color.find('span').click((event) => {
            __noEventPropagation(event)
            this.color.find('span').removeClass('active')
            $(event.target).addClass('active')
        })
        this.clearContent.click((event) => {
            __noEventPropagation(event)
            if (this.content.val() && confirm('Are you sure? Text will be lost!')) {
                this.content.val('')
            }
        })
        this.title.change((event) => {
            __noEventPropagation(event)
            if (this.title.val()) {
                this.save.removeAttr('disabled')
            } else {
                this.save.attr('disabled', '')
            }
        })
        this.save.click((event) => {
            __noEventPropagation(event)
            this.build(new this.CCard(this.generate()))
        })
    }

    generate() {
        return {
            title: this.title.val(),
            content: this.content.val(),
            color: this.color.find('.active').data('color')
        }
    }
}


class CCardIterativeBuilder extends ICCardBuilder {
    CCard = class extends CCard {
        lastIndex = 0;
        values; repeat; random;
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
        this.typeRange = {
            valid: false,
            header: this.origin.find('.tabs a[href="#over-range-of-num"]'),
            tab: this.origin.find('#over-range-of-num'),
            values: undefined,
        }
        this.typeSet = {
            valid: false,
            header: this.origin.find('.tabs a[href="#over-set-of-values"]'),
            tab: this.origin.find('#over-set-of-values'),
            values: undefined,
        }
        this.expected = this.origin.find('[field="expected-values"]')
        this.error = this.origin.find('[field="error"]')
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
            this.parseRangeInput()
            this.parseSetInput()
        })
        this.save.click((event) => {
            __noEventPropagation(event)
            this.build(new this.CCard(this.generate()))
        })
        this.typeRange.tab.find('[field="from"], [field="to"], [field="step"]').change((event) => {
            __noEventPropagation(event)
            this.parseRangeInput()
        })
        this.typeSet.tab.find('[field="delimiter"], [field="content"], [field="remove-whitespace"]').change((event) => {
            __noEventPropagation(event)
            this.parseSetInput()
        })

    }

    parseRangeInput() {
        let from = parseInt(this.typeRange.tab.find('[field="from"]').val())
        let to = parseInt(this.typeRange.tab.find('[field="to"]').val())
        let step = parseInt(this.typeRange.tab.find('[field="step"]').val())
        if (from !== NaN && to !== NaN && step !== NaN) {
            try {
                this.expected.text(JSON.stringify(range(from, to, step)))
            } catch (err) {
                this.expected.text('')
                this.error.text('This range may not be created...').removeClass('hidden')
                this.typeRange.valid = false
                return
            }
            this.error.text('').addClass('hidden')
            this.typeRange.values = range(from, to, step)
            this.typeRange.valid = true
            this.validate()
        } else {
            this.typeRange.valid = false
        }
    }

    parseSetInput() {
        let delimiter = this.typeSet.tab.find('[field="delimiter"]').val()
        let content = this.typeSet.tab.find('[field="content"]').val()
        if (delimiter && content) {
            let values = []
            for (let value of content.split(delimiter)) {
                value = this.typeSet.tab.find('[field="remove-whitespace"]').prop('checked') ? value.trim() : value
                if (value) values.push(value)
            }
            this.expected.text(JSON.stringify(values))
            this.typeSet.values = values
            this.typeSet.valid = true
            this.validate()
        } else {
            this.typeSet.valid = false
        }
    }

    validate() {
        if ((this.typeRange.header.hasClass('active') && this.typeRange.valid) || (this.typeSet.header.hasClass('active') && this.typeSet.valid)) {
            if (this.title.val().trim()) {
                this.save.removeAttr('disabled')
                return
            }
        }
        this.save.attr('disabled', '')

    }

    generate() {
        let values = this.typeRange.header.hasClass('active') ? this.typeRange.values : this.typeSet.values
        return {
            title: this.title.val(),
            color: this.color.find('.active').data('color'),
            values,
            autoRepeat: this.origin.find('[field="auto-repeat"]').prop('checked'),
            autoCopy: this.origin.find('[field="auto-copy"]').prop('checked'),
            random: this.origin.find('[field="random-order"]').prop('checked'),
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

class UIDGenerator {
    static UIDSet = new Set();
    static generateID(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    static registerUID(UID) {
        UIDGenerator.UIDSet.add(UID)
    }

    static generateUID(length) {
        let UID;
        while (true) {
            UID = UIDGenerator.generateID(length)
            if (!UIDGenerator.UIDSet.has(UID)) {
                UIDGenerator.UIDSet.add(UID)
                return UID
            }
        }
    }
}

class UIDBuilder extends UIDGenerator {
    static prefix = 'CC'
    static length = 6
    static delimiter = '__'
    static generateUID() {
        return UIDGenerator.generateUID(UIDBuilder.length)
    }

    static buildUID(type, UID) {
        return `${UIDBuilder.prefix}_${UID === undefined ? UIDBuilder.generateUID() : UID}${UIDBuilder.delimiter}${type}`
    }

    static parseUID(UID) {
        return UID.split(UIDBuilder.delimiter)[0]
    }
}
