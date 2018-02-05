import 'webix'
import Chartist from 'chartist'
import './chartist-plugin-legend'
import 'chartist-plugin-tooltips'
import 'chartist/dist/chartist.css'
import ksaapi from '../../apis/ksa';
import time from '../../utils/unix-time';

import './chartist-plugin-cursor/chartist-plugin-cursor';
import './chartist-plugin-annotations/chartist-plugin-annotations';

import './line-chart.css';
import './legend.css';
import './tooltip.css';
import storage from '../../utils/memStorage';

import { makePlotController } from './controller';

webix.protoUI({
    name: 'ksaPlot',
    $init: function (config) {

        this.displayLoading();
        
        this.storage = storage.create();

        config.dataSource.on('sdata_ans', (msg) => { 
            function convertLimit(limit) {
                return {
                    axis:  'y',
                    source: limit.source,
                    value: limit.value,
                    text:  limit.text,
                    color: limit.color
                };
            }

            this.config.overlay = null;
            this.config.chartData = msg.data;
            if (msg.limit) {
                this.config.annotations = msg.limit.map(convertLimit);
            }
            if (config.limit) {
                this.config.annotations = config.limit.map(convertLimit);
            }
            this.displayChart();
        });
        config.dataSource.on('sources', (msg) => { 
            this.config.sources = msg.addr.sources;
            this.displayChart();
        });
        config.dataSource.on('notification', (msg) => {
            this.config.overlay = `<div class="ksa-splash">
                <center>
                <p><strong>${msg.message}</strong></p>
                <p>${msg.note}</p>
                </center>
            </div>`;
            this.displayChart();
        });
    },
    displayLoading: function () {
      if (this.loadingTimeout)
          clearTimeout(this.loadingTimeout);
      this.config.chart = null;
      this.loadingTimeout = setTimeout(() => { this.displayNoData(); }, 5000);
      if (!this.$view)
        return;
      this.$view.innerHTML = '<div class="ksa-splash">Загрузка...</div>';
    },
    displayNoData: function () {
      this.config.chart = null;
      if (!this.$view)
        return;
      this.$view.innerHTML = '<div class="ksa-splash">Нет данных.</div>';
    },
    displayChart: function () {
        const sources   = this.config.sources;

        const data = this.config.chartData;

        if (!data && !this.config.overlay) {
            this.config.overlay = `<div class="ksa-splash">
                <center>
                <p>Нет данных.</p>
                </center>
            </div>`;
        }

        if (!this.$view) {
            return;
        }

        this.$view.innerHTML = this.config.overlay || '';

        makePlotController(this.$view, this.config.dataSource, this.storage);

        if (this.config.overlay) return;

        if (!this.config.chartData) {
            this.displayLoading();
            return;
        }

        const chartData = this.config.chartData
            .filter((item) => { 
                if (!sources || sources.length == 0)
                    return true;
                return sources.indexOf(item.source) !== -1; 
            });

        if (chartData.length == 0) {
            this.displayNoData();
            return;
        }
        const yFmt = (item) => { return item.value; }

        let seriesIndex = 0;

        function createSeries (data, limits) {
            const series = {}
                , output = []
                , legend = [];

            let endTime = -Infinity;                

            data.forEach((item) => {
                if (!series[item.source])
                    series[item.source] = [];
                let k;
                for (k in series) {
                    if (k === item.source) {
                        endTime = Math.max(endTime, item.time);
                        series[k].push({
                            x: item.time,
                            y: item.value
                        });
                    } else {
                        series[k].push(null);
                    }
                }
            });
            $.each(series, (k, items) => {
                seriesIndex += 1;
                output.push({
                    name: `series-${seriesIndex}`,
                    source: k,
                    data: items
                })
                legend.push(k)
            });

            if (Math.abs(endTime - time.js2unix(time.now())) < 10)  {
                console.log('AUTOUPDATE ON')
                //this.storage.setItem('plot-ctrl-update', true);
            }
            return {
                series:         output,
                legend:         legend
            };
        }
        
        if (this.loadingTimeout)
            clearTimeout(this.loadingTimeout);

        const parsedData = createSeries(chartData);

        this.config.chart = Chartist.Line(
            this.$view, 
            {
                labels: chartData.map((i) => { return i.time }),
                series: parsedData.series
            }, 
            {
                chartPadding: {
                    top: 38
                },
                lineSmooth: Chartist.Interpolation.none({
                    fillHoles: true,
                }),
                axisX: {
                    labelInterpolationFnc: function(value, index) {
                        if (chartData.length < 20)
                            return webix.i18n.timeFormatStr(time.unix2js(value));

                        return (index % (Math.ceil(chartData.length / 20)) === 0)
                            ? webix.i18n.timeFormatStr(time.unix2js(value))
                            : null;
                    }
                },
                plugins: [
                    Chartist.plugins.annotations({
                        annotations: this.config.annotations
                    }),
                    Chartist.plugins.legend({
                        legendNames: parsedData.legend
                    }),
                    Chartist.plugins.cursor({
                        format: function (_type, val) {
                            const labelFmt = webix.Date.dateToStr(webix.i18n.longDateTimeFormat); 
                            if (_type === 'label') {
                                return labelFmt(time.unix2js(val))
                            }   
                            if (_type === 'series') {
                                const seriesIndex = Number(val.replace('series-', ''))
                                return parsedData.legend[seriesIndex-1];
                            } else {
                                return webix.i18n.physValFormatStr(val);
                            }
                        }
                    })
                ]
        });
    },
    $setSize: function (x, y) {
        if (webix.ui.view.prototype.$setSize.call(this,x,y) && this.config.chart) {
            this.config.chart.update();
        }
    }
}, webix.ui.view);