let pos = null

$(document).ready(function () {
    $('body').on('mousemove', function (ev) {
        pos = {x:ev.clientX, y:ev.clientY}
    })
})

// TODO: Approx item height
export function getMousePos (ofs_x, ofs_y) {
    ofs_x = ofs_x || 0
    ofs_y = ofs_y || ofs_x || 0
    return {x:pos.x+ofs_x, y:pos.y+ofs_y};
}
    