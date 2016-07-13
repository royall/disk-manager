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

    var cLang = Lang.common;

    return {
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

});