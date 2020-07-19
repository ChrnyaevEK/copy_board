class DND {
    static dragged
    static target

    static swap() {
        if (!DND.target.hasClass('dnd-dragged')) {
            var targetParent = DND.target.parent()
            DND.dragged.parent().append(DND.target)
            targetParent.append(DND.dragged)
            CCardHolder.update()
        }
        DND.clean()
    }

    static clean() {
        DND.dragged = undefined
        DND.target = undefined
    }

    static init(ccard) {  // [draggable="true"].card
        ccard.on('dragstart', (event) => {
            var dragged = $(event.target).closest('[draggable="true"].card')
            dragged.addClass('dnd-dragged')
            DND.dragged = dragged
            $('[draggable="true"].card').addClass('dnd-dropzone')
        })

        ccard.on('dragend', (event) => {
            $('[draggable="true"].card').removeClass('dnd-dropzone').removeClass('dnd-dragged').removeClass('dnd-dragover')
        })

        ccard.on('dragenter', (event) => {
            __noEventPropagation(event)
            $('[draggable="true"].card').removeClass('dnd-dragover')
            var target = $(event.target).closest('[draggable="true"].card')
            target.addClass('dnd-dragover')
            DND.target = target
        })

        ccard.on('dragover', (event) => {
            __noEventPropagation(event)
        })

        ccard.on('drop', (event) => {
            __noEventPropagation(event)
            DND.swap()
        })
        return ccard
    }
}