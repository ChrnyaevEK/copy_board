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

class ICCardBuilder extends Block {
    CCard = class {
        constructor() {
            throw Error('Not implemented')
        }
    }
    init() {  // Will init JS for element
        throw Error('Not implemented')
    };

    parse() {
        throw Error('Not implemented')
    }

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
        this.color = this.origin.find('[field=color]')
        this.save = this.origin.find('[field=save]')
    }

    init() {
        this.color.find('span').click((event) => {
            __noEventPropagation(event)
            this.color.find('span').removeClass('active')
            $(event.target).addClass('active')
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
            this.build(new this.CCard(this.parse()))
        })
    }

    parse() {
        return {
            title: this.title.val(),
            content: this.content.val(),
            color: this.color.find('.active').data('color')
        }
    }
}


class CCardIterativeBuilderNumbers extends ICCardBuilder {
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
        super($('#ccard-builder li.ccard-builder-iterative-num'))

        this.valid = false
        this.values = undefined

        this.title = this.origin.find('[field=title]')
        this.from = this.origin.find('[field=from]')
        this.to = this.origin.find('[field=to]')
        this.step = this.origin.find('[field=step]')
        this.endless = this.origin.find('[field=endless]')
        this.repeat = this.origin.find('[field=repeat]')
        this.random = this.origin.find('[field=random]')
        this.copy = this.origin.find('[field=copy]')
        this.expected = this.origin.find('[field="expected"]')
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
        })
        this.save.click((event) => {
            __noEventPropagation(event)
            this.build(new this.CCard(this.parse()))
        })
        this.origin.find('[field="from"], [field="to"], [field="step"]').change((event) => {
            __noEventPropagation(event)
            this.parseRangeInput()
        })
        this.endless.change((event) => {
            __noEventPropagation(event)
            if (this.endless.prop('checked')) {
                this.random.prop('checked', false).attr('disabled', '')
                this.to.attr('disabled', '')
            } else {
                this.to.removeAttr('disabled')
                this.random.removeAttr('disabled')
            }
            this.parseRangeInput()
        })
        this.random.change((event) => {
            if (this.random.prop('checked')) {
                this.endless.prop('checked', false).attr('disabled', '')
                this.repeat.prop('checked', true).attr('disabled', '')
            } else {
                this.repeat.removeAttr('disabled')
                this.endless.removeAttr('disabled')
            }
        })
    }

    parseRangeInput() {
        let from = parseInt(this.from.val())
        let to = parseInt(this.to.val())
        let step = parseInt(this.step.val())
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

    parse() {
        return {
            title: this.title.val(),
            color: this.color.find('.active').data('color'),
            from: parseInt(this.from.val()),
            to: parseInt(this.to.val()),
            step: parseInt(this.step.val()),
            endless: this.endless.prop('checked'),
            autoRepeat: this.repeat.prop('checked'),
            autoCopy: this.copy.prop('checked'),
            random: this.random.prop('checked'),
        }

    }
}


// class CCardIterativeBuilder extends ICCardBuilder {
//     CCard = class extends CCard {
//         lastIndex = 0;
//         values; repeat; random;
//         constructor(data) {
//             super('ccard-iterative')
//             this.values = data.values
//             this.autoRepeat = data.autoRepeat
//             this.autoCopy = data.autoCopy
//             this.random = data.random
//             if (this.random) shuffle(this.values)
//             this.origin.find('[field=color], [field=color] a').addClass(data.color)
//             this.origin.find('[field=title]').text(data.title)
//             this.origin.find('[field=copy-prev]').click((event) => {
//                 __noEventPropagation(event)
//                 this.copyPrevious()
//             })
//             this.origin.find('[field=copy]').click((event) => {
//                 __noEventPropagation(event)
//                 this.copyNoFormat()
//             })
//             this.origin.find('[field=copy-next]').click((event) => {
//                 __noEventPropagation(event)
//                 this.copyNext()
//             })
//             this.origin.find('[field=reload]').click((event) => {
//                 __noEventPropagation(event)
//                 this.lastIndex = 0
//                 if (this.random) shuffle(this.values)
//                 this.updateValue()
//                 if (this.autoCopy) this.copyNoFormat()
//             })
//             this.updateValue()
//         }

//         copyPrevious() {
//             if (this.lastIndex > 0) {
//                 this.lastIndex -= 1
//             } else {
//                 if (this.autoRepeat) {
//                     this.lastIndex = this.values.length - 1
//                 } else {
//                     CCard.toast('First value!')
//                     return
//                 }
//             }
//             this.updateValue()
//             if (this.autoCopy) {
//                 this.copyNoFormat()
//             }
//         }

//         copyNext() {
//             if (this.lastIndex < this.values.length - 1) {
//                 this.lastIndex += 1
//             } else {
//                 if (this.autoRepeat) {
//                     this.lastIndex = 0
//                 } else {
//                     CCard.toast('Last value!')
//                     return
//                 }
//             }
//             this.updateValue()
//             if (this.autoCopy) this.copyNoFormat()
//         }

