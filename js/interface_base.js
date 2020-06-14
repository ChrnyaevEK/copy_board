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
        super($(`.${template}.template`).clone().removeClass('template'))
        this.origin.removeClass('template')
    }
}
