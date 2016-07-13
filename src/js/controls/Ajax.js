/**
 * Created by Yangz on 2016/3/4.
 */

define(['jquery', 'underscore', "controls/Dialog", 'json2','i18n/' + global.language], function ($, _, Dialog, json2,Lang) {

    var Ajax = {
        requestId: 0,
        loadingObj: {},
        defaultOpts: {
            type: 'POST',
            data: {},
            dataType: 'json',
            success: function () {
            },
            error: function () {
                Ajax.loadingObj.close && Ajax.loadingObj.close();
                Dialog.tips('Error Request !');
            },
            contentType: 'text/plain; charset=UTF-8'
            //processData:false
        },

        /**
         * 发送请求
         * @param opts
         * @param fullResponse
         * @param disableLoading 是否禁用默认loading动画
         * @param disableError 是否禁用Ajax出错自动跳转
         */
        request: function (opts, fullResponse, disableLoading,disableError) {
            this.requestId++;

            var me = this;
            if (!opts.url) {
                return
            }
            this.url = opts.url;
            if (!disableLoading) {
                me.loadingObj.close && me.loadingObj.close();
                me.loadingObj = Dialog.loading();
            }

            opts.data && opts.data.parse && delete opts.data.parse;
            opts.data && opts.data.success && delete opts.data.success;
            opts.data && opts.data.error && delete opts.data.error;

            opts.fail=opts.fail||function (data) {
                Dialog.tips('Error:'+data.code);
            };

            //opts.url=opts.url+'&tid='+new Date().getTime();

            $.ajax(_.extend({}, this.defaultOpts, opts, {
                data: JSON.stringify(opts.data),
                success: function (data) {
                    //正常数据结构{"code": "S_OK","var": {}}
                    //异常数据结构{"code": "x","summary": {}}

                    if (!disableLoading) {
                        me.loadingObj.close();
                    }
                    if (!data) {
                        return
                    }

                    if (!fullResponse) {
                        if (data && data.code && data.code == 'S_OK' && data.hasOwnProperty('var')) {
                            opts.success(data['var']);
                        } else {
                            opts.fail(data);
                        }
                    } else {
                        opts.success(data);
                    }
                },
                error: function (xhr) {
                    if (!disableLoading) {
                        me.loadingObj.close();
                    }

                    if(!disableError){
                        if(xhr.status==200||xhr.status==0){

                            Dialog.alert(Lang.common.sysTips,Lang.common.loginTimeout,function () {
                                location.href=global.logoutUrl;
                            });
                            return;
                        }
                    }

                    opts.fail(xhr);
                }
            }));
        }
    };

    return Ajax;

});