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
    var uMLang = Lang.userManager,
        cLang=Lang.common;


    return {
        AccountRuleModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getAccountRule'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                    }
                };
                Ajax.request(opts, false, true);
            }
        }),

        TopDptModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: options.url,
                    data: options.data,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.getDeptFail, data));
                    }
                };
                Ajax.request(opts, false, true);
            }
        }),

        UsersModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: options.url,
                    data: options.data,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.getUserInfoFail, data));
                    }
                };
                Ajax.request(opts);
            }

        }),

        AddUserModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('addUser'),
                    data: options,
                    success: function (data) {
                        model.trigger('change');
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.addUserFail, data));
                    }
                };
                Ajax.request(opts);
            }

        }),

        ManageDeptMemberModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('manageDeptMember'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set({
                            op: options.op
                        });
                    },
                    fail: function (data) {
                        var tips;
                        switch (options.op) {
                            case 'add':
                                tips = uMLang.addDeptUserFail;
                                break;
                            case 'remove':
                                tips = uMLang.outUserFail;
                                break;
                            default:
                        }
                        Dialog.tips(Common.mergeErrMsg(tips, data));
                    }
                };
                Ajax.request(opts);
            }

        }),

        UpdateUserModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('updateUser'),
                    data: options,
                    success: function (data) {
                        model.trigger('change');
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.updateUserFail, data));
                    }
                };
                Ajax.request(opts);
            }

        }),

        UserDetailModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getUser'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        if (data.code == 'UNACTIVED') {
                            Dialog.tips(uMLang.unactived);
                        } else {
                            Dialog.tips(Common.mergeErrMsg(uMLang.getUserInfoFail, data));
                        }
                    }
                };
                Ajax.request(opts);
            }

        }),

        DelUserModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: options.url,
                    data: options.data,
                    success: function (data) {
                        model.trigger('change');
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.delUserFail, data));
                    }
                };
                Ajax.request(opts);
            }

        }),

        BatchImpDetailModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getBatchImpDetail'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.getImpFail, data));
                        model.clear({silent: true});
                        model.set({
                            result: 'fail'
                        });
                    }
                };
                Ajax.request(opts);
            }

        }),

        AddDeptModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('addDept'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.addDeptFail, data));
                    }
                };
                Ajax.request(opts);
            }

        }),

        DeptDetailModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getDeptDetail'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.getDeptInfoFail, data));
                    }
                };
                Ajax.request(opts);
            }

        }),

        UpdateDeptModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('updateDept'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set({
                            updateModel: options
                        });
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.editDeptFail, data));
                    }
                };
                Ajax.request(opts);
            }

        }),

        DelDeptModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('delDept'),
                    data: options,
                    success: function (data) {
                        model.trigger('change');
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.delDeptFail, data));
                    }
                };
                Ajax.request(opts);
            }
        }),

        SearchUserModel: Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: options.url,
                    data: options.data,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data, {silent: true});
                        model.set({keyword: options.data.userId});
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(cLang.searchFail, data));
                    }
                };
                Ajax.request(opts);
            }

        }),


        DeptUnUsed:Model.extend({
            sync: function (method, model, options) {
                var opts = {
                    url: Common.getUrlByName('getDeptUnUsed'),
                    data: options,
                    success: function (data) {
                        model.clear({silent: true});
                        model.set(data, {silent: true});
                        model.set({type: options.type});
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg('获取部门可用空间失败', data));
                    }
                };
                Ajax.request(opts);
            }

        })
    };

});