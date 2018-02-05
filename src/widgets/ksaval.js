import ksaapi from '../apis/ksa';

$(document).on('click', 'a.ksa_link', function () {
    ksaapi.send({
        type:   'link_req'
        , link: JSON.parse($(this).attr('link_msg'))
    })
})


export function ksaValue (val) {
    
    var mkStyle = function (styleDef) {
        var style='';
        $.each(styleDef, function (k,v) {
            style += k+':'+v+';';
        })
        return style;
    }

    if (typeof(val) === 'string')
        return val;

    return ((val instanceof Array) ? val : [val]).reduce(function (output, val) {
        var rendered = val.text
            , css = mkStyle(val.css || {})
        
        if (val.l_state > 0)
            rendered = '<span style="color:red;">'+rendered+'</span>'
        if (val.link) {
            rendered = '<a href="javascript:" style="' + css + '" '
                +' class="ksa_link" link_msg=\'' + JSON.stringify(val.link) + '\' >'
                + rendered + '</a>'
        } else {
            rendered = '<span style="'+css+'">'+rendered+'</span>'
        }
        return output + rendered + ' '
    }, '');
}