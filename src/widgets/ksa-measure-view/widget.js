import "webix";

import ksaapi from '../../apis/ksa';
import { PlotDataSource } from '../../data/plot-source';

function mapTreeData (data) {
    if (!data || !data.length)
        return []
    return data.map(function (item) {
        const iname = item.name || (item.ti + ': ' + item.param)
        return {
            value   : iname
            , ti    : item.ti
            , data  : mapTreeData(item.data)
        }
    })
}

webix.protoUI({
    name:'ksaMeasureView',
    $init: function (config) {
        
        config.treeId = `${config.id}-tree`
        config.tlimId = `${config.id}-tlim`
        config.dataId = `${config.id}-data`
        config.plotId = `${config.id}-plot`;

        function toggleBranch(id) {
            if (this.isBranch(id))
                return this.isBranchOpen(id) ? this.close(id) : this.open(id);
        }

        this.dataSource = PlotDataSource();

        config.rows = [
            {cols: [
                {view: "tree", id: config.treeId, select:true
                    , on:{  'onAfterSelect': (id) => {
                                const ti = $$(config.treeId).getItem(id).ti;
                                localStorage.setItem('last_sobj', ti) 
                                this.dataSource.setAddr({id: ti}) 
                            }
                            , 'onItemClick': toggleBranch
                        }
                    , header:"Объекты"},
                {view: "ksaTlimList"
                    , id: config.tlimId
                    , dataSource: this.dataSource},
                {view: "ksaSdataTable"
                    , dataSource: this.dataSource}
            ]},
            {view:"resizer"},
            {view:"ksaPlot", id: config.plotId, dataSource: this.dataSource }
        ];

        this.$ready.push(this.initData);
    },
    selectByTi: function (ti) {
        const mtree = $$(this.config.treeId);
        let item = mtree.find((item) => { return item.ti === ti; })[0]
        if (item.id) {
            mtree.select(item.id);
            mtree.open(mtree.getParentId(item.id), true);
            mtree.showItem(item.id);
        }
    },
    initData: function () {
        ksaapi
            .send({type:'sobj_req'})
            .then((msg) => { 
                const mtree = $$(this.config.treeId);
                mtree.clearAll();
                mtree.parse(mapTreeData(msg.data));
                if (mtree.getSelectedId(true).length == 0) {
                    this.selectByTi(localStorage.getItem('last_sobj'))
                }
            });    
    }
}, webix.ui.layout);