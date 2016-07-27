/**
 * Created by Yangz on 2016/3/1.
 */
define([
    'jquery',
    'underscore',
    "controls/Common",
    "text!../../template/head.html",
    "text!../../template/sidemenu.html",
    'controls/Dialog',
    'i18n/' + global.language,
    'controls/Ajax'
], function ($, _, Common, template, sideTemp, Dialog, Lang,Ajax) {

    if (!window.global) {
        return {
            init: function () {
            }
        }
    }

    if (!window.global.corpList || (window.global.corpList && !window.global.corpList.length)) {
        window.global.corpList = [{
            "corpId": 0,
            "domain": "",
            "name": "",
            "outDate": 0,
            "pageIndex": 0,
            "pageSize": 0,
            "status": 0,
            "storage": 0,
            "userLimit": 0
        }]
    }

    return {
        init: function () {
            this.renderSidebar();
            this.renderHead();
            this.renderVersion();
            this.initEvents();
            this.initStyle();
        },
        ui: {
            companyUl: '#company-ul',
            companySelect: '#company-select',
            userInfo: '#userInfo'
        },
        initEvents: function () {
            var me = this;

            $(me.ui.companyUl).find('li a').on('click', function () {
                var corpId = $(this).data('corpid');
                if (corpId == me.model.corpId) {
                    return
                }
                var urlObj = Common.parseURL(location.href);
                location.href = urlObj.file + '?corpId=' + corpId;
                return false;
            });

            $(me.ui.companySelect).on('click', function () {
                $(me.ui.companyUl).toggle();
            });

            $(me.ui.userInfo).on('click', function () {
                me.showInfo();
            });

            $('.licenseInfo').on('click',me.showLicense);

            $(window).off('resize.frame').on('resize.frame', this.initStyle);

        },
        model: {
            corpId: Common.getCorpId(),
            corpList: window.global.corpList
        },
        renderHead: function () {
            var me = this;
            var nowCorp = Common.getCorpData();
            try {
                var data = _.extend({
                    logoUrl:[Common.getUrlByName('getCorpLogo'),'&corpId=',me.model.corpId].join('')
                }, window.global.user, {
                    corpName: nowCorp.name,
                    corpList: me.model.corpList,
                    logoutUrl: window.global.logoutUrl || 'javascript:;'
                });

                var tpl = Common.getTemplate(template, '#head-tpl');
                var html = Common.tpl2Html(tpl, data);
                $(".topHead").html(html);
                $(me.ui.companySelect).find('.fake_slt_txt').text(nowCorp.name);

            } catch (e) {
                Dialog.alert(Lang.common.sysTips, Lang.common.getComInfoFail, function () {
                    location.href = global.logoutUrl;
                });
            }


        },
        showInfo: function () {
            var nowCorp = _.extend({}, Common.getCorpData());

            nowCorp.outDate = Common.getOutDate(nowCorp.outDate);
            nowCorp.storage = Common.formatStorageUnit(nowCorp.storage);
            nowCorp.userLimit = nowCorp.userLimit + Lang.setting.userUnit;
            nowCorp.status = Common.getStatus(nowCorp.status);

            var userData = _.extend({
                name: '',
                email: '',
                mobile: ''
            }, global.user);

            var data = {
                userData: userData,
                corpData: nowCorp
            };

            var tpl = Common.getTemplate(template, '#userInfo-tpl');
            var html = Common.tpl2Html(tpl, data);


            Dialog.pop({
                title: Lang.head.uncInfo,
                content: html,
                width: 400,
                btn: []
            });

        },
        renderSidebar: function () {
            var corpId = this.model.corpId || this.model.corpList[0].corpId;

            var html = Common.tpl2Html(sideTemp, {moduleName:window.moduleName,corpId:corpId});
            $(".sidebar").html(html);

        },
        renderVersion:function () {
            var html='<div class="btmCopyInfo"> 版权所有:彩讯科技股份有限公司&nbsp;&nbsp;版本号:'+(global.version||'5.0.0')+'&nbsp;&nbsp;<a href="javascript:void(0);" class="licenseInfo">许可证信息</a></div>';
            $('body').append(html);
        },
        showLicense:function () {

            var opts = {
                url: Common.getUrlByName('getLicenseInfo'),
                data: {},
                success: function (data) {
                    var html=Common.getTemplate(template,'#licence');
                    var arr=[];
                    _.each(data.vasInfo,function(v){
                        arr.push(v);
                    });
                    data.vasInfoArr=arr;
                    data.version=global.version;
                    html=Common.tpl2Html(html,data);
                    Dialog.pop({
                        title:'许可证信息',
                        content:html,
                        btn:[],
                        width:530
                    });

                },
                fail: function (data) {
                    Dialog.tips(Common.mergeErrMsg('获取许可证信息失败', data));
                }
            };

            Ajax.request(opts);

        },
        initStyle: function () {
            var headH = $('.topHead').height();
            var footerH = $('.btmCopyInfo').height()+1;
            var windowH = $(window).height();
            var mainH = windowH - headH-footerH;
            var minH = 360;
            (mainH < minH) && (mainH = minH);
            global.height = mainH;
            var listH = mainH - 120 - 55;
            var tdH = parseInt(listH / 10, 10);
            var styleHtml = [
                '.wrapper,.sidebar,.subSiderBar,.rightContainer{height:', mainH, 'px}'
                //'#depart-wrap{height:', (mainH - 100), 'px}',
                //'.usermanager .tableList td,.setting .tableList td{line-height:', tdH - 12 - 2, 'px}'
            ];
            Common.addStyle('frame', styleHtml.join(''));
        }
    };

});