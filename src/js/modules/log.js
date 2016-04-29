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
    "text!../../template/pager.html",
    "text!../../template/log.html",
    "controls/List",
    'i18n/' + global.language,
    'jqueryUI',
    "dropkick",
    "controls/PagerView"
    //'lib/jquery-ui/i18n/datepicker-' + global.language
], function ($, _, Common, Backbone, Ajax, Dialog, pagerTpl,tpl, List, Lang, jqueryUI, dropkick,PagerView) {


    var B = Backbone,
        Model = B.Model,
        View = B.View;

    var typeAndAction= window.typeAndAction|| {
        data: [
            {text: '全部', value: 0},
            {text: '上传文件', value: 'upload'},
            {text: '下载文件', value: 'download'},
            {text: '复制文件（夹）', value: 'copy'},
            {text: '移动文件（夹）', value: 'move'},
            {text: '重命名文件（夹）', value: 'rename'},
            {text: '删除文件（夹）', value: 'delete'},
            {text: '创件文件夹', value: 'create_folder'}

            //{text:'预览文件',value:''},
            //{text:'复制文件夹',value:''},
            //{text:'移动文件夹',value:''},
            //{text:'重命名文件夹',value:''},
            //{text:'删除文件夹',value:''}
        ],
        user: [
            {text: '全部', value: 0},
            //{text:'登录',value:''},
            {text: '创建用户', value: 'add_user'},
            {text: '更新用户', value: 'update_user'},
            {text: '删除用户', value: 'del_user'}

        ],
        team: [
            {text: '全部', value: 0},
            {text: '创建团队', value: 'add_group'},
            //{text: '更新团队', value: 'update_group'},
            {text: '删除团队', value: 'delete_group'}
        ],
        grant: [
            {text: '全部', value: 0},
            {text: '创建权限', value: 'empower'},
            {text: '删除权限', value: 'revoke'}
        ]
    };


    var Log = {
        model: {
            corpId: function () {
                var corpId = Common.parseURL(location.href).params.corpId;
                return global.user.corpId || corpId || global.corpList[0].corpId
            }(),
            corpData: function () {
                var corpId = global.user.corpId || Common.parseURL(location.href).params.corpId;
                return _.find(window.global.corpList, function (v) {
                    return v.corpId == corpId
                });
            }()
        },
        dataAPI: _.extend({}, Common.APIObj, {
            fnName: {
                searchLog: 'log:searchLog'
            }
        })
    };


    var Models = {
        LogModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Log.dataAPI.getUrlByFnName('searchLog'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips('数据拉取失败！' + (data.code || ''));
                        console && console.log('error', data);
                    }
                };
                Ajax.request(opts);
            }
        })
    };


    var Views = {};


    Views.LogView = View.extend({
        el: '.mainContent',
        template: Common.getTemplate(tpl, '#log'),
        logModel: new Models.LogModel(),
        reqModel: new Model({
            corpId: Log.model.corpId,
            beginDate: $.datepicker.formatDate("yy-mm-dd", new Date()),
            endDate: $.datepicker.formatDate("yy-mm-dd", new Date()),
            pageIndex: 1,
            pageSize: 10,
            userName: '',
            operType: '',
            operAction: '',
            groupName: '',
            come_from: ''
        }),
        pagerModel:new Model({
            total:0,
            pageIndex: 1,
            pageSize: 10
        }),
        initialize: function () {


            this.listenTo(this.reqModel, 'change', this.getData);
            this.listenTo(this.logModel, 'change', this.renderDataGrid);

            this.render();
            this.initSelect();
            this.initDatepicker();
            this.getData();
            this.renderHead();
            this.renderPager();
            this.initStyle();

            $(window).off('resize.log').on('resize.log', this.initStyle);

        },
        render: function () {
            var html = Common.tpl2Html(this.template, {});
            this.$el.html(html).addClass('log');
        },
        events: {
            'change #opType': 'setSelect',
            'click .btn-ok': 'okFn',
            'keyup #opUser,#group': 'keyupFn'
        },
        initSelect: function () {
            this.opTypeSelect = new Dropkick($('#opType')[0]);
            this.actionSelect = new Dropkick($('#action')[0]);
            this.typeSelect = new Dropkick($('#type')[0]);
        },
        setSelect: function () {
            var opTypeSelect = $('#opType'),
                actionSelect = $('#action');
            var type = opTypeSelect.val();
            var subSelectData = typeAndAction[type] || [{text: '全部', value: 0}];
            subSelectData = _.map(subSelectData, function (v) {
                return ['<option value="', v.value, '">', v.text, '</option>'].join('');
            });
            actionSelect.html(subSelectData.join(''));
            this.actionSelect.refresh();
        },
        initDatepicker: function () {


            $.datepicker.regional['zh_CN'] = {
                closeText: '关闭',
                prevText: '&#x3C;上月',
                nextText: '下月&#x3E;',
                currentText: '今天',
                monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                    '七月', '八月', '九月', '十月', '十一月', '十二月'],
                monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月',
                    '七月', '八月', '九月', '十月', '十一月', '十二月'],
                dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
                dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                weekHeader: '周',
                dateFormat: 'yy/mm/dd',
                firstDay: 1,
                isRTL: false,
                showMonthAfterYear: true,
                yearSuffix: '年'
            };
            $.datepicker.setDefaults($.datepicker.regional['zh_CN']);


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
        keyupFn: function (e) {
            if (e.keyCode == 13) {
                this.okFn();
            }
        },
        okFn: function () {

            var opUser = $('#opUser'),
                opType = $('#opType'),
                action = $('#action'),
                group = $('#group'),
                type = $('#type');

            var beginDate = $(".sTime").datepicker("getDate", {dateFormat: 'yy-mm-dd'}),
                endDate = $(".eTime").datepicker("getDate", {dateFormat: 'yy-mm-dd'}),
                userName = opUser.val(),
                operType = opType.val() ? opType.val() : '',
                operAction = action.val() ? action.val() : '',
                groupName = group.val(),
                come_from = type.val() ? type.val() : '';

            beginDate=$.datepicker.formatDate("yy-mm-dd",beginDate);
            endDate=$.datepicker.formatDate("yy-mm-dd", endDate);

            this.reqModel.set({
                beginDate: beginDate,
                endDate: endDate,
                userName: userName,
                operType: operType==0?'':operType,
                operAction: operAction==0?'':operAction,
                groupName: groupName,
                come_from: come_from==0?'':come_from,
                pageIndex: 1
            }, {silent: true});

            this.reqModel.trigger('change');

        },
        getData: function () {
            this.logModel.fetch(this.reqModel.attributes);
        },
        renderDataGrid: function () {
            this.renderList();
        },
        renderHead: function () {

            var titleTpl = Common.getTemplate(tpl, '#log-title');

            $('.tableList thead').html(Common.tpl2Html(titleTpl));

        },
        renderList: function () {

            var list = this.logModel.toJSON().logList;
            var rowTpl = Common.getTemplate(tpl, '#log-row');

            list = _.map(list, function (v) {
                return Common.tpl2Html(rowTpl, v);
            });

            var rowHtml = list.join('');

            if (!list || (list && list.length == 0)) {
                rowHtml = '<tr class="no-data"><td align="center" colspan="5"><div class="tipsNoDate"><h5><i class="i-noDate"></i></h5><h4>暂无数据</h4></div></td></tr>';
            }

            $('.tableList tbody').html(rowHtml);

        },
        renderPager: function () {

            this.pagerView && this.pagerView.destroy();

            this.pagerView=new PagerView({
                el:'.pageBox',
                model:this.reqModel,
                dataModel:this.logModel
            });

        },
        initStyle: function () {
            var th=$('.log-head').height(),
                h=global.height-th-50-25;
            var str='.tableBox{height:'+h+'px}';
            Common.addStyle('log',str);
        }

    });


    return {
        init: function () {
            new Views.LogView();
        }
    }


});