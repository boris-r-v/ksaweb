/**
 * Chartist data cursor plugin
 */
import Chartist from 'chartist'

import './chartist-plugin-cursor.css'

'use strict';

const defaultOptions = 
    { 
        format: function (type, s) { return s },
        cursor: 'x'
    }
    , $tooltip = $(`<div class="data-cursor"></div>`)

Chartist.plugins = Chartist.plugins || {};

$(() => {
    $tooltip.appendTo('body');
})

Chartist.plugins.cursor = function (options) {

    let points = []
       , byX   = {}

    options = Chartist.extend({}, defaultOptions, options);

    function dist(p1, p2) {
        if (p1.x === p2.x && p1.y === p2.y)
            return 0;
        return Math.pow(Math.pow(p1.y - p2.y, 2) + Math.pow(p1.x - p2.x, 2), 0.5);
    }

    function renderTooltip(points) {
        let output = `<table cellspacing="0">
            <tr><th align="left" colspan="2">${options.format('label', points[0].value.x)}</th></tr>`;
        points.forEach((pt) => {
            const title = options.format('series', pt.series.name)
            if (title === undefined)
                return;
            output += `<tr>
                <td align="left" class="series">${title}</td>
                <td align="right" class="value">${options.format('value', pt.value.y)}</td>
            </tr>`
        })
        output += '</table>'
        return output;
    }

    function showLines(chart, pos) {
        let $chart = $(chart.svg._node)
            , grids = $chart.find('.ct-grids')
            , svgBbox = null

        if (grids.length > 0)
            svgBbox = grids[0].getBBox();
        
        if (options.cursor === 'y' || options.cursor === 'both')
            $chart
                .find('.data-cursor-yline')
                .attr('x1', svgBbox.x)
                .attr('y1', pos.y)
                .attr('x2', svgBbox.x + svgBbox.width)
                .attr('y2', pos.y)
                .show()

        if (options.cursor === 'x' || options.cursor === 'both')
            $chart
                .find('.data-cursor-xline')
                .attr('x1', pos.x)
                .attr('y1', svgBbox.y)
                .attr('x2', pos.x)
                .attr('y2', svgBbox.y + svgBbox.height)
                .show()
    }

    function hideLines(chart) {
        $(chart.svg._node)
            .find('.data-cursor-xline, .data-cursor-yline')
            .hide();
    }

    return function (chart) {
        if(chart instanceof Chartist.Line) {
            chart.on('created', function () {
                chart.svg.elem('line', {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0
                }, 'data-cursor-xline');
                chart.svg.elem('line', {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0
                }, 'data-cursor-yline');
                window.$ = $;
            })
            chart.on('draw', function(data) {
                if (data.type == 'grid') {
                    points = []; byX = {};
                }
                if (data.type === 'point') {
                   if (!byX[data.value.x])
                        byX[data.value.x] = [];
                   byX[data.value.x].push(data);
                   points.push(data);
                }
            });
        }

        
        const $chart = $(chart.container);

        $chart.on('mousemove', function(event) {
            if (event.target.tagName !== 'svg')
                return;

            var nearest = null
              , nearestDist = Infinity
              , k
              , curr = {x: event.offsetX, y: event.offsetY};

            for (k in points) {
                let d = dist(points[k], curr);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearest = points[k]
                }
            }
            if (nearestDist < 8) {
                $tooltip
                    .html(renderTooltip(byX[nearest.value.x]))
                
                let top = event.clientY + 20
                  , left = event.clientX + 20;
                if (top + $tooltip.height() > document.documentElement.clientHeight)
                    top = top - $tooltip.height() - 40
                 if (left + $tooltip.width() > document.documentElement.clientWidth)
                    left = left - $tooltip.width() - 40
                $tooltip    
                    .css('top',  top)
                    .css('left', left)
                    .addClass('data-cursor-visible');
                showLines(chart, nearest);        
            } else {
                $tooltip
                    .removeClass('data-cursor-visible');
                hideLines(chart);
            }
        });

    };

};
