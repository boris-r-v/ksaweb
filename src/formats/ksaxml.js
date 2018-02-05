function buildKsaxmlGui(parent, ksaxml) {
    
    function handleCommon (currobj, elt) {
        if ($(elt).attr('show'))
            currobj.hidden = !Number($(elt).attr('show'))
        if ($(elt).attr('id'))
            currobj.id = 'ksaxml-'+$(elt).attr('id')
    }

    function installNavigation(currobj, elt) {
        const nav_target = $(elt).attr('nav-target');

        if (!nav_target)
            return;

        if (!currobj.on)
            currobj.on = {};
        currobj.on.onItemClick = function(id) {
            $$(nav_target).showBatch(id);
        }
    }

    function handleChildren(query, elt) {
        var children = $(elt).find(`> ${query}`);
        if (children.length === 0)
            return undefined;

        const output = [];
        children.each(function () {
            const newelt = {}
            handleCommon(newelt, this);
            buildKsaxmlGui(newelt, $(this))
            output.push(newelt);
        });
        return output;
    }

    const ksaWidgetsConstructors = {
        'GUI:WINDOW': function (currobj, elt) {
            handleCommon(currobj, elt);
            currobj.view = 'layout'
            $('title').text($(elt).attr('title'))
            buildKsaxmlGui(currobj, $(elt).children())
            return true
        },
        'GUI:SCROLLEDWINDOW': function (currobj, elt) {
            handleCommon(currobj, elt);
            buildKsaxmlGui(currobj, $(elt).children());
            return true;
        },
        'GUI:SVGRENDERER': function (currobj, elt) {
            handleCommon(currobj, elt);
            currobj.view = 'vectorDisplay'
            currobj.url  = 'xml/'+$(elt).attr('filename') + `?${Math.random()}`
            currobj.zoom = $(elt).attr('ksaweb-nozoom') != '1'
            return true;
        },
        'GUI:SVGPVIEWER': function (currobj, elt) {
            handleCommon(currobj, elt);
            currobj.view = 'ksaLogView';
            return true;
        },
        'GUI:PROTCONTROL': function (currobj, elt) {
            handleCommon(currobj, elt);
            currobj.view        = 'ksaProtControl';
            currobj.container   = $(elt).attr('container');
            return true;
        },
        'GUI:SVGMVIEWER': function (currobj, elt) {
            handleCommon(currobj, elt);
            currobj.view = 'ksaMeasureView';
            currobj.container = $(elt).attr('container');
            return true;
        },
        'GUI:VBOX': function (currobj, elt) {
            handleCommon(currobj, elt);
            currobj.rows = handleChildren('packstart > *', elt);
            return true
        },
        'GUI:HBOX': function (currobj, elt) {
            handleCommon(currobj, elt);
            currobj.cols = handleChildren('packstart > *', elt);
            return true
        },
        'GUI:TABWIDGET': function (currobj, elt) {
            handleCommon(currobj, elt);
            currobj.view = 'tabview'
            currobj.cells = []
            $(elt).children('tabpage').each(function () {
                var newelt = {
                    header: $(this).attr('label'), 
                    body:{}
                }
                handleCommon(newelt, this);
                buildKsaxmlGui(newelt.body, $(this).children())
                currobj.cells.push(newelt)  
            })
            return true
        }
    }
    , webixConstructor = function (htmlElt) {
        if (!htmlElt || !htmlElt.tagName || htmlElt.tagName.indexOf('WEBIX:') !== 0)
            return false;

        return function (currobj, elt) {
            function convertHyphensToCamelCase (string) {
                return string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
            }

            handleCommon(currobj, elt);
            installNavigation(currobj, elt);
            
            currobj.view = elt.tagName.replace('WEBIX:', '').toLowerCase();
            if (currobj.view === 'template') {
                // Handle template special case
                delete currobj.view;
                currobj.template = elt.innerHTML;
            }

            currobj.cols     = handleChildren('cols > *', elt);
            currobj.rows     = handleChildren('rows > *', elt);
            currobj.cells    = handleChildren('cells > *', elt);
            currobj.elements = handleChildren('elements > *', elt);

            var data = $(elt).children('data');
            if (data.length > 0) {
                currobj.datatype = 'xml';
                currobj.data = data[0].outerHTML;
            }

            $.each(elt.attributes, function (index, attr) {
                if (attr.name.indexOf('webix-') !== 0)
                    return;

                // К сожалению в процессе загрузки у аттрибутов стирается регистр букв,
                // чтобы это обойти в xml будем писать в формате 'my-attr', и потом 
                // преобразовывать это к виду myAttr
                currobj[convertHyphensToCamelCase(attr.name.replace('webix-', ''))] = attr.value;
            });
            return true;
        }
    }
    , nullConstructor = function (x) { return false }

    var output = parent;
    $(ksaxml).each(function () {
        const isAtomicBuilt = (
            ksaWidgetsConstructors[this.tagName] 
            || webixConstructor(this)
            || nullConstructor)(output, this);

        if (!isAtomicBuilt) {
            // Perform composite build
            buildKsaxmlGui(output, $(this).children())
        }
    })
    return output
}

export const readKsaXml = (xml) => { return buildKsaxmlGui({}, xml) };