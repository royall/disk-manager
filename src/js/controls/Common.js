/**
 * Created by Yangz on 2016/3/7.
 */
global.language = global.language || 'zh_CN';
define(['jquery', 'underscore', 'i18n/' + global.language], function ($, _, Lang) {


    return {

        /**
         * Module类
         */
        Module: {
            nowModule: {},
            callModule: function (module) {
                var param = Array.prototype.slice.call(arguments, 0);
                param.shift();
                var nowModuleDestroyFn = this.nowModule.destroy;
                var newModuleInitFn = module.init;
                if (newModuleInitFn && _.isFunction(newModuleInitFn)) {
                    nowModuleDestroyFn && _.isFunction(nowModuleDestroyFn) && nowModuleDestroyFn.apply(this.nowModule);
                    this.nowModule = module;
                    newModuleInitFn.apply(module, param);
                }
            }
        },

        /**
         * APIObj基础类
         */
        APIObj: {
            url: 'admin.do',
            fnName: {},
            getUrlByFnName: function (name) {
                if (name && this.fnName[name]) {
                    return [this.url, '?func=', this.fnName[name]].join('')
                } else {
                    console.log(Lang.common.invalidFn);
                }
            }
        },

        /**
         * 格式化小数位
         * @param num
         * @param decimal
         * @returns {*}
         */
        formatFloat: function (num, decimal) {
            var floatNum = num.toFixed(decimal);
            if (parseInt(floatNum, 10) == floatNum) {
                return parseInt(floatNum, 10);
            } else {
                return floatNum;
            }
        },

        /**
         * 格式化存储单位，
         * @param size 大小。单位B
         * @param returnObj 是否返回格式化的对象
         * @param unitStr 是否转化固定单位
         */
        formatStorageUnit: function (size, returnObj, unitStr) {
            var K = 1024,
                M = 1024 * 1024,
                G = 1024 * 1024 * 1024,
                T = 1024 * 1024 * 1024 * 1024;
            var num, unit;
            if (unitStr) {
                switch (unitStr) {
                    case 'B':
                        num = this.formatFloat(size, 1);
                        break;
                    case 'K':
                    case 'KB':
                        num = this.formatFloat(size / K, 1);
                        break;
                    case 'M':
                    case 'MB':
                        num = this.formatFloat(size / M, 1);
                        break;
                    case 'G':
                    case 'GB':
                        num = this.formatFloat(size / G, 1);
                        break;
                    case 'T':
                    case 'TB':
                        num = this.formatFloat(size / T, 1);
                        break;
                    default:
                }
                unit = unitStr;
            } else {
                if (size >= T) {
                    num = this.formatFloat(size / T, 1);
                    unit = 'TB';
                } else if (size >= G) {
                    num = this.formatFloat(size / G, 1);
                    unit = 'GB';
                } else if (size >= M) {
                    num = this.formatFloat(size / M, 1);
                    unit = 'MB';
                } else if (size >= K) {
                    num = this.formatFloat(size / K, 1);
                    unit = 'KB';
                } else {
                    num = this.formatFloat(size, 1);
                    unit = 'B';
                }

            }
            if (returnObj) {
                return {
                    num: num,
                    unit: unit
                }
            }
            return num==0?0:(num + unit);
        },

        /**
         * 格式化字符串
         * @returns {*}
         */
        stringFormat: function () {
            if (arguments.length == 0)
                return null;
            var str = arguments[0];
            for (var i = 1; i < arguments.length; i++) {
                var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
                str = str.replace(re, arguments[i]);
            }
            return str;
        },

        /**
         * 根据单位将空间大小转换为B
         * @param size
         * @param unit
         * @returns {number}
         */
        convertToB: function (size, unit) {
            var rate;
            switch (unit) {
                case 'K':
                case 'KB':
                    rate = 1024;
                    break;
                case 'M':
                case 'MB':
                    rate = 1024*1024;
                    break;
                case 'G':
                case 'GB':
                    rate = 1024*1024*1024;
                    break;
                case 'T':
                case 'TB':
                    rate = 1024 * 1024*1024*1024;
                    break;
                default :
                    rate = 1;
            }
            return size * rate;
        },

        /**
         * 格式化过期时间，例如  5年2个月
         * @param outDate 过期时间，单位月
         */
        formatOutDate: function (outDate) {
            var year, month;
            if (outDate >= 12) {
                year = parseInt(outDate / 12, 10);
                month = outDate % 12;
                return [year, Lang.setting.year, month ? (month + Lang.setting.month) : ''].join('')
            } else {
                return outDate + Lang.setting.month
            }
        },

        /**
         * 获取过期时间
         * @param value
         * @returns {string}
         */
        getOutDate: function (value) {
            return (value == -1) ? Lang.setting.forever : this.formatOutDate(value);
        },

        /**
         * 根据返回值获取企业状态
         * @param id
         * @returns {string}
         */
        getStatus: function (id) {
            var status = '';
            switch (id) {
                case 0:
                    status = Lang.setting.normal;
                    break;
                case 1:
                    status = Lang.setting.locked;
                    break;
                case 2:
                    status = Lang.setting.canceled;
                    break;
                default:
                    status = Lang.setting.normal;
            }
            return status;
        },

        /**
         * 获取模版字符串
         * @param tplStr
         * @param tplId
         * @returns {*|jQuery}
         */
        getTemplate: function (tplStr, tplId) {
            return $(tplStr).find(tplId).html();
        },


        /**
         * 国际化模板输出
         * @param tplStr
         * @param data
         * @constructor
         */
        tpl2Html: function (tplStr, data) {
            var tpl = _.template(tplStr);
            return tpl(_.extend({}, {Lang: Lang}, data || {}));
        },

        /**
         * 解析网址
         * @param url
         * @returns {{source: *, protocol: string, host: string, port: (*|Function|string), query: (DeptUserBox.search|g.search|*|string|l.search|string), params, file: *, hash: (XML|void|string|*), path: string, relative: *, segments: Array}}
         */
        parseURL: function (url) {
            var a = document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':', ''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function () {
                    var ret = {},
                        seg = a.search.replace(/^\?/, '').split('&'),
                        len = seg.length, i = 0, s;
                    for (; i < len; i++) {
                        if (!seg[i]) {
                            continue;
                        }
                        s = seg[i].split('=');
                        ret[s[0]] = s[1];
                    }
                    return ret;
                })(),
                file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
                hash: a.hash.replace('#', ''),
                path: a.pathname.replace(/^([^\/])/, '/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
                segments: a.pathname.replace(/^\//, '').split('/')
            };
        },

        /**
         * 获取根目录
         * @returns {string}
         */
        getRootUrl: function () {
            //return 'http://my.thinkmail.com/';
            var urlObj = this.parseURL(window.location.href);
            return [urlObj.protocol, '://', urlObj.host + '/'].join('');
        },

        /**
         * 获取文件后缀名
         * @param filepath
         * @returns {string}
         */
        getFileExt: function (filepath) {
            if (filepath != "") {
                var pos = "." + filepath.replace(/.+\./, "");
                return pos;
            }
        },


        /**
         * 获取密码强度
         * @param v
         * @returns {{pswdLv: number, pswdLvText: string}}
         */
        getLv: function (v) {
            var pswdLv = 1,
                pswdLvText = Lang.common.weak;

            var reg1=/[a-zA-z]/,
                reg2=/[0-9]/,
                reg3=/(?=[\x21-\x7e]+)[^A-Za-z0-9]/;

            if(reg1.test(v) && reg2.test(v) &&reg3.test(v)){
                pswdLv = 3;
                pswdLvText = Lang.common.strong;
            }else if((reg1.test(v) && reg2.test(v))||(reg1.test(v) && reg3.test(v))||(reg2.test(v) &&reg3.test(v))){
                pswdLv = 2;
                pswdLvText = Lang.common.normal;
            }

            return {
                pswdLv: pswdLv,
                pswdLvText: pswdLvText
            };
        },

        /**
         * 校验密码强度
         * @param input
         * @param container
         */
        checkPswdLv: function (input, container) {
            var me = this;
            $(input).off('keyup.lv').on('keyup.lv', function () {
                var $this = $(this);
                var v = $this.val();
                var $container = $(container);
                if (v == '') {
                    $container.hide();
                    return
                } else {
                    $container.show();
                }
                var lv = me.getLv(v);
                $container.find('span').attr('class', 'passwrodLevel Plevel_' + lv.pswdLv);
                $container.find('em').text(lv.pswdLvText);
            });
        },

        /**
         * 添加临时样式
         * @param id
         * @param styleStr
         */
        addStyle: function (id,styleStr) {
            var elId='temp-style-'+id;
            var $frameStyle = $('#'+elId);
            $frameStyle.length && $frameStyle.remove();
            var style = ['<style id="',elId,'" type="text/css" rel="stylesheet">', styleStr, '</style>'].join('');
            $(style).appendTo('head');
        },


        /**
         * 格式化手机号 ，加前缀+86
         * @param mobile
         */
        formatMobile:function(mobile){
            if(!mobile){
                return '';
            }
            var preStr='+86';
            if(mobile.indexOf('86')<=-1 ||mobile.indexOf('86')>1){
                mobile=preStr+mobile;
            }
            return mobile;
        },

        /**
         * 合并错误信息提示
         * @param {String} errMsg
         * @param {Object} errData
         * @returns {string}
         */
        mergeErrMsg:function(errMsg,errData){
            return errMsg+' '+(errData.code||errData.summary||'');
        }


    };


});