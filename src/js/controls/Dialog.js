/**
 * Created by Yangz on 2016/3/10.
 */



define(['jquery', 'underscore', 'sobox'], function ($, _, sobox) {


    var disableFn=function(e){
        if($('body').hasClass('disableEvents')){
            e.preventDefault();
            e.stopPropagation();
        }
    };
    var body=document.getElementsByTagName('body')[0];
    if (window.addEventListener) {
        body.removeEventListener('click', disableFn);
        body.addEventListener('click', disableFn, true);
    }

    return {

        pop: function (opts) {
            // {content:'',ok:function(){},cancel:function(){},okText:'',cancelText:''}
            opts = _.extend({}, {
                width: 'auto',
                btn: [
                    {
                        text: opts.okText || '确定',
                        removePop: opts.okRemovePop == undefined ? true : opts.okRemovePop,
                        callback: opts.ok
                    },
                    {text: opts.cancelText || '取消', cls: 'a-sopop-cancel', removePop: true, callback: opts.cancel}
                ]
            }, opts);
            return $.sobox.pop(opts);
        },


        //参数： (alert 弹窗标题，内容，点击确定返回事件)
        alert: function () {
            var title, content, callback = function () {
            };
            if (arguments.length) {
                switch (arguments.length) {
                    case 1:
                        title = '提示';
                        content = arguments[0];
                        break;
                    case 2:
                        title = arguments[0];
                        content = arguments[1];
                        break;
                    case 3:
                        title = arguments[0];
                        content = arguments[1];
                        callback = arguments[2];
                        break;
                    default:
                }
            }
            return $.sobox.alert(title, content, callback);
        },

        confirm: function (title, content, success, cancel) {
            var html = [
                '<table width="100%" class="mt_20 mb_20 tipsTable">',
                '<tbody>',
                '<tr>',
                '<td align="right" width="60"><i class="i-tips_qa"></i></td>',
                '<td><em class="tipsTxt">', content, '</em></td>',
                '</tr>',
                '</tbody>',
                '</table>'
            ].join('');
            return $.sobox.pop({
                title: title,
                content: html,
                btn: [
                    {
                        text: '确定', callback: function () {
                        if (success) {
                            success();
                        }
                    }
                    },
                    {
                        text: '取消', cls: 'a-sopop-cancel', callback: function () {
                        if (cancel) {
                            cancel();
                        }
                    }
                    }
                ]
            });
        },

        tips: function (content, time) {
            return $.sobox.tip({
                cls: 'so-popTip', // 默认添加私有样式为 so-popTip
                posType: 'ct', // 'ct','bt' 默认是ct:垂直上方,bt:垂直下方
                content: content,
                width: 'auto',
                height: 38,
                offset: [0, -75],
                stayTime: time * 1000 || 4000
            });
        },

        warn: function (text, title, success) {
            var content = [
                '<table width="100%" class="mt_20 mb_20 tipsTable">',
                '<tbody>',
                '<tr>',
                '<td align="right" width="60"><i class="i-tips"></i></td>',
                '<td><em class="tipsTxt">', text, '</em></td>',
                '</tr>',
                '</tbody>',
                '</table>'
            ].join('');

            return $.sobox.alert('提示' || title, content, success);
        },

        loading: function (time) {
            return $.sobox.loading({
                cls: 'so-loading', // 默认添加私有样式为 so-loading
                stayTime: time * 1000 || 0,// 小等于0时不自动关闭，默认值为0采用手动关闭
                width: 100,
                height: 100
            });
        }

    };
});