//         copyNoFormat() {
//             if (this.values) {
//                 super.copyNoFormat(this.values[this.lastIndex])
//                 CCard.toast(this.values[this.lastIndex])
//             } else {
//                 CCard.toast()
//             }
//         }

//         updateValue() {
//             this.origin.find('[field=value]').text(this.values[this.lastIndex])
//             CCardHolder.update()
//         }
//     }

//     constructor() {
//         super($('#ccard-builder li.ccard-builder-iterative'))
//         this.title = this.origin.find('[field=title]')
//         this.typeRange = {
//             valid: false,
//             header: this.origin.find('.tabs a[href="#over-range-of-num"]'),
//             tab: this.origin.find('#over-range-of-num'),
//             values: undefined,
//         }
//         this.typeSet = {
//             valid: false,
//             header: this.origin.find('.tabs a[href="#over-set-of-values"]'),
//             tab: this.origin.find('#over-set-of-values'),
//             values: undefined,
//         }
//         this.expected = this.origin.find('[field="expected-values"]')
//         this.error = this.origin.find('[field="error"]')
//         this.color = this.origin.find('[field="color"]')
//         this.save = this.origin.find('[field="save"]')
//     }

//     init() {
//         this.color.find('span').click((event) => {
//             __noEventPropagation(event)
//             this.color.find('span').removeClass('active')
//             $(event.target).addClass('active')
//         })
//         this.title.change((event) => {
//             __noEventPropagation(event)
//             this.parseRangeInput()
//             this.parseSetInput()
//         })
//         this.save.click((event) => {
//             __noEventPropagation(event)
//             this.build(new this.CCard(this.generate()))
//         })
//         this.typeRange.tab.find('[field="from"], [field="to"], [field="step"]').change((event) => {
//             __noEventPropagation(event)
//             this.parseRangeInput()
//         })
//         this.typeSet.tab.find('[field="delimiter"], [field="content"], [field="remove-whitespace"]').change((event) => {
//             __noEventPropagation(event)
//             this.parseSetInput()
//         })

//     }

//     parseRangeInput() {
//         let from = parseInt(this.typeRange.tab.find('[field="from"]').val())
//         let to = parseInt(this.typeRange.tab.find('[field="to"]').val())
//         let step = parseInt(this.typeRange.tab.find('[field="step"]').val())
//         if (from !== NaN && to !== NaN && step !== NaN) {
//             try {
//                 this.expected.text(JSON.stringify(range(from, to, step)))
//             } catch (err) {
//                 this.expected.text('')
//                 this.error.text('This range may not be created...').removeClass('hidden')
//                 this.typeRange.valid = false
//                 return
//             }
//             this.error.text('').addClass('hidden')
//             this.typeRange.values = range(from, to, step)
//             this.typeRange.valid = true
//             this.validate()
//         } else {
//             this.typeRange.valid = false
//         }
//     }

//     parseSetInput() {
//         let delimiter = this.typeSet.tab.find('[field="delimiter"]').val()
//         let content = this.typeSet.tab.find('[field="content"]').val()
//         if (delimiter && content) {
//             let values = []
//             for (let value of content.split(delimiter)) {
//                 value = this.typeSet.tab.find('[field="remove-whitespace"]').prop('checked') ? value.trim() : value
//                 if (value) values.push(value)
//             }
//             this.expected.text(JSON.stringify(values))
//             this.typeSet.values = values
//             this.typeSet.valid = true
//             this.validate()
//         } else {
//             this.typeSet.valid = false
//         }
//     }

//     validate() {
//         if ((this.typeRange.header.hasClass('active') && this.typeRange.valid) || (this.typeSet.header.hasClass('active') && this.typeSet.valid)) {
//             if (this.title.val().trim()) {
//                 this.save.removeAttr('disabled')
//                 return
//             }
//         }
//         this.save.attr('disabled', '')

//     }

//     generate() {
//         let values = this.typeRange.header.hasClass('active') ? this.typeRange.values : this.typeSet.values
//         return {
//             title: this.title.val(),
//             color: this.color.find('.active').data('color'),
//             values,
//             autoRepeat: this.origin.find('[field="auto-repeat"]').prop('checked'),
//             autoCopy: this.origin.find('[field="auto-copy"]').prop('checked'),
//             random: this.origin.find('[field="random-order"]').prop('checked'),
//         }

//     }
// }

class CCardCollectionBuilder extends ICCardBuilder {

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
        super($('#ccollection-builder li.ccollection'))
        this.title = this.origin.find('[field=title]')
        this.color = this.origin.find('[field=color]')
        this.save = this.origin.find('[field=save]')
    }

    init() {
        this.color.find('span').click((event) => {
            __noEventPropagation(event)
            this.color.find('span').removeClass('active')
            $(event.target).addClass('active')
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
            this.build(new this.CCardCollection(this.generate()))
        })
    }

    generate() {
        return {
            title: this.title.val(),
            color: this.color.find('.active').data('color'),
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
