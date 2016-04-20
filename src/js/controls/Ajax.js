/**
 * Created by Yangz on 2016/3/4.
 */

define(['jquery', 'underscore', "controls/Dialog", 'json2'], function ($, _, Dialog, json2) {

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
         */
        request: function (opts, fullResponse, disableLoading) {
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
                            opts.fail({code: data.code, errorCode: data.errorCode, summary: data.summary});
                        }
                    } else {
                        opts.success(data);
                    }
                },
                error: function (xhr) {
                    if (!disableLoading) {
                        me.loadingObj.close();
                    }

                    if(xhr.status==200||xhr.status==0){
                        window.location.reload();
                        return
                    }
                    opts.fail(xhr);
                }
            }));
        }
    };

    return Ajax;

});