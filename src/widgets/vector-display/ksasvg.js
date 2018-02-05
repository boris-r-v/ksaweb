import { svgcalc } from "./svgcalc";

export const initKsaSvg = (obj, url, zoom) => {

    function zoomKsaSvg(svg) {
        var rects = []
            , padding = 16;
        svg.find('g').each(function () {
            rects.push(this)
        })
        rects.shift();
        var resultRect = svgcalc(rects);
        return ' ' + (resultRect[0] - padding) + ' ' + (resultRect[1] - padding)
                + ' ' + (resultRect[2] + padding) + ' ' + (resultRect[3] + padding);
    }

    return $.ajax(url, {dataType: 'text'})
        .then(function (svgText) {
            obj.$view.innerHTML = svgText;
            obj.svg = $(obj.$view).find('svg');

            if (zoom)
                obj.originViewBox = zoomKsaSvg(obj.svg);
            if (!obj.originViewBox)
                obj.originViewBox = obj.svg[0].getAttribute('viewBox');
            if (!obj.originViewBox
                && obj.svg.attr('width')
                && obj.svg.attr('height'))
                obj.originViewBox = '0 0 '+ obj.svg.attr('width')
                                    + ' ' + obj.svg.attr('height');
            obj.svg.find('[ksa\\:mode="service"]').remove();
            obj.svg.find('[ksa\\:mode="link-point"]').remove();
        })
}

