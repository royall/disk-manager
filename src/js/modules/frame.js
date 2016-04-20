/**
 * Created by liuwei on 2016/3/1.
 */
define([
    'jquery',
    'underscore',
    "controls/Common",
    "text!../../template/head.html",
    "text!../../template/sidemenu.html"
], function ($, _, Common, template, sideTemp) {

    if (!window.global) {
        return {
            init: function () {
            }
        }
    }

    if(!window.global.corpList ||(window.global.corpList && !window.global.corpList.length)){
        window.global.corpList=[{"corpId":0,"domain":"","name":"","outDate":0,"pageIndex":0,"pageSize":0,"status":0,"storage":0,"userLimit":0}]
    }

    return {
        init: function () {
            this.renderSidebar();
            this.renderHead();
            this.initEvents();
            this.initStyle();
        },
        ui: {
            companyUl: '#company-ul',
            companySelect: '#company-select'
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

                //var text=$(this).text();
                //$(me.ui.companySelect).find('.fake_slt_txt').text(text).attr('title',text);
                //$(me.ui.companyUl).hide();
                //me.setUrl(corpId);

                return false;
            });

            $(me.ui.companySelect).on('click', function () {
                $(me.ui.companyUl).toggle();
            });

            $(window).off('resize.frame').on('resize.frame', this.initStyle);

        },
        model: {
            corpId: function () {
                if (!window.global) {
                    return 0
                }
                var corpId = Common.parseURL(location.href).params.corpId;
                return window.global.user.corpId || corpId
            }(),
            corpList: window.global.corpList
        },
        renderHead: function () {
            var me = this;
            var corpId = this.model.corpId;
            var nowCorp = _.find(this.model.corpList, function (v) {
                return v.corpId == corpId
            });
            nowCorp = nowCorp || this.model.corpList[0];
            var data = _.extend({}, window.global.user, {
                corpName: nowCorp.name,
                corpList: me.model.corpList,
                logoutUrl: window.global.logoutUrl || 'javascript:;'
            });
            var html = Common.tpl2Html(template, data);
            $(".topHead").html(html);
            $(me.ui.companySelect).find('.fake_slt_txt').text(nowCorp.name);

        },
        renderSidebar: function () {
            var html = Common.tpl2Html(sideTemp, moduleName);
            $(".sidebar").html(html);//moduleName为全局变量
            var corpId = this.model.corpId || this.model.corpList[0].corpId;
            this.setUrl(corpId);
        },
        setUrl: function (corpId) {
            $('#setting-link').attr('href', window.modules.setting + '.do?corpId=' + corpId);
            $('#user-manager-link').attr('href', window.modules.userManager + '.do?corpId=' + corpId);
            $('#log-link').attr('href', window.modules.log + '.do?corpId=' + corpId);
            $('#statistic-link').attr('href', window.modules.statistic + '.do?corpId=' + corpId);
        },
        initStyle: function () {
            var headH = $('.topHead').height();
            var windowH = $(window).height();
            var mainH = windowH - headH;
            var minH = 360;
            (mainH < minH) && (mainH = minH);
            var listH = mainH - 120 - 55;
            var tdH = parseInt(listH / 10, 10);
            var styleHtml = [
                '.wrapper,.sidebar,.subSiderBar,.rightContainer{height:', mainH, 'px}',
                //'#depart-wrap{height:', (mainH - 100), 'px}',
                //'.usermanager .tableList td,.setting .tableList td{line-height:', tdH - 12 - 2, 'px}'
            ];
            var $frameStyle = $('#frame-style');
            $frameStyle.length && $frameStyle.remove();
            var styleStr = ['<style id="frame-style" type="text/css" rel="stylesheet">', styleHtml.join(''), '</style>'].join('');
            $(styleStr).appendTo('head');
        }
    };

});