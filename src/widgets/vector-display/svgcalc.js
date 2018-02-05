// Модуль-костыль для подсчета размеров SVG вручную.
// Работа с трансформациями прилагается.

function matr3 (a, b, c, d, e, f) {
    return [a, c, e, b, d, f, 0, 0, 1];
}

function col3 (x, y) {
    return [x, y, 1]
}

function matrix_mul13(c3, m3, elt) {
    return col3(
        c3[0]*m3[0] + c3[1]*m3[1] + c3[2]*m3[2],
        c3[0]*m3[3] + c3[1]*m3[4] + c3[2]*m3[5])
}

function matrix_mul33(matr3x, matr3y) {
    return [
        matr3x[0]*matr3y[0] + matr3x[1]*matr3y[3] + matr3x[2]*matr3y[6],
        matr3x[0]*matr3y[1] + matr3x[1]*matr3y[4] + matr3x[2]*matr3y[7],
        matr3x[0]*matr3y[2] + matr3x[1]*matr3y[5] + matr3x[2]*matr3y[8],

        matr3x[3]*matr3y[0] + matr3x[4]*matr3y[3] + matr3x[5]*matr3y[6],
        matr3x[3]*matr3y[1] + matr3x[4]*matr3y[4] + matr3x[5]*matr3y[7],
        matr3x[3]*matr3y[2] + matr3x[4]*matr3y[5] + matr3x[5]*matr3y[8],

        matr3x[6]*matr3y[0] + matr3x[7]*matr3y[3] + matr3x[8]*matr3y[6],
        matr3x[6]*matr3y[1] + matr3x[7]*matr3y[4] + matr3x[8]*matr3y[7],
        matr3x[6]*matr3y[2] + matr3x[7]*matr3y[5] + matr3x[8]*matr3y[8]
    ]
}


function do_transform(spec, dots) {
    var six_arg_re = /\s*(\w+)\s*\(\s*([0-9-\.]+)\s*,\s*([0-9-\.]+)\s*,\s*([0-9-\.]+)\s*,\s*([0-9-\.]+)\s*,\s*([0-9-\.]+)\s*,\s*([0-9-\.]+)\s*\)/
        , two_arg_re = /\s*(\w+)\s*\(\s*([0-9-\.]+)\s*,\s*([0-9-\.]+)\s*\)/
        , one_arg_re = /\s*(\w+)\s*\(\s*([0-9-\.]+)\s*\)/
        , matchee
        , matrix = matr3(1,0,0,1,0,0)
        , x, y, origin_spec = spec;

    while (matchee = spec.match(one_arg_re) || spec.match(two_arg_re) || spec.match(six_arg_re)) {
        spec = spec.slice(matchee[0].length)
        if (matchee[1] == 'translate') {
            x = Number(matchee[2]) || 0, y = Number(matchee[3]) || 0
            matrix = matrix_mul33(matrix, matr3(1, 0, 0, 1, x, y))
        } else if (matchee[1] == 'scale') {
            x = Number(matchee[2]) || 0, y = Number(matchee[3]) || Number(matchee[2]) || 0
            matrix = matrix_mul33(matrix, matr3(x, 0, 0, y, 0, 0))
        } else if (matchee[1] == 'rotate') {
            x = Number(matchee[2]) || 0
            matrix = matrix_mul33(matrix, matr3(Math.cos(x), Math.sin(x), -Math.sin(x), Math.cos(x), 0, 0))
        } else if (matchee[1] == 'skewX') {
            x = Number(matchee[2]) || 0
            matrix = matrix_mul33(matrix, matr3(1, 0, Math.tan(x), 1, 0, 0))
        } else if (matchee[1] == 'skewY') {
            x = Number(matchee[2]) || 0
            matrix = matrix_mul33(matrix, matr3(1, Math.tan(x), 0, 1, 0, 0))
        } else if (matchee[1] == 'matrix') {
            matrix = matrix_mul33(matrix, matr3(Number(matchee[2]) || 0, Number(matchee[3]) || 0, Number(matchee[4]) || 0, 
                                                Number(matchee[5]) || 0, Number(matchee[6]) || 0, Number(matchee[7]) || 0))
        } else {
            console.log('Unknown transform operation '+matchee[1])
        }
    }
    return dots.map(function (dot) {
        return matrix_mul13(dot, matrix);
    }) 
}

function tracePath(path, elt) {
    // TODO Curves and arcs handling
    var xMin = Number.MAX_VALUE
        , yMin = Number.MAX_VALUE
        , xMax = 0
        , yMax = 0
        , currX = 0
        , currY = 0
        , ofsX  = 0
        , ofsY  = 0
        , matchee
        , found = true
        , count = 0
    while (found) {
        found = true
        if (matchee = path.match(/^\s*(M|m|L|l)\s+([-0-9\.]+),\s*([-0-9\.]+)/)) {
            if (matchee[1].toLowerCase() === matchee[1]) 
                ofsX = 0, ofsY = 0
            else
                ofsX = currX, ofsY = currY;
            currX = ofsX + Number(matchee[2])
            currY = ofsY + Number(matchee[3])
        } else if (matchee = path.match(/^\s*(H|h|V|v)\s+([-0-9\.]+)/)) {
            if (matchee[1].toLowerCase() === matchee[1]) 
                ofsX = 0, ofsY = 0
            else
                ofsX = currX, ofsY = currY;
            if (matchee[1].toLowerCase() == 'h')
                currX = ofsY + Number(matchee[1])	
            else
                currY = ofsY + Number(matchee[2])
        } else {
            found = false;
        }
        if (matchee) {
            count += 1;
            path = path.slice(matchee[0].length)
            xMin = Math.min(xMin, currX);
            yMin = Math.min(yMin, currY);
            xMax = Math.max(xMax, currX);
            yMax = Math.max(yMax, currY);
        }
    }
    return count > 0 ? [col3(xMin, yMin), col3(xMax, yMax)] : [];
}

function dotsMax(dots) {
    var xMin = Number.MAX_VALUE
        , yMin = Number.MAX_VALUE
        , xMax = 0
        , yMax = 0
    dots.forEach(function (dot) {
        xMin = Math.min(xMin, dot[0]);
        yMin = Math.min(yMin, dot[1]);
        xMax = Math.max(xMax, dot[0]);
        yMax = Math.max(yMax, dot[1]);
    })
    return [col3(xMin, yMin), col3(xMax, yMax)]
}

function dots(elt) {
    var outdots = []
    if (elt.childNodes && elt.childNodes.length > 0) {
        var childDots = [], i, transform
        for(i = 0; i < elt.childNodes.length; i++)
            childDots = childDots.concat(dots(elt.childNodes[i]));
        outdots = childDots;
    }
    if (elt.nodeName == 'line') {
        var x1 = Number(elt.getAttribute('x1')) 	|| 0
            , y1 = Number(elt.getAttribute('y1')) 	|| 0
            , x2 = Number(elt.getAttribute('x2')) 	|| 0
            , y2 = Number(elt.getAttribute('y2')) 	|| 0
        outdots.push(col3(x1, y1))
        outdots.push(col3(x2, y2))
    }
    if (elt.nodeName == 'text') {
        var x = Number(elt.getAttribute('x')) 		|| 0
            , y = Number(elt.getAttribute('y')) 		|| 0
            , len = elt.textContent.length // em = 16 hardcode
            , style = elt.getAttribute('style')       || ''
            , matchee 
            , font_size = 16
        if (matchee = style.match(/font-size:\s*(\d+)px/)) {
            font_size = Number(matchee[1])
        } else if (matchee = style.match(/font-size:\s*(\d+);/)) {
            font_size = Number(matchee[1])*1.25
        }
        if (matchee = style.match(/line-height:\s*(\d+)%/)) {
            font_size *= Number(matchee[1])*0.01;
        }
        outdots.push(col3(x+len*font_size, y-font_size))
        outdots.push(col3(x, y))
    }
    if (elt.nodeName == 'circle') {
        var cx = Number(elt.getAttribute('cx')) 	|| 0
            , cy = Number(elt.getAttribute('cy')) 	|| 0
            , r  = Number(elt.getAttribute('r')) 		|| 0
        outdots.push(col3(cx+r, cy+r))
        outdots.push(col3(cx-r, cy-r))
    }
    if (elt.nodeName == 'ellipse') {
        var cx = elt.getAttribute('cx') 			|| 0
            , cy = elt.getAttribute('cy') 			|| 0
            , rx = elt.getAttribute('rx') 			|| 0
            , ry = elt.getAttribute('ry') 			|| 0
        outdots.push(col3(cx+rx, cy+ry))
        outdots.push(col3(cx-rx, cy-ry))
    }
    if (elt.nodeName == 'rect') {
        var x = Number(elt.getAttribute('x')) 		|| 0
            , y = Number(elt.getAttribute('y'))		|| 0
            , w = Number(elt.getAttribute('width')) 	|| 0
            , h = Number(elt.getAttribute('height')) 	|| 0
        outdots.push(col3(x, y))
        outdots.push(col3(x+w, y+h))
    } 
    if (elt.nodeName == 'polygon' || elt.nodeName == 'polyline' || elt.nodeName == 'path') {
        tracePath(elt.getAttribute('d') || '', elt).forEach(function (dot) {
            outdots.push(dot)
        })
    }
    if (elt.getAttribute && elt.getAttribute('transform'))
            return do_transform(elt.getAttribute('transform'), outdots)
    return outdots
}

export const svgcalc = (elts) => {
    var result = dotsMax(elts.reduce(function (out, elt) {
        return out.concat(dots(elt));
    }, []))
    return [Math.max(0, result[0][0])
            ,Math.max(0, result[0][1])
            ,Math.max(0, result[1][0])
            ,Math.max(0, result[1][1])]
}