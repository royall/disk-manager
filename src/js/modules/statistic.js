/**
 * Created by Yangz on 2016/3/18.
 */


define([
    'jquery',
    'underscore',
    "controls/Common",
    'backbone',
    'controls/Ajax',
    "controls/Dialog",
    'echarts',
    "text!../../template/pager.html",
    "text!../../template/statistic.html",
    'i18n/' + global.language,
    "controls/PagerView",
    'lib/jquery-ui/i18n/datepicker-' + global.language
], function ($, _, Common, Backbone, Ajax, Dialog, echarts, pagerTpl, tpl, Lang, PagerView) {

    var stLang = Lang.statistic,
        cLang = Lang.common;

    var B = Backbone,
        Model = B.Model,
        View = B.View;

    var Statistic = {
        model: {
            corpId: Common.getCorpId(),
            corpData: Common.getCorpData()
        }
    };

    var Models = {
        //文件大小，个数统计model
        FileCountModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getFileCount'),
                    data: options,
                    success: function (data) {
                        //console.log('文件大小',data);
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(cLang.fetchFail, data));
                        console && console.log('error', data)
                    }
                };
                Ajax.request(opts);
            }
        }),

        FileOpModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getFileOperate'),
                    data: options,
                    success: function (data) {
                        //console.log('文件操作次数',data);
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(cLang.fetchFail, data));
                        console && console.log('error', data)
                    }
                };
                Ajax.request(opts);
            }
        }),

        UseStorageModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getUseStorage'),
                    data: options,
                    success: function (data) {
                        //console.log('空间统计',data);
                        model.clear({silent: true});
                        model.set({
                            used: data
                        });
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(cLang.fetchFail, data));
                    }
                };
                Ajax.request(opts);
            }
        }),

        UseStorageDetailModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getUseStorageDetail'),
                    data: options,
                    success: function (data) {
                        //console.log('getUseStorageDetail',data);
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(cLang.fetchFail, data));
                        console && console.log('getUseStorageDetail error', data)
                    }
                };
                Ajax.request(opts);
            }
        }),

        TeamStorageModel: Model.extend({
            defaults: {
                "pageIndex": 1,
                "pageSize": 10,
                "total": 0,
                "countList": []
            },
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getTeamStorage'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(cLang.fetchFail, data));
                        model.trigger('change');
                        console && console.log('TeamStorageModel error', data)
                    }
                };
                Ajax.request(opts);
            }
        }),

        GroupStorageModel: Model.extend({
            defaults: {
                "pageIndex": 1,
                "pageSize": 10,
                "total": 0,
                "groupList": [],
                "storageSum": 0,
                "usedStorageSum": 0
            },
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getGroupStorage'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(cLang.fetchFail, data));
                        model.trigger('change');
                        console && console.log('getGroupStorage error', data)
                    }
                };
                Ajax.request(opts);
            }
        }),

        PersonStorageModel: Model.extend({
            defaults: {
                "pageIndex": 1,
                "pageSize": 10,
                "total": 0,
                "userList": []
            },
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getPersonStorage'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(cLang.fetchFail, data));
                        model.trigger('change');
                        console && console.log('PersonStorageModel error', data)
                    }
                };
                Ajax.request(opts);
            }
        })


    };

    var Views = {};

    //统计页主View
    Views.MainView = View.extend({
        template: Common.getTemplate(tpl, '#main-box'),
        el: '.mainContent',
        nowModule: null,
        events: {
            'click .secMenu li a': 'moduleSwitch'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var html = Common.tpl2Html(this.template, {});
            this.$el.html(html);
            this.nowModule = new Views.FileView();
        },
        moduleSwitch: function (e) {
            var $this = $(e.currentTarget);
            var module = $this.data('module');
            if ($this.hasClass('act')) {
                return
            }
            $('.secMenu a').removeClass('act');
            $this.addClass('act');

            this.nowModule.destroy();

            this.nowModule = null;
            switch (module) {
                case 'file':
                    this.nowModule = new Views.FileView();
                    break;
                case 'space':
                    this.nowModule = new Views.SpaceView();
                    break;
                default:
            }

        }
    });


    //文件统计
    Views.FileView = View.extend({
        className: 'files',
        template: Common.getTemplate(tpl, '#file'),
        fileCountModel: new Models.FileCountModel(),
        fileOpModel: new Models.FileOpModel(),
        events: {
            'click .tabAbox a': 'setTime',
            'click .btn-ok': 'getOpData'
        },
        initialize: function () {
            var me = this;

            this.listenTo(this.fileCountModel, 'change', _.bind(this.renderSizeChart, this));
            this.listenTo(this.fileOpModel, 'change', _.bind(this.renderOpChart, this));

            this.render();
            this.initDatepicker();
            this.initChart();

            this.initData();

            $(window).off('resize.file').on('resize.file', function () {
                me.resize()
            });
        },
        render: function () {
            var html = Common.tpl2Html(this.template);
            this.$el.html(html).appendTo('.container');
        },
        initDatepicker: function () {

            var $sTime = $(".sTime"),
                $eTime = $(".eTime");

            $sTime.datepicker({
                dateFormat: 'yy-mm-dd',
                constrainInput: true,
                defaultDate: new Date(),
                maxDate: new Date(),
                onClose: function (selectedDate) {
                    $eTime.datepicker("option", "minDate", selectedDate);
                }
            });

            $sTime.datepicker('setDate', new Date());

            $eTime.datepicker({
                dateFormat: 'yy-mm-dd',
                constrainInput: true,
                defaultDate: new Date(),
                maxDate: new Date(),
                onClose: function (selectedDate) {
                    $sTime.datepicker("option", "maxDate", selectedDate);
                }
            });
            $eTime.datepicker('setDate', new Date());

        },
        setTime: function (e) {
            var $this = $(e.currentTarget);
            var day = $this.data('day');
            $this.addClass('act').siblings().removeClass('act');

            var $sTime = $(".sTime"),
                $eTime = $(".eTime");

            $sTime.datepicker('setDate', '-' + (day - 1) + 'd');
            $eTime.datepicker('setDate', new Date());

            this.getOpData()


        },
        getOpData: function () {
            var $sTime = $(".sTime"),
                $eTime = $(".eTime");
            var sTime = $sTime.datepicker("getDate", {dateFormat: 'yy-mm-dd'}),
                eTime = $eTime.datepicker("getDate", {dateFormat: 'yy-mm-dd'});

            if (!sTime || !eTime) {
                return
            }

            sTime = $.datepicker.formatDate("yy-mm-dd", sTime);
            eTime = $.datepicker.formatDate("yy-mm-dd", eTime);


            this.fileOpModel.fetch({
                corpId: Statistic.model.corpId,
                beginDate: sTime,
                endDate: eTime
            });


        },
        initData: function () {

            this.fileCountModel.fetch({
                corpId: Statistic.model.corpId
            });

            var $sTime = $(".sTime"),
                $eTime = $(".eTime");
            var sTime = $sTime.datepicker("getDate", {dateFormat: 'yy-mm-dd'}),
                eTime = $eTime.datepicker("getDate", {dateFormat: 'yy-mm-dd'});

            if (!sTime || !eTime) {
                return
            }

            sTime = $.datepicker.formatDate("yy-mm-dd", sTime);
            eTime = $.datepicker.formatDate("yy-mm-dd", eTime);


            this.fileOpModel.fetch({
                corpId: Statistic.model.corpId,
                beginDate: sTime,
                endDate: eTime
            });

        },
        initChart: function () {
            this.fileSizeChart = echarts.init(document.getElementById('size'));
            this.fileCountChart = echarts.init(document.getElementById('count'));
            this.fileOpChart = echarts.init(document.getElementById('op'));
        },
        destroyChart: function () {
            this.fileSizeChart.dispose();
            this.fileCountChart.dispose();
            this.fileOpChart.dispose();
        },
        renderSizeChart: function () {

            var data = this.fileCountModel.attributes;

            var sizeData = [], countData = [], nameData = [], sizeUnit;
            _.each(data, function (v) {
                sizeData.push(v.fileSize);
                countData.push(v.fileCount);
                nameData.push(v.fileSortName);
            });

            var sumSize = eval(sizeData.join("+"));
            var sumCount = eval(countData.join("+"));
            var sumText = Common.formatStorageUnit(sumSize);
            $('.sum-size').text(sumText);
            $('.sum-count').text(sumCount);
            //console.log(sumText);

            //转换数据的单位，以最大的为准
            var maxSize = Math.max.apply(null, sizeData);
            var unitObj = Common.formatStorageUnit(maxSize, true),
                unit = unitObj.unit;
            sizeData = _.map(sizeData, function (v) {
                return Common.formatStorageUnit(v, true, unit).num
            });


            // 指定图表的配置项和数据
            var baseOption = {
                grid: {
                    show: true,
                    left: 0,
                    right: 45,
                    top: 15,
                    bottom: 15,
                    containLabel: true,
                    borderWidth: 1,
                    borderColor: '#E9E9E9'
                },
                label: {
                    emphasis: {
                        show: true,
                        position: 'top'
                    },
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                tooltip: {},
                itemStyle: {
                    normal: {
                        color: '#88AFF4'
                    }
                },
                xAxis: {
                    //轴线
                    axisLine: {
                        show: false
                    },
                    //刻度线
                    axisTick: {
                        show: false
                    },
                    //网格线
                    splitLine: {
                        show: false
                    },
                    data: nameData
                },
                yAxis: {
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "#E9E9E9"
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "#E9E9E9"
                        }
                    },
                    splitNumber: 3
                }
            };

            var sizeOption = $.extend(true, {}, baseOption, {
                yAxis: {
                    axisLabel: {
                        formatter: '{value}' + unit
                    }
                },
                series: [
                    {
                        type: 'bar',
                        name: stLang.fileSize2,
                        data: sizeData,
                        barWidth: 40,
                        markLine: {
                            data: [
                                {type: 'average', name: stLang.avg, symbolSize: 5}
                            ]
                        }
                    }
                ]
            });

            var countOption = _.extend({}, baseOption, {
                series: [
                    {
                        type: 'bar',
                        name: stLang.fileCount,
                        data: countData,
                        barWidth: 40,
                        markLine: {
                            data: [
                                {type: 'average', name: stLang.avg, symbolSize: 5}
                            ]
                        }
                    }
                ]
            });

            this.fileSizeChart.setOption(sizeOption);
            this.fileCountChart.setOption(countOption);
        },
        renderOpChart: function () {
            var addChainCount = [],
                delCount = [],
                downloadCount = [],
                uploadCount = [],
                operDate = [];

            _.each(this.fileOpModel.attributes, function (v) {
                addChainCount.push(v.addChainCount);
                delCount.push(v.delCount);
                downloadCount.push(v.downloadCount);
                uploadCount.push(v.uploadCount);
                operDate.push(v.operDate);
            });

            var startDate = new Date(operDate[0].replace(/-/g, '/')),
                endDate = new Date(operDate[operDate.length - 1].replace(/-/g, '/'));

            //时间差24小时之内，只显示小时，不显示年月日
            if (Math.abs(endDate - startDate) / 1000 / 60 / 60 < 24) {
                operDate = _.map(operDate, function (v) {
                    var data = new Date(v.replace(/-/g, '/')),
                        h = data.getHours(),
                        m = data.getMinutes();
                    return [h, m > 10 ? m : '0' + m].join(':');
                });
            }


            var option = {
                grid: {
                    show: true,
                    left: 10,
                    right: 35,
                    top: 40,
                    bottom: 10,
                    containLabel: true,
                    borderWidth: 1,
                    borderColor: '#E9E9E9'
                },
                tooltip: {
                    trigger: 'axis'
                    //formatter: function (params) {
                    //    var h=_.map(params, function () {
                    //
                    //        return params
                    //
                    //    });
                    //    //params = params[0];
                    //    console.log('params',params)
                    //
                    //    return params;
                    //},
                    //axisPointer: {
                    //    animation: false
                    //}
                },
                legend: {
                    data: [stLang.upload, stLang.download, stLang.link, stLang.del],
                    right: 40,
                    top: 10,
                    itemWidth: 20,
                    itemHeight: 10,
                    itemGap: 25
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: operDate,
                    axisLine: {
                        show: false
                    },
                    //刻度线
                    axisTick: {
                        show: false
                    },
                    //网格线
                    splitLine: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "#E9E9E9"
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "#E9E9E9"
                        }
                    },
                    splitNumber: 3
                },
                series: [
                    {
                        name: stLang.upload,
                        type: 'line',
                        //stack: '总量',
                        data: uploadCount,
                        symbolSize: 8,
                        //smooth:true,
                        lineStyle: {
                            normal: {
                                color: '#ff4242'
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: "#ff4242"

                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#ff4242'
                                }, {
                                    offset: 1,
                                    color: '#fff'
                                }]),
                                opacity: 0.1
                            }
                        }
                    },
                    {
                        name: stLang.download,
                        type: 'line',
                        //stack: '总量',
                        data: downloadCount,
                        symbolSize: 8,
                        //smooth:true,
                        lineStyle: {
                            normal: {
                                color: '#3b72e7'
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: "#3b72e7"
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#3b72e7'
                                }, {
                                    offset: 1,
                                    color: '#fff'
                                }]),
                                opacity: 0.1
                            }
                        }
                    },
                    {
                        name: stLang.link,
                        type: 'line',
                        //stack: '总量',
                        data: addChainCount,
                        symbolSize: 8,
                        //smooth:true,
                        lineStyle: {
                            normal: {
                                color: '#3bc730'
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: "#3bc730"
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#3bc730'
                                }, {
                                    offset: 1,
                                    color: '#fff'
                                }]),
                                opacity: 0.1
                            }
                        }
                    },
                    {
                        name: stLang.del,
                        type: 'line',
                        //stack: '总量',
                        data: delCount,
                        symbolSize: 8,
                        //smooth:true,
                        lineStyle: {
                            normal: {
                                color: '#e74ecc'
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: "#e74ecc"
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#e74ecc'
                                }, {
                                    offset: 1,
                                    color: '#fff'
                                }]),
                                opacity: 0.1
                            }
                        }
                    }
                ]
            };

            this.fileOpChart.setOption(option);

        },
        resize: _.throttle(function () {
            this.fileSizeChart.resize();
            this.fileCountChart.resize();
            this.fileOpChart.resize();
        }, 1000),
        destroy: function () {
            this.destroyChart();
            this.fileCountModel.clear({silent: true});
            this.fileOpModel.clear({silent: true});
            //this.useStorageModel.clear({silent:true});
            this.undelegateEvents();
            $(window).off('resize.file');
            this.remove();
        }
    });


    //空间统计
    Views.SpaceView = View.extend({
        className: 'space',
        template: Common.getTemplate(tpl, '#space'),
        useStorageModel: new Models.UseStorageModel(),
        useStorageDetailModel: new Models.UseStorageDetailModel(),
        personStorageModel: new Models.PersonStorageModel(),
        teamStorageModel: new Models.TeamStorageModel(),
        groupStorageModel: new Models.GroupStorageModel(),
        initialize: function () {
            var me = this;
            this.render();

            this.dataModel = this.teamStorageModel;

            this.reqModel = new Model({
                type: 'team',
                corpId: Statistic.model.corpId,
                sort: '',
                orderFlag: '',
                pageSize: 10,
                pageIndex: 1
            });

            this.listenTo(this.useStorageModel, 'change', _.bind(this.renderUseStorageChar, this));
            this.listenTo(this.useStorageDetailModel, 'change', _.bind(this.renderUseStorageDetailChar, this));
            this.listenTo(this.personStorageModel, 'change', _.bind(this.renderDataGrid, this));
            this.listenTo(this.teamStorageModel, 'change', _.bind(this.renderDataGrid, this));
            this.listenTo(this.groupStorageModel, 'change', _.bind(this.renderDataGrid, this));
            this.listenTo(this.reqModel, 'change', _.bind(this.getData, this));

            this.initChart();
            this.initDatepicker();
            this.initData();
            this.renderHead();
            this.renderPager();
            $(window).off('resize.space').on('resize.space', function () {
                me.resize()
            });

        },
        events: {
            'click .tabAbox a': 'setTime',
            'click .btn-ok': 'getOpData',
            'click .space_tab .set_tab_c': 'switchTab',
            'click .btn-export': 'exportLog',
            'click .sortLink': 'setOrder',
            'click .btn-search': 'search',
            'keyup .name .inputAdd': 'keySearch'
        },
        render: function () {
            var html = Common.tpl2Html(this.template);
            this.$el.html(html).appendTo('.container');
        },
        initDatepicker: function () {

            var $sTime = $(".sTime"),
                $eTime = $(".eTime");

            $sTime.datepicker({
                dateFormat: 'yy-mm-dd',
                constrainInput: true,
                defaultDate: new Date(),
                maxDate: new Date(),
                onClose: function (selectedDate) {
                    $eTime.datepicker("option", "minDate", selectedDate);
                }
            });

            $sTime.datepicker('setDate', new Date());

            $eTime.datepicker({
                dateFormat: 'yy-mm-dd',
                constrainInput: true,
                defaultDate: new Date(),
                maxDate: new Date(),
                onClose: function (selectedDate) {
                    $sTime.datepicker("option", "maxDate", selectedDate);
                }
            });
            $eTime.datepicker('setDate', new Date());

        },
        setTime: function (e) {

            var $this = $(e.currentTarget);
            var day = $this.data('day');
            $this.addClass('act').siblings().removeClass('act');

            var $sTime = $(".sTime"),
                $eTime = $(".eTime");

            $sTime.datepicker('setDate', '-' + (day - 1) + 'd');
            $eTime.datepicker('setDate', new Date());

            this.getOpData();

        },
        getOpData: function () {
            var $sTime = $(".sTime"),
                $eTime = $(".eTime");
            var sTime = $sTime.datepicker("getDate", {dateFormat: 'yy-mm-dd'}),
                eTime = $eTime.datepicker("getDate", {dateFormat: 'yy-mm-dd'});

            if (!sTime || !eTime) {
                return
            }

            sTime = $.datepicker.formatDate("yy-mm-dd", sTime);
            eTime = $.datepicker.formatDate("yy-mm-dd", eTime);


            this.useStorageDetailModel.fetch({
                corpId: Statistic.model.corpId,
                beginDate: sTime,
                endDate: eTime
            });


        },
        initData: function () {

            this.useStorageModel.fetch({
                corpId: Statistic.model.corpId
            });

            var $sTime = $(".sTime"),
                $eTime = $(".eTime");
            var sTime = $sTime.datepicker("getDate", {dateFormat: 'yy-mm-dd'}),
                eTime = $eTime.datepicker("getDate", {dateFormat: 'yy-mm-dd'});

            if (!sTime || !eTime) {
                return
            }

            sTime = $.datepicker.formatDate("yy-mm-dd", sTime);
            eTime = $.datepicker.formatDate("yy-mm-dd", eTime);

            this.useStorageDetailModel.fetch({
                corpId: Statistic.model.corpId,
                beginDate: sTime,
                endDate: eTime
            });


            this.getData();

            //this.getPersonStorage();
            //this.getStorage();

        },
        initChart: function () {
            this.useStorageChart = echarts.init(document.getElementById('space1'));
            this.useStorageDetailChart = echarts.init(document.getElementById('space2'));
        },
        destroyChart: function () {
            this.useStorageChart.dispose();
            this.useStorageDetailChart.dispose();
        },
        renderUseStorageChar: function () {
            //console.log(this.useStorageModel);
            var all = Statistic.model.corpData.storage;
            var used = this.useStorageModel.attributes.used;
            var rest = all - used;

            var uObj = Common.formatStorageUnit(all, true);

            used = Common.formatStorageUnit(used, true, uObj.unit).num;
            rest = Common.formatStorageUnit(rest, true, uObj.unit).num;

            $('.size-all').html(Common.formatStorageUnit(all));

            var option = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c}" + uObj.unit + " ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 300,
                    bottom: 20,
                    data: [stLang.availableSpace, stLang.usedSpace],
                    itemWidth: 10,
                    itemHeight: 10,
                    itemGap: 10
                },
                series: [
                    {
                        name: stLang.space,
                        type: 'pie',
                        radius: '80%',
                        center: [150, '48%'],
                        label: {
                            normal: {
                                show: false

                            },
                            emphasis: {
                                show: false
                            }
                        },
                        data: [
                            {
                                value: used,
                                name: stLang.usedSpace,
                                itemStyle: {
                                    normal: {
                                        color: "#e74ecc"
                                    }
                                }
                            },
                            {
                                value: rest,
                                name: stLang.availableSpace,
                                itemStyle: {
                                    normal: {
                                        color: "#6797fb"
                                    }
                                }
                            }
                        ]
                    }
                ]
            };

            this.useStorageChart.setOption(option);

            //console.log('rest',rest);

        },
        renderUseStorageDetailChar: function () {
            var useStorage = [],
                operDate = [];

            _.each(this.useStorageDetailModel.attributes, function (v) {
                useStorage.push(v.fileSize);
                operDate.push(v.operDate);
            });

            //转换数据的单位，以最大的为准
            var maxSize = Math.max.apply(null, useStorage);
            var unitObj = Common.formatStorageUnit(maxSize, true),
                unit = unitObj.unit;
            useStorage = _.map(useStorage, function (v) {
                return Common.formatStorageUnit(v, true, unit).num
            });

            var startDate = new Date(operDate[0].replace(/-/g, '/')),
                endDate = new Date(operDate[operDate.length - 1].replace(/-/g, '/'));

            //时间差24小时之内，只显示小时，不显示年月日
            if (Math.abs(endDate - startDate) / 1000 / 60 / 60 < 24) {
                operDate = _.map(operDate, function (v) {
                    var data = new Date(v.replace(/-/g, '/')),
                        h = data.getHours(),
                        m = data.getMinutes();
                    return [h, m > 10 ? m : '0' + m].join(':');
                    //return v.split(' ')[1]
                });
            }

            var option = {
                grid: {
                    show: true,
                    left: 10,
                    right: 35,
                    top: 40,
                    bottom: 15,
                    containLabel: true,
                    borderWidth: 1,
                    borderColor: '#E9E9E9'
                },
                tooltip: {
                    trigger: 'axis'
                },
                //legend: {
                //    data: ['上传', '下载', '创建外链', '删除'],
                //    right:40,
                //    top:10,
                //    itemWidth:20,
                //    itemHeight:10,
                //    itemGap:25,
                //},
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: operDate,
                    axisLine: {
                        show: false
                    },
                    //刻度线
                    axisTick: {
                        show: false
                    },
                    //网格线
                    splitLine: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "#E9E9E9"
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "#E9E9E9"
                        }
                    },
                    splitNumber: 3,
                    axisLabel: {
                        formatter: '{value}' + unit
                    }
                },
                series: [
                    {
                        name: stLang.used,
                        type: 'line',
                        //stack: '总量',
                        data: useStorage,
                        symbolSize: 8,
                        //smooth:true,
                        lineStyle: {
                            normal: {
                                color: '#e74ecc'
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: "#e74ecc"
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#e74ecc'
                                }, {
                                    offset: 1,
                                    color: '#fff'
                                }]),
                                opacity: 0.1
                            }
                        }
                    }
                ]
            };


            this.useStorageDetailChart.setOption(option);

        },
        switchTab: function (e) {
            var $this = $(e.currentTarget);
            if ($this.hasClass('on')) {
                return
            }
            $this.addClass('on').siblings().removeClass('on');
            var type = $this.data('type');
            this.type = type;
            var em = $('.name em'),
                input = $('.name input');
            var $groupInfo = $('.groupInfo');

            switch (type) {
                case 'person':
                    this.dataModel = this.personStorageModel;
                    em.text(Lang.userManager.userName);
                    input.attr('placeholder', stLang.searchByUserId).val('');
                    $groupInfo.hide();
                    break;
                case 'team':
                    this.dataModel = this.teamStorageModel;
                    em.text(stLang.libName);
                    input.attr('placeholder', stLang.searchByLibName).val('');
                    $groupInfo.hide();
                    break;
                case 'group':
                    this.dataModel = this.groupStorageModel;
                    em.text(stLang.groupName);
                    input.attr('placeholder', stLang.searchByGroupName).val('');
                    $groupInfo.show();
                    break;
                default:
            }
            this.reqModel.unset('name', {silent: true});
            this.reqModel.set({
                type: type,
                pageIndex: 1,
                sort: '',
                orderFlag: ''
            });
            this.renderHead();
        },
        getData: function () {
            this.dataModel.fetch(this.reqModel.toJSON());
        },
        keySearch: function (e) {
            if (e.keyCode == 13) {
                this.search();
            }
        },
        search: function () {

            var keyword = $('.name .inputAdd').val();
            if (keyword == '') {
                this.reqModel.unset('name');
            } else {
                this.reqModel.unset('name', {silent: true});
                this.reqModel.set({
                    name: keyword,
                    pageIndex: 1
                });
            }
        },
        renderDataGrid: function () {
            this.renderList();
            this.renderPager();
        },
        renderHead: function () {

            var titleTpl;
            var type = this.reqModel.attributes.type;

            switch (type) {
                case 'person':
                    titleTpl = Common.getTemplate(tpl, '#person-title');
                    break;
                case 'team':
                    titleTpl = Common.getTemplate(tpl, '#team-title');
                    break;
                case 'group':
                    titleTpl = Common.getTemplate(tpl, '#group-title');
                    break;
            }
            $('.tableList thead').html(Common.tpl2Html(titleTpl));


        },
        renderList: function () {
            var list;
            var rowTpl = '';
            var type = this.reqModel.attributes.type;
            var column;

            switch (type) {
                case 'person':
                    list = this.personStorageModel.toJSON().userList;
                    rowTpl = Common.getTemplate(tpl, '#person-row');
                    column = 5;
                    break;
                case 'team':
                    list = this.teamStorageModel.toJSON().countList;
                    rowTpl = Common.getTemplate(tpl, '#team-row');
                    column = 6;
                    break;
                case 'group':
                    var data = this.groupStorageModel.toJSON();
                    list = data.groupList;
                    rowTpl = Common.getTemplate(tpl, '#group-row');
                    column = 3;
                    $('.teamCoop-all').text(Common.formatStorageUnit(data.storageSum));
                    $('.teamCoop-used').text(Common.formatStorageUnit(data.usedStorageSum));

                    break;
            }

            list = _.map(list, function (v) {

                v.unUsedStorage = v.unUsedStorage || 0;
                v.storage != undefined && (v.storage = Common.formatStorageUnit(v.storage));
                v.usedStorage != undefined && (v.usedStorage = Common.formatStorageUnit(v.usedStorage));
                v.unUsedStorage != undefined && (v.unUsedStorage = Common.formatStorageUnit(v.unUsedStorage));


                return Common.tpl2Html(rowTpl, v);
            });

            var rowHtml = list.join('');

            if (!list || (list && list.length == 0)) {
                rowHtml = '<tr class="no-data"><td align="center" colspan="' + column + '"><div class="tipsNoDate"><h5><i class="i-noDate"></i></h5><h4>' + Lang.common.noData + '</h4></div></td></tr>';
            }

            $('.tableList tbody').html(rowHtml);

        },
        renderPager: function () {

            var type = this.reqModel.toJSON().type;
            var model;
            switch (type) {
                case 'person':
                    model = this.personStorageModel;

                    break;
                case 'team':
                    model = this.teamStorageModel;
                    break;
                case 'group':
                    model = this.groupStorageModel;
                    break;
            }

            this.pagerView && this.pagerView.destroy();

            this.pagerView = new PagerView({
                el: '.pageBox',
                model: this.reqModel,
                dataModel: model
            });

        },
        setOrder: function (e) {
            var $this = $(e.currentTarget),
                orderFlag = $this.data('orderflag'),
                sort = $this.data('sort');

            this.reqModel.set({
                orderFlag: orderFlag,
                sort: sort ? 'desc' : 'asc'
            });

            var className = sort ? 'i-arrDown' : 'i-arrUp';
            $('.i-arr').removeClass('i-arrDown').removeClass('i-arrUp');

            $this.data('sort', !sort).find('.i-arr').addClass(className);

        },
        exportLog: function () {

            var type = this.reqModel.attributes.type;
            var href;
            switch (type) {
                case 'person':
                    href = Common.getUrlByName('getPersonStorage');
                    break;
                case 'team':
                    href = Common.getUrlByName('getTeamStorage');
                    break;
                case 'group':
                    href = Common.getUrlByName('getGroupStorage');
                    break;
            }
            var name = this.reqModel.attributes.name;
            name = name ? ('&name=' + name) : '';
            location.href = [href, '&corpId=', Statistic.model.corpId, '&export=1', name].join('');

        },
        resize: _.throttle(function () {
            this.useStorageChart.resize();
            this.useStorageDetailChart.resize();
        }, 1000),
        destroy: function () {
            this.destroyChart();
            this.useStorageModel.clear({silent: true});
            this.useStorageDetailModel.clear({silent: true});
            this.undelegateEvents();
            $(window).off('resize.space');
            this.remove();
        }
    });


    return {
        init: function () {
            if (!document.createElement('canvas').getContext) {
                Dialog.alert('您的浏览器版本太低，统计管理页面暂不支持该版本的浏览器，请使用Chrome、Firefox或IE9(+)等浏览器浏览此页面。');
                return;
            }
            new Views.MainView();
        }
    }
});