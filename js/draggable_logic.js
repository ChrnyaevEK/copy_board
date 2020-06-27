$('[draggable="true"].card').on('dragstart', (event) => {
    var dragged =  $(event.target).closest('[draggable="true"].card')
    dragged.addClass('dnd-dragged')
    DND.dragged = dragged
    $('[draggable="true"].card').addClass('dnd-dropzone')
})

$('[draggable="true"].card').on('dragend', (event) => {
    $('[draggable="true"].card').removeClass('dnd-dropzone').removeClass('dnd-dragged').removeClass('dnd-dragover')
})

$('[draggable="true"].card').on('dragenter', (event) => {
    __noEventPropagation(event)
    $('[draggable="true"].card').removeClass('dnd-dragover')
    var target = $(event.target).closest('[draggable="true"].card')
    target.addClass('dnd-dragover')
    DND.target = target
})

$('[draggable="true"].card').on('dragover', (event) => {
    __noEventPropagation(event)
})

$('[draggable="true"].card').on('drop', (event) => {
    __noEventPropagation(event)
    DND.swap()
})

class DND {
    static dragged
    static target

    static swap() {
        if (!DND.target.hasClass('dnd-dragged')){
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
}