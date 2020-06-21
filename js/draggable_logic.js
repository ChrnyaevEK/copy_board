$('[draggable] .card').on('dragstart',(event)=>{
    __noEventPropagation(event)
    $(event.target).addClass('dnd-dragstart')
})

$('[draggable] .card').on('dragend',(event)=>{
    __noEventPropagation(event)
    $(event.target).removeClass('dnd-dragstart')
})

$('[draggable] .card').on('dragenter',(event)=>{
    __noEventPropagation(event)
    $(event.target).addClass('dnd-dragover')
})

$('[draggable] .card').on('dragleave',(event)=>{
    __noEventPropagation(event)
    $(event.target).removeClass('dnd-dragover')
})

$('[draggable] .card').on('dragover',(event)=>{
    __noEventPropagation(event)
    event.dataTransfer.dropEffect = 'move';
})

$('[draggable] .card').on('drop',(event)=>{
    __noEventPropagation(event)
})
