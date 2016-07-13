/**
 * Created by Yangz on 2016/6/6.
 */
define([
    'backbone',
    "controls/Common",
    'controls/Ajax',
    "controls/Dialog",
    'i18n/' + global.language
], function (Backbone, Common, Ajax, Dialog, Lang) {

    var Model = Backbone.Model;

    return {
        LogModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('searchLog'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(Lang.common.fetchFail,data));
                        console && console.log('error', data);
                    }
                };
                Ajax.request(opts);
            }
        })
    };

});