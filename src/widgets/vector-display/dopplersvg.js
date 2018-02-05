export const initDopplerSvg = (obj, url) => {

    var DOPPLER_FONT_SCALE      = 0.325
        , DOPPLER_FONT_OFFSET     = 13

    function dopplerCorrection() {
            // Doppler Corrections
        obj.svg.find('svg').each(function () {
            if (Number(this.getAttribute('width')) && Number(this.getAttribute('height'))) {
                obj.originViewBox = '0 0 '
                    + this.getAttribute('width')
                    + ' '
                    + this.getAttribute('height');
            }
            //this.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        })
        obj.svg.find('text').each(function () {
            var sizeStr = this.style.fontSize
                , matchee = sizeStr.match(/(\d+)(\w+)/)
                , origSize = Number(matchee[1])
                , corrSize = origSize*DOPPLER_FONT_SCALE;
            this.style.fontSize = corrSize + matchee[2];
            this.setAttribute('y', Number(this.getAttribute('y')) - DOPPLER_FONT_OFFSET)
        })
    }

    function buildSvg(url, toplevel) {
        try {
            var svgText = $.getSync('xml/'+url);
        } catch (e) { }
        if (!svgText) {
            console.log('SVG xml/'+url+' not found')
            return '<svg id="not-found" />'
        }
        svgText = svgText.replace(/<\?xml.*?\?>/, '');
        /*if (!toplevel) {
            svgText = svgText.replace(/<svg[\S\s]*?>/, '');
            svgText = svgText.replace(/<\/svg>/, '');

        } else */ if (!svgText.match(/<svg/)) {
            svgText = '<svg>'+svgText+'</svg>'
        }
        return svgText.replace(/<include\s+url=\"(\S+)\"[\S\s]*?\/>/gm, function (matchee, url) {
            return buildSvg(url, false)
        })
    }

    obj.$view.innerHTML = buildSvg(url, true);
    obj.svg = $(obj.$view).find('svg:first');
    if (obj.svg.length > 0)
        dopplerCorrection();
}