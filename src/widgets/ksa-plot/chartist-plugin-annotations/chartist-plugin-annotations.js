/**
 * Chartist data cursor plugin
 */
import Chartist from 'chartist'
import './chartist-plugin-annotations.css';

'use strict';

const defaultOptions = { 
    annotations: [],
    labelClass: 'ct-annotation-label',
    lineClass: 'ct-annotation-line',
    labelOffset: {
        xAxis: {
            x: 4,
            y: -4,
            textAnchor: 'left'
        },
        yAxis: {
            x: 4,
            y: -4,
            textAnchor: 'left'
        },
    }
}

function findBoundBox(data, annotations) {
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
    annotations.forEach((annot) => {
        if (annot.axis == 'x') {
            xMin = Math.min(annot.value, xMin);
            xMax = Math.max(annot.value, xMax);
        }
        if (annot.axis == 'y') {
            yMin = Math.min(annot.value, yMin);
            yMax = Math.max(annot.value, yMax);
        }
    })
    data.labels.forEach((label) => {
        xMin = Math.min(label, xMin);
        xMax = Math.max(label, xMax);
    })
    data.series.forEach((series) => {
        const seriesData = series.data || series;
        seriesData.forEach((item) => {
            if (!item)
                return;
            const y = item.y !== undefined ? item.y : item;
            yMin = Math.min(y, yMin);
            yMax = Math.max(y, yMax);
        })
    })
    return {xMin, yMin, xMax, yMax}
}

Chartist.plugins = Chartist.plugins || {};

Chartist.plugins.annotations = function (options) {

    const defaultColors = [
        '#9b9',
        'rgb(135, 195, 255)',
        'rgb(255, 125, 125)',
        'rgb(250, 185, 106)',
        'rgb(194, 126, 211)',
        'rgb(172, 196, 124)'
    ]

    options = Chartist.extend({}, defaultOptions, options);

    options.annotations = options.annotations || [];
    
    let dataBbox = null;

    return function (chart) {
        if(chart instanceof Chartist.Line) {
            chart.on('data', function (event) {
                dataBbox = findBoundBox(event.data, options.annotations)
                options.annotations.forEach((annot, annotIndex) => {
                    if (annot.axis === 'y') {
                        event.data.series.push({
                            name:       `annotation-${annotIndex}`,
                            className:  'ct-annotation-series-y',
                            data:       [{x:dataBbox.xMin, y:annot.value}]
                        })
                    }
                    if (annot.axis === 'x') {
                        event.data.series.push({
                            name:       `annotation-${annotIndex}`,
                            className:  'ct-annotation-series-x',
                            data:       [{x:annot.value, y:dataBbox.yMin}]
                        })
                    }
                })
                const offsetY = dataBbox.yMin + (dataBbox.yMax - dataBbox.yMin)* 1.05
                event.data.series.push({
                    className:  'ct-annotation-series-ghost',
                    data:       [{x:dataBbox.xMin, y:offsetY}]
                })
            }) 
            chart.on('created', function(data) {
                let grids = $(chart.svg._node).find('.ct-grids')
                    , svgBbox = null

                if (grids.length > 0) {
                    svgBbox = grids[0].getBBox();
                }
                    
                if (!svgBbox || !dataBbox)
                    return;

                $(chart.svg._node)
                    .find('.ct-annotation-series-y')
                    .each(function () {
                        const seriesG = $(this)
                            , line = seriesG.find('.ct-point:first')
                            , annotIndex = +(seriesG.attr('ct:series-name').replace('annotation-', ''))
                            , annot = options.annotations[annotIndex]
                            , series = chart.data.series.filter(s => s.source === annot.source)[0]
                        if (!series) {
                            line.attr('style', `display:none`)
                            return
                        }
                        const seriesIndex = +(series.name.replace('series-', '')) - 1
                        line.attr('x2', svgBbox.width + svgBbox.x) 
                        line.attr('style', `stroke:${annot.color || defaultColors[seriesIndex]}`)
                        chart.svg.elem('text', {
                                x: +(line.attr('x1')) + options.labelOffset.yAxis.x,
                                y: +(line.attr('y1')) + options.labelOffset.yAxis.y,
                                stroke: annot.color,
                                fill: annot.color
                            }, options.labelClass)
                        .text(annot.text);
                    });
            });
        }
    };
};
