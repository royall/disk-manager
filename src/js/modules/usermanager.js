/**
 * Created by Yangz on 2016/3/1.
 */
define([
    'jquery',
    'underscore',
    "validate",
    "text!../../template/userManager.html",
    "controls/Common",
    'i18n/' + global.language,
    'controls/List',
    'controls/Ajax',
    "controls/Pager",
    'controls/Dialog',
    'controls/DeptUserBox',
    "dropkick",
    "zTree",
    'CryptoJS'
], function ($, _, validate, userManagerTpl, Common, Lang, List, Ajax, Pager, Dialog, DeptUserBox, dropkick, zTree,CryptoJS) {

    window.global = window.global || {user: {}, corpList: {}};

    var uMLang = Lang.userManager,
        sLang = Lang.setting,
        cLang = Lang.common;

    var UserManage = window.UserManage = {
        el: '.rightContainer',
        ui: {
            companyName: '#company-name',
            btnAddUser: '#add-user',
            btnImportUser: '#import-user',
            btnImportUserResult: '#import-user-result',
            btnEditDepartment: '#edit-department',
            btnDeleteDepartment: '#delete-department',
            btnOutUser: '#out-user',
            btnDeleteUser: '#delete-user',
            btnAddDept: '#btnAddDept',
            btnGroup1: ".btn-group-1",
            btnGroup2: ".btn-group-2",
            btnGroup3: ".btn-group-3",
            userType: '#user-type',
            userList: '#user-list',
            btnAddUser2: '#add-user-2',
            btnImportUser2: '#btn-import-user',
            userSearch: '#user-search',
            addUser: '#addUser',
            addDeptUser: '#addDeptUser'
        },
        model: {
            pageNo: 1,
            pageSize: 20,
            deptPageSize: 1000,//获取部门的一页大小
            corpId: Common.getCorpId(),
            corpData: Common.getCorpData(),
            deptId: 0,
            deptIds: [0]
        },
        accountRule: null,
        deptModel: {},

        /**
         * 初始化
         */
        init: function () {
            this.deptObj = {};//缓存部门结构信息
            this.render();
            this.initList();
            this.initEvents();
            this.initTree();
            this.isInitialized = true;
            this.initData();
            this.getAccountRule();
            this.getCorpService();
            this.initStyle();

            $(window).off('resize.userManager').on('resize.userManager', this.initStyle);
        },


        /**
         * 渲染框架
         */
        render: function () {
            var t = Common.getTemplate(userManagerTpl, '#frame-tpl');
            $(this.el).html(Common.tpl2Html(t));

            if (global.user.role == 'root') {
                $('.subSiderTop,#delete-department').hide();
            }

        },

        /**
         * 初始化事件
         */
        initEvents: function () {

            if (this.isInitialized) {
                return;
            }
            var me = this;

            //企业名点击
            $(this.ui.companyName).on('click', function () {
                me.initData();
            });

            //创建用户
            $(this.ui.btnAddUser).on('click', _.bind(me.addUser, this));

            $(this.ui.btnAddUser2 + ',' + this.ui.btnImportUser2).on('click', function () {
                $(this).find('.popList').toggle();
            });

            $(this.ui.addUser).on('click', function (e) {
                $(me.ui.btnAddUser2).find('.popList').hide();
                me.addUser();
                return false;
            });

            $(this.ui.addDeptUser).on('click', function (e) {
                $(me.ui.btnAddUser2).find('.popList').hide();
                me.addDeptUser();
                return false;
            });

            //批量导入用户
            $(this.ui.btnImportUser).on('click', _.bind(me.importUser, this));

            //结果查询
            $(this.ui.btnImportUserResult).on('click', _.bind(me.importUserResult, this));

            //修改部门设置
            $(this.ui.btnEditDepartment).on('click', _.bind(me.editDepartment, this));

            //删除部门
            $(this.ui.btnDeleteDepartment).on('click', _.bind(me.deleteDepartment, this));

            //移除部门
            $(this.ui.btnOutUser).on('click', _.bind(me.outUsers, this));

            //删除用户
            $(this.ui.btnDeleteUser).on('click', _.bind(me.deleteUsers, this));

            //添加部门
            $(this.ui.btnAddDept).on('click', _.bind(me.addDept, this));

            //搜索用户
            $(this.ui.userSearch).on('keyup', me.userSearch);

        },

        /**
         * 初始化列表
         */
        initList: function () {

            var me = this;

            this.list = this.list || new List({
                    container: '#user-list',
                    data: [],
                    hasCheckBtn: true,
                    key: 'uid',
                    rowClass: function (v) {
                        if (v.role == 'admin' && global.user.role != 'root') {
                            return 'row-admin'
                        } else {
                            return false
                        }
                    },
                    columns: [
                        {
                            columnId: 'userId',
                            columnName: uMLang.userName,
                            titleStyle: '',
                            titleAttr: 'width="20%"',
                            callback: function (value, row) {
                                //return ['<span class="tf"><a data-action="showDetail" href="javascript:;" title="',value,'">',value,'</a></span>'].join('')
                                return ['<span class="tf" title="', row.name, '">', value, '</span>'].join('')
                            },
                            action: 'showDetail',
                            onClick: $.proxy(me.showDetail, me)
                        },
                        {
                            columnId: 'depts',
                            columnName: uMLang.depart,
                            titleStyle: '',
                            titleAttr: '',
                            callback: function (v) {
                                var depts = _.map(v, function (data) {
                                    return data.name
                                });

                                var deptsStr = depts.join('；') || uMLang.ungrouped;

                                //console.log(me.deptModel.name);

                                //只显示当前所属部门
                                if (!_.isEmpty(me.deptModel)) {
                                    deptsStr = me.deptModel.name;
                                }
                                return ['<span title="', _.escape(deptsStr), '">', _.escape(deptsStr), '</span>'].join('');
                            }
                        }
                    ],
                    operate: {
                        columnName: cLang.operate,
                        titleStyle: '',
                        titleAttr: '',
                        list: [
                            {
                                name: cLang.out,
                                action: 'out',
                                className: 'btn28 btn_white1 mr_5 out',
                                onClick: _.bind(me.outUser, me)
                            },
                            {
                                name: cLang.setting,
                                action: 'edit',
                                className: 'btn28 btn_white1 mr_5 edit',
                                onClick: _.bind(me.editUser, me)
                            },
                            {
                                name: cLang.del,
                                action: 'delete',
                                className: 'btn28 btn_white1 mr_5 delete',
                                onClick: _.bind(me.deleteUser, me)
                            }
                        ]
                    }
                });
        },

        /**
         * 初始化部门结构
         * @param data
         */
        initTree: function (data) {

            var me = this;

            var setting = {
                view: {
                    showLine: false,
                    showIcon: false,
                    selectedMulti: false,
                    dblClickExpand: false,
                    addDiyDom: addDiyDom
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: 'deptId',
                        pIdKey: 'parentId',
                        rootPId: 0
                    }
                },
                async: {
                    type: 'POST',
                    enable: true,
                    url: Common.getUrlByName('getDeptUsers') + "&type=subgrp",
                    contentType: 'text/plain; charset=UTF-8',
                    deptParam: ["corpId", "deptId"],
                    dataFilter: function (treeId, parentNode, responseData) {
                        if (responseData && responseData.code == "S_OK" && responseData['var']) {
                            _.map(responseData['var'].depts, function (v) {
                                return v.isParent = !v.leaf
                            });
                            var depts = responseData['var'].depts;
                            me.deptObj[parentNode.deptId] = depts;
                            return depts
                        }
                    }
                },

                callback: {
                    onClick: function (event, treeId, treeNode, clickFlag) {
                        var corpId = treeNode.corpId,
                            deptId = treeNode.deptId;

                        this.getZTreeObj(treeId).expandNode(treeNode);

                        me.deptModel = treeNode || {};

                        me.setBtnStatus('dept');
                        me.model.pageNo = 1;
                        me.getUser({
                            corpId: corpId,
                            deptIds: [deptId]
                        });
                    }
                }
            };


            function addDiyDom(treeId, treeNode) {
                var spaceWidth = 15;
                var switchObj = $("#" + treeNode.tId + "_switch"),
                    icoObj = $("#" + treeNode.tId + "_ico");
                switchObj.remove();
                icoObj.before(switchObj);

                var spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level) + "px'></span>";
                switchObj.before(spaceStr);

            }

            _.map(data, function (v) {
                return v.isParent = !v.leaf
            });


            $.fn.zTree.init($("#depart"), setting, data);
        },

        /**
         * 初始化数据
         */
        initData: function () {
            var me = this;

            this.model.pageNo = 1;
            this.model.deptId = 0;
            this.model.deptIds = [0];

            this.getTopDpt(this.model.corpId);
            this.getTopUser(this.model.corpId);

            try {
                $('#company-name').text(me.model.corpData.name || '').attr('title', me.model.corpData.name || '');
            } catch (e) {
                console && console.log(e);
            }


            //this.initTree();
            this.setBtnStatus('top');
        },

        initStyle: function () {

            var h = global.height - 49 - 49 - 40;
            var str = '.tableBox{height:' + h + 'px}';
            Common.addStyle('setting', str);
        },

        getAccountRule: function () {
            var me = this;
            //获取当前企业的密码安全信息，创建用户时使用
            var opts = {
                url: Common.getUrlByName('getAccountRule'),
                data: {corpId: me.model.corpId},
                success: function (data) {
                    me.accountRule = {};
                    var keyArray = ['length', 'spChar', 'caps', 'weak', 'timeout'];
                    _.each(data, function (v) {
                        var ruleId = v.ruleId;
                        me.accountRule[keyArray[ruleId - 1]] = v;
                    });

                    //添加验证规则
                    $.validator.addMethod("spChar", function (value, element) {
                        var reg = new RegExp(me.accountRule.spChar.ruleValue);
                        return reg.test(value);
                    }, uMLang.spChar);


                    $.validator.addMethod("caps", function (value, element) {
                        var reg = new RegExp(me.accountRule.caps.ruleValue);
                        return reg.test(value);
                    }, uMLang.caps);

                    $.validator.addMethod("weak", function (value, element) {
                        var reg = new RegExp(me.accountRule.weak.ruleValue);
                        return !reg.test(value);
                    }, uMLang.weak);

                },
                fail: function (data) {
                    // Dialog.tips(Common.mergeErrMsg(sLang.getSafeInfoFail,data));
                }
            };
            Ajax.request(opts, undefined, true);


        },

        getCorpService: function () {
            var me = this;
            if (global.corpService) {
                me.corpService = global.corpService;
            } else {
                var opts = {
                    url: Common.getUrlByName('getCorpService'),
                    data: {corpId: me.model.corpId},
                    success: function (data) {
                        me.corpService = data;
                    },
                    fail: function (data) {
                        // Dialog.tips(Common.mergeErrMsg(sLang.getSafeInfoFail, data));
                    }
                };
                Ajax.request(opts, undefined, true);
            }
        },
        /**
         * 刷新列表
         */
        refresh: function (userType) {
            var me = this;

            this.getUser({
                corpId: me.model.corpId,
                deptIds: me.model.deptIds,
                alluser: userType
            });
        },

        /**
         *更新页面按钮显示状态
         */
        setBtnStatus: function (status) {
            var $btnGroup1 = $(this.ui.btnGroup1),
                $btnGroup2 = $(this.ui.btnGroup2),
                $btnGroup3 = $(this.ui.btnGroup3),
                $userType = $(this.ui.userType),
                $userList = $(this.ui.userList);

            switch (status) {
                case 'top':
                    $btnGroup1.show();
                    $btnGroup2.hide();
                    $btnGroup3.hide();
                    $userType.text(uMLang.allUser);
                    $userList.addClass('list-top');
                    break;
                case 'dept':
                    $btnGroup1.hide();
                    $btnGroup2.show();
                    $btnGroup3.show();
                    $userType.text(uMLang.userList);
                    $userList.removeClass('list-top');
                    break;
                default:
            }

        },

        /**
         * 搜索用户件事件
         */
        userSearch: function (e) {
            var me = UserManage;
            me.setBtnStatus('top');
            var $this = $(this);
            var keyword = $this.val();
            if (e.keyCode == 13) {
                if (keyword == '') {
                    Dialog.tips(sLang.typeKeyword);
                } else {
                    me.model.pageNo = 1;
                    me.userSearchReq(keyword);
                }
            } else if (((e.ctrlKey && e.keyCode == 88) || e.keyCode == 8 || e.keyCode == 46) && keyword == '') {
                me.model.pageNo = 1;
                me.getTopUser(me.model.corpId);
            }

        },

        /**
         * 搜索用户请求
         * @param keyword
         */
        userSearchReq: function (keyword) {

            $.fn.zTree.getZTreeObj('depart').cancelSelectedNode();

            var me = this;
            var opts = {
                url: Common.getUrlByName('searchUser') + '&page=' + me.model.pageNo + '&pagesize=' + me.model.pageSize + '&matchrule=like',
                data: {corpId: me.model.corpId, userId: keyword},
                success: function (data) {
                    //me.searchLoading.close();
                    me.list.setData(data.users);

                    if (!data.users.length) {
                        $('.pager').html('');
                        return
                    }

                    me.pager = new Pager({
                        el: '.pager',
                        pageNo: data.pageNo,
                        total: data.total,
                        pageSize: me.model.pageSize,
                        onclick: function (page) {
                            me.model.pageNo = page;
                            me.userSearchReq(keyword);
                        }
                    });


                },
                fail: function (data) {
                    //me.searchLoading.close();
                    Dialog.tips(Common.mergeErrMsg(cLang.searchFail, data));
                }
            };

            //me.searchLoading=Dialog.loading();
            Ajax.request(opts);


        },

        /**
         * 获取顶级部门
         * @param corpId
         */
        getTopDpt: function (corpId) {
            var me = this;

            me.deptModel = {};

            var opts = {
                url: Common.getUrlByName('getDeptUsers') + '&page=1&pagesize=' + me.model.deptPageSize + '&type=subgrp',
                data: {"corpId": corpId, "deptIds": ["0"]},
                success: function (data) {

                    //console.log('顶级部门数据',data);
                    var tree = data.depts;
                    me.deptObj[0] = tree;
                    //
                    me.initTree(tree);
                    //me.topDeptLoading.close();
                },
                fail: function (data) {
                    Dialog.tips(Common.mergeErrMsg(uMLang.getDeptFail, data));
                }
            };
            Ajax.request(opts, false, true);
            //me.topDeptLoading=Dialog.loading();
        },

        /**
         * 获取企业所有用户
         * @param corpId
         */
        getTopUser: function (corpId) {
            var me = this;
            me.getUser({
                corpId: corpId,
                deptIds: ["0"],
                alluser: true
            })

        },

        /**
         * 返回部门下的user(不包括子部门中的)
         * @param opts
         */
        getUser: function (opts) {

            var me = this;

            me.model.corpId = opts.corpId;
            me.model.deptIds = opts.deptIds;

            var opt = {
                url: Common.getUrlByName('getDeptUsers') + '&page=' + me.model.pageNo + '&pagesize=' + me.model.pageSize + '&type=' + (opts.alluser ? 'alluser' : 'user'),
                data: opts,
                success: function (data) {

                    //me.dataLoading.close();

                    me.list.setData(data.users);

                    if (!data.users || !data.users.length) {
                        $('.pager').html('');
                        return
                    }

                    me.pager = new Pager({
                        el: '.pager',
                        pageNo: data.pageNo,
                        total: data.total,
                        pageSize: me.model.pageSize,
                        onclick: function (page) {
                            me.model.pageNo = page;
                            me.refresh(opts.alluser);
                        }
                    });

                },
                fail: function (data) {
                    Dialog.tips(Common.mergeErrMsg(uMLang.getUserInfoFail, data));
                }
            };

            Ajax.request(opt);

        },


        addUserValidateMethod: function () {

            var vF = function (key, value) {
                if (value == '') {
                    return 'resolved';
                }
                var deferred = $.Deferred();
                var data = {};
                data[key] = value;
                var opts = {
                    url: Common.getUrlByName('searchUser') + '&page=1&pagesize=20&matchrule=equal',
                    data: data,
                    async: false,
                    success: function (data) {
                        var users = data.users;
                        if (users && users.length > 0) {
                            deferred.reject();
                        } else {
                            deferred.resolve();
                        }
                    },
                    fail: function (data) {
                        deferred.resolve();
                    }
                };
                Ajax.request(opts);
                return deferred.state();
            };

            //验证用户名是否存在
            $.validator.addMethod("checkUserId", function (value, element) {
                if (value == 'root') {
                    return false
                }
                return vF('userId', value) == "resolved";
            }, sLang.userIdExisted);

            // //验证姓名是否存在
            $.validator.addMethod("checkName", function (value, element) {
                return vF('name', value) == "resolved";
            }, uMLang.nameExisted);

            // //验证邮箱是否存在
            $.validator.addMethod("checkEmail", function (value, element) {
                return vF('email', value) == "resolved";
            }, uMLang.emailExisted);

            // //验证手机号码是否存在
            $.validator.addMethod("checkMobile", function (value, element) {
                var mobile = Common.formatMobile(value);
                return vF('mobile', mobile) == "resolved";
            }, uMLang.mobileExisted);

        },

        /**
         * 表单验证
         */
        userValidate: function () {
            var me = this;


            $('#accountForm').validate({
                onkeyup: false,
                rules: {
                    'userId': {
                        required: true,
                        account: true,
                        checkUserId: true
                    },
                    'storageNum': {
                        required: true,
                        number: true,
                        min: 1
                    },
                    'storageNum2': {
                        required: true,
                        number: true,
                        min: 1
                    },
                    'mobile': {
                        mobilePhone: true,
                        checkMobile: true
                    },
                    name: {
                        fullName: true,
                        checkName: true
                    },
                    'email': {
                        email: true,
                        checkEmail: true
                    },
                    'password': {
                        required: true,
                        spChar: !!me.accountRule.spChar.isCheck,
                        caps: !!me.accountRule.caps.isCheck,
                        weak: !!me.accountRule.weak.isCheck,
                        minlength: parseInt(me.accountRule.length.ruleValue, 10),
                        maxlength: 30
                    },
                    'password2': {
                        required: true,
                        spChar: !!me.accountRule.spChar.isCheck,
                        caps: !!me.accountRule.caps.isCheck,
                        weak: !!me.accountRule.weak.isCheck,
                        minlength: parseInt(me.accountRule.length.ruleValue, 10),
                        maxlength: 30,
                        equalTo: "#password"
                    }
                },
                messages: {
                    'userId': {
                        required: uMLang.typeUserName,
                        account: uMLang.illegalUserId
                    },
                    'storageNum': {
                        required: sLang.typeSpace,
                        number: sLang.typeNumber,
                        min: sLang.minNumber
                    },
                    email: {
                        email: uMLang.emailNotCorrect
                    },
                    name: {
                        fullName: uMLang.illegalName
                    },
                    mobile: {
                        mobilePhone: uMLang.illegalMobile
                    },
                    'password': {
                        required: sLang.typePwd,
                        //spChar:true,
                        //caps:true,
                        //weak:true,
                        minlength: sLang.minPsw,
                        maxlength: uMLang.maxPwd
                    },
                    'password2': {
                        //spChar:true,
                        //caps:true,
                        //weak:true,
                        minlength: sLang.minPsw,
                        required: sLang.typePwd2,
                        equalTo: sLang.pswNotEqual,
                        maxlength: uMLang.maxPwd
                    }
                },
                wrapper: "div",
                errorPlacement: function (error, element) {
                    $(element).parent().append(error.prepend('<i class="i-warm ml_5"></i>'));
                }
            });


        },

        /**
         * 添加用户
         */
        addUser: function () {

            var me = this;

            var success = function (data) {
                Dialog.tips(uMLang.addUserSuc);
                me.refresh(!me.deptModel.deptId);
            };

            var error = function (data) {
                Dialog.tips(Common.mergeErrMsg(uMLang.addUserFail, data));
            };

            var defaultUserCapacityObj = Common.formatStorageUnit(me.corpService.defaultUserCapacity || 1024 * 1024, true);
            var defaultTeamCapacity = Common.formatStorageUnit(me.corpService.defaultTeamCapacity || 1024 * 1024, true);

            var data = {
                defaultUserCapacity: defaultUserCapacityObj.num,
                defaultTeamCapacity: defaultTeamCapacity.num,
                diskMaxUserCapacity: Common.formatStorageUnit(me.corpService.diskMaxUserCapacity || 0),
                maxUserTeamCapacity: Common.formatStorageUnit(me.corpService.maxUserTeamCapacity || 0)
            };

            var tplStr = Common.getTemplate(userManagerTpl, '#creatAccount-tpl');
            var html = Common.tpl2Html(tplStr, data);

            var pop = Dialog.pop({
                title: uMLang.addUser,
                content: html,
                okRemovePop: false,
                ok: function () {

                    if (!$('#accountForm').valid()) {
                        return
                    }

                    var corpId = me.model.corpId;
                    var deptIds = me.model.deptIds;
                    var $creatAccount = $('#creatAccount');
                    var storage = Common.convertToB($creatAccount.find('.storageNum').val(), me.addUserUnitSelect.value);
                    var storageTeam = Common.convertToB($creatAccount.find('.storageNum2').val(), me.addUserUnitSelect2.value);


                    var mobile = $creatAccount.find('.mobile').val();
                    mobile = Common.formatMobile(mobile);

                    //添加用户参数
                    var opts = {
                        "corpId": corpId,
                        "deptIds": Number(deptIds[0]) ? deptIds : null,
                        "name": $creatAccount.find('.name').val(),
                        "userId": $creatAccount.find('.userId').val(),
                        "password": CryptoJS.MD5($creatAccount.find('.password').val()).toString().toUpperCase(),
                        "email": $creatAccount.find('.email').val(),
                        "mobile": mobile,
                        "role": 'normal',
                        "storage": storage,
                        "groupStorageQuota": storageTeam,
                        "passFlag": $creatAccount.find('.passFlag').prop('checked') ? '1' : '0',
                        "createUser": window.global.user.role || 'admin'
                    };

                    Ajax.request({
                        url: Common.getUrlByName('addUser'),
                        data: opts,
                        success: success,
                        fail: error
                    });
                    pop.removePop();
                },
                onPop: function () {
                    me.addUserUnitSelect = new Dropkick($('#creatAccount .storageUnit')[0]);
                    me.addUserUnitSelect2 = new Dropkick($('#creatAccount #unitSelect2')[0]);

                    me.addUserUnitSelect.select(defaultUserCapacityObj.unit.toString());
                    me.addUserUnitSelect2.select(defaultTeamCapacity.unit.toString());

                    me.addUserValidateMethod();
                    me.userValidate();
                    Common.checkPswdLv('#password', '.pswd-lv');
                }
            });

        },

        /**
         * 添加已存在的用户到部门
         */
        addDeptUser: function () {
            var me = this;
            var deptUserBox = {};
            var addDeptUserPop;
            var loading = {};
            addDeptUserPop = Dialog.pop({
                title: uMLang.addDeptUser,
                content: '<div id="box"></div>',
                ok: function () {
                    var addData = deptUserBox.getSelected();

                    if (!addData.length) {
                        Dialog.tips(uMLang.selectUser);
                        return
                    }

                    var member = [];
                    _.each(addData, function (v) {
                        member.push(v.uid);
                    });

                    var parentId = me.deptModel.parentId || 0;

                    var opts = {
                        url: Common.getUrlByName('manageDeptMember'),
                        data: {
                            op: 'add',
                            corpId: me.model.corpId,
                            deptId: me.model.deptIds[0],
                            //parentId:parentId,
                            member: member
                        },
                        success: function (data) {
                            //addDeptUserPop.removePop();
                            //loading.close();
                            Dialog.tips(uMLang.addDeptUserSuc);
                            me.refresh(!me.deptModel.deptId);
                        },
                        fail: function (data) {
                            Dialog.tips(Common.mergeErrMsg(uMLang.addDeptUserFail, data));
                            //loading.close();
                        }
                    };

                    Ajax.request(opts);
                    addDeptUserPop.removePop();
                    //loading=Dialog.loading();
                },
                okRemovePop: false,
                onPop: function () {
                    deptUserBox = new DeptUserBox({
                        el: '#box',
                        corpId: me.model.corpId
                    });
                }
            });

        },


        editUserValidateMethod: function () {

            var vF = function (key, value) {
                if (value == '') {
                    return 'resolved';
                }
                var deferred = $.Deferred();
                var data = {};
                data[key] = value;
                var opts = {
                    url: Common.getUrlByName('searchUser') + '&page=1&pagesize=20&matchrule=equal',
                    data: data,
                    async: false,
                    success: function (data) {
                        var users = data.users;
                        if (users && users.length > 0) {
                            deferred.reject();
                        } else {
                            deferred.resolve();
                        }
                    },
                    fail: function (data) {
                        deferred.resolve();
                    }
                };
                Ajax.request(opts);
                return deferred.state();
            };


            // //验证姓名是否存在
            $.validator.addMethod("checkName", function (value, element) {
                var original = $(element).data('original');
                if (value == original) {
                    return true;
                }
                return vF('name', value) == "resolved";
            }, uMLang.nameExisted);

            // //验证邮箱是否存在
            $.validator.addMethod("checkEmail", function (value, element) {
                var original = $(element).data('original');
                if (value == original) {
                    return true;
                }
                return vF('email', value) == "resolved";
            }, uMLang.emailExisted);

            // //验证手机号码是否存在
            $.validator.addMethod("checkMobile", function (value, element) {
                var original = $(element).data('original');
                original = Common.formatMobile(original);
                value = Common.formatMobile(value);
                if (value == original) {
                    return true;
                }
                var mobile = Common.formatMobile(value);
                return vF('mobile', mobile) == "resolved";
            }, uMLang.mobileExisted);

        },


        /**
         * 修改用户验证
         */
        editUserValidate: function () {
            var me = this;

            $('#accountSettingForm').validate({
                onkeyup: false,
                rules: {
                    'storageNum': {
                        required: true,
                        number: true,
                        min: 1
                    },
                    'storageNum2': {
                        required: true,
                        number: true,
                        min: 1
                    },
                    name: {
                        fullName: true,
                        checkName: true
                    },
                    'email': {
                        email: true,
                        checkEmail: true
                    },
                    'mobile': {
                        mobilePhone: true,
                        checkMobile: true
                    },
                    'password': {
                        minlength: parseInt(me.accountRule.length.ruleValue, 10),
                        spChar: !!me.accountRule.spChar.isCheck,
                        caps: !!me.accountRule.caps.isCheck,
                        weak: !!me.accountRule.weak.isCheck,
                        maxlength: 30
                    },
                    'password2': {
                        //required:true,
                        minlength: parseInt(me.accountRule.length.ruleValue, 10),
                        spChar: !!me.accountRule.spChar.isCheck,
                        caps: !!me.accountRule.caps.isCheck,
                        weak: !!me.accountRule.weak.isCheck,
                        equalTo: "#as-password",
                        maxlength: 30
                    }
                },
                messages: {
                    'storageNum': {
                        required: sLang.typeSpace,
                        number: sLang.typeNumber,
                        min: sLang.minNumber
                    },
                    'storageNum2': {
                        required: sLang.typeSpace,
                        number: sLang.typeNumber,
                        min: sLang.minNumber
                    },
                    email: {
                        email: uMLang.emailNotCorrect
                    },
                    name: {
                        fullName: uMLang.illegalName
                    },
                    mobile: {
                        mobile: uMLang.illegalMobile
                    },
                    'password': {
                        minlength: sLang.minPsw,
                        maxlength: uMLang.maxPwd
                    },
                    'password2': {
                        minlength: sLang.minPsw,
                        equalTo: sLang.pswNotEqual,
                        maxlength: uMLang.maxPwd
                    }
                },
                wrapper: "div",
                errorPlacement: function (error, element) {
                    $(element).parent().append(error.prepend('<i class="i-warm ml_5"></i>'));
                }
            });

        },
        /**
         * 修改用户
         * @param data
         */
        editUser: function (data) {
            //console.log('设置用户',data);

            var me = this;

            var pop;

            var editUserFn = function () {


                if (!$('#accountSettingForm').valid()) {
                    return
                }


                var $accountSetting = $('#accountSetting');

                var mobile = $accountSetting.find('.mobile').val();
                mobile = Common.formatMobile(mobile);

                var newModel = {
                    name: $accountSetting.find('.name').val(),
                    email: $accountSetting.find('.email').val(),
                    mobile: mobile,
                    passFlag: $accountSetting.find('.passFlag').prop('checked') ? "1" : "0",
                    storage: Common.convertToB($accountSetting.find('.storageNum').val(), me.accountSettingUnitSelect.value),
                    groupStorageQuota: Common.convertToB($accountSetting.find('.storageNum2').val(), me.accountSettingUnitSelect2.value)
                };

                if ($accountSetting.find('.password').val() != '' && $accountSetting.find('.password').val() != '') {
                    newModel.password = CryptoJS.MD5($accountSetting.find('.password').val()).toString().toUpperCase();
                }

                //筛选出要更新的字段
                var updateData = _.omit(newModel, function (value, key, object) {
                    return me.userDetailModel[key] == value
                });


                pop.removePop();

                if (_.isEmpty(updateData)) {
                    return
                }

                updateData.uid = me.userDetailModel.uid;
                updateData.corpId = me.userDetailModel.corpId;


                var opts = {
                    url: Common.getUrlByName('updateUser'),
                    data: updateData,
                    success: function (data) {
                        Dialog.tips(uMLang.updateUserSuc);
                        me.refresh(!me.deptModel.deptId);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.updateUserFail, data));
                    }
                };

                Ajax.request(opts);


            };

            var getUserDetailSuccess = function (userData) {

                //console.log('用户详细信息',userData);

                me.userDetailModel = userData;

                // userData.groupStorageQuota=1125454*102400;
                // userData.usedGroupStorage=52212*102400;

                var tplStr = Common.getTemplate(userManagerTpl, '#accountSetting-tpl');
                var storageObj = Common.formatStorageUnit(userData.storage);
                var storageObj2 = Common.formatStorageUnit(userData.storage, true);
                var usedStorageObj = Common.formatStorageUnit(userData.usedStorage);

                var groupStorageObj = Common.formatStorageUnit(userData.groupStorageQuota);
                var groupStorageObj2 = Common.formatStorageUnit(userData.groupStorageQuota, true);
                var groupUsedStorageObj = Common.formatStorageUnit(userData.usedGroupStorage);


                userData.storageNum = storageObj2.num;
                userData.storageObj = storageObj;
                userData.usedStorageObj = usedStorageObj;

                userData.groupStorageNum = groupStorageObj2.num;
                userData.groupStorageObj = groupStorageObj;
                userData.groupUsedStorageObj = groupUsedStorageObj;


                userData.mobile = Common.formatMobile(userData.mobile);

                pop = Dialog.pop({
                    title: uMLang.userSetting,
                    content: Common.tpl2Html(tplStr, userData),
                    okRemovePop: false,
                    width: 460,
                    ok: editUserFn,
                    onPop: function () {
                        me.accountSettingUnitSelect = new Dropkick("#unitSelect");
                        me.accountSettingUnitSelect.select(storageObj2.unit.toString());

                        me.accountSettingUnitSelect2 = new Dropkick("#unitSelect2");
                        me.accountSettingUnitSelect2.select(groupStorageObj2.unit.toString());


                        //左侧选项卡切换
                        $('#accountSetting .popUserSetL>ul>li').on('click.tab', function () {

                            // if (!$('#accountSettingForm').valid()) {
                            //     return
                            // }

                            var $this = $(this);
                            var index = $(this).index();
                            $this.addClass('act').siblings().removeClass('act');
                            var ul = $this.parents('.popUserSetL').next().find('.popUserSetRCon>ul');
                            ul.hide().eq(index).show();
                        });

                        me.editUserValidateMethod();
                        me.editUserValidate();
                        Common.checkPswdLv('#as-password', '.pswd-lv');
                    },
                    closePop: function () {
                        $('#accountSetting .popUserSetL>ul>li').off('click.tab');
                    }
                });
            };

            this.getUserDetail({
                data: {"uid": data.uid, "corpId": data.corpId},
                success: getUserDetailSuccess,
                fail: function (data) {
                    //console.log(data)
                    if (data.code == 'UNACTIVED') {
                        Dialog.tips(uMLang.unactived);
                    } else {
                        Dialog.tips(Common.mergeErrMsg(uMLang.getUserInfoFail, data));
                    }
                    //console.warn('获取用户信息失败！');
                }
            });

        },

        /**
         * 获取用户详细信息
         */
        getUserDetail: function (opts) {
            var me = this;
            Ajax.request({
                url: Common.getUrlByName('getUser'),
                data: opts.data,
                success: opts.success,
                fail: opts.fail
            });
        },

        /**
         * 显示用户详细信息
         */
        showDetail: function (data) {
            console.log(data)
        },

        /**
         * 删除用户
         * @param data
         */
        deleteUser: function (data) {
            var me = this;

            if (data.role == 'admin') {
                Dialog.alert(uMLang.cantDelAdmin);
                return
            }


            Dialog.confirm(cLang.tips, uMLang.confirmDelUser + '：' + data.userId + '？', function () {

                Ajax.request({
                    url: Common.getUrlByName('batchDelUser') + "&corpId=" + data.corpId,
                    data: [{uid: data.uid}],
                    success: function () {
                        Dialog.tips(uMLang.delUserSuc);
                        me.refresh(!me.deptModel.deptId);
                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.delUserFail, data));
                    }
                });

            });

        },

        /**
         * 批量删除用户
         */
        deleteUsers: function () {
            var me = this;
            var data = this.list.getSelected();
            if (!data.length) {
                Dialog.tips(uMLang.selectDelUser);
                return
            }

            //不能删除管理员
            var param = _.filter(data, function (v) {
                return v.role != 'admin'
            });

            param = _.map(param, function (v) {
                return {uid: v.uid}
            });

            if (!param.length) {
                Dialog.alert(uMLang.cantDelAdmin);
                return
            }

            var opts = {
                url: Common.getUrlByName('batchDelUser') + "&corpId=" + data[0].corpId,
                data: param,
                success: function (data) {
                    Dialog.tips(uMLang.delUserSuc);
                    me.refresh(!me.deptModel.deptId);
                },
                fail: function (data) {
                    Dialog.tips(Common.mergeErrMsg(uMLang.delUserFail, data));
                    //console.log('批量删除用户失败',data);
                }
            };

            Dialog.confirm(cLang.tips, Common.stringFormat(uMLang.confirmDel2, param.length), function () {
                Ajax.request(opts);
            });

        },


        /**
         * 从部门移除单个用户
         */
        outUser: function (data) {
            var me = this;

            var opts = {
                url: Common.getUrlByName('manageDeptMember'),
                data: {
                    op: 'remove',
                    corpId: me.model.corpId,
                    deptId: me.model.deptIds[0],
                    member: [data.uid]
                },
                success: function (data) {
                    Dialog.tips(uMLang.outUserSuc);
                    me.refresh(!me.deptModel.deptId);
                },
                fail: function (data) {
                    Dialog.tips(Common.mergeErrMsg(uMLang.outUserFail, data));
                    //console.warn('移除用户失败',data);
                }
            };

            Dialog.confirm(cLang.tips, Common.stringFormat(uMLang.outConfirm, data.userId), function () {
                Ajax.request(opts);
            });
        },

        /**
         * 批量从部门移除用户
         */
        outUsers: function () {

            var me = this;
            var data = this.list.getSelected();

            if (!data.length) {
                Dialog.tips(uMLang.selectOutUser);
                return
            }

            var member = _.map(data, function (v) {
                return v.uid
            });

            var opts = {
                url: Common.getUrlByName('manageDeptMember'),
                data: {
                    op: 'remove',
                    corpId: me.model.corpId,
                    deptId: me.model.deptIds[0],
                    member: member
                },
                success: function (data) {
                    Dialog.tips(uMLang.outUserSuc);
                    me.refresh(!me.deptModel.deptId);
                },
                fail: function (data) {
                    Dialog.tips(Common.mergeErrMsg(uMLang.outUserFail, data));
                }
            };

            Dialog.confirm(cLang.tips, Common.stringFormat(uMLang.outConfirms, member.length), function () {
                Ajax.request(opts);
            });

        },

        /**
         * 导入用户
         */
        importUser: function () {
            var me = this;
            //console.log('批量导入用户');

            var importUserPop = Dialog.pop({
                title: uMLang.importUser,
                content: Common.tpl2Html(Common.getTemplate(userManagerTpl, '#importLead-tpl')),
                ok: function () {


                    $('#file-upload-iframe').off('load').on('load', function () {

                        var $this = $(this)[0];
                        var data;
                        try {
                            if ($this.contentWindow) {
                                data = $this.contentWindow.document.body ? $this.contentWindow.document.body.innerHTML : '{}';

                            } else if ($this.contentDocument) {
                                data = $this.contentDocument.document.body ? $this.contentDocument.document.body.innerHTML : '{}';
                            }
                            var rx = new RegExp("<pre.*?>(.*?)</pre>", "i"), am = rx.exec(data);
                            data = (am) ? am[1] : "";
                            data = (new Function("return " + data))();

                            if (data.code == 'S_OK') {
                                //$('.upload-result').html('文件上传成功，请稍后刷新页面查看部门用户数据！');
                                importUserPop.removePop();
                                me.importUserResult();
                                // Dialog.alert(uMLang.uploadTips);

                            } else {
                                $('.upload-result').html('<em style="color:#f00">' + uMLang.uploadFail + '</em>');
                            }

                        } catch (e) {
                            $('.upload-result').html('<em style="color:#f00">' + uMLang.fileNotExist + '</em>');
                        }

                    });


                    var allowExt = '.xls,.xlsx';
                    var path = $('#file').val();

                    if (path == '') {
                        Dialog.alert(uMLang.selectFile);
                        return
                    } else if (allowExt.indexOf(Common.getFileExt(path)) <= -1) {
                        var str = Common.stringFormat(uMLang.fileTips, allowExt);
                        Dialog.alert(str);
                        return
                    }

                    if ($.browser.msie) {
                        $("#file-form")[0].submit();
                    } else {
                        $("#file-form").submit();
                    }

                    $('.upload-result').html(uMLang.uploading);

                },
                okText: uMLang.importBtn,
                okRemovePop: false,
                onPop: function () {
                    var uploadUrl = Common.getUrlByName('uploadTemplate') + "&corpId=" + UserManage.model.corpId;
                    $('#file-form').attr('action', uploadUrl);


                    $('#file').on('change', function () {
                        var path = $('#file').val();
                        var name = path.substr(path.lastIndexOf('\\') + 1);
                        $('.file-result').text(name);
                        $('.upload-result').html('');
                    });


                }
            });
        },

        /**
         * 导入用户结果查询
         */
        importUserResult: function () {
            var me = this;

            Dialog.pop({
                title: uMLang.importUserResult,
                width: 600,
                content: Common.tpl2Html(Common.getTemplate(userManagerTpl, '#importResult-tpl')),
                onPop: function () {
                    me.getImpResult();
                },
                ok: function () {
                    me.impTimer && clearTimeout(me.impTimer);
                },
                cancel: function () {
                    me.impTimer && clearTimeout(me.impTimer);
                }
            });

        },


        /**
         * 获取导入用户结果查询数据
         */
        getImpResult: function () {
            var me = this;
            var opts = {
                url: Common.getUrlByName('getBatchImpDetail'),
                data: {corpId: me.model.corpId},
                success: function (data) {
                    me.renderImpResult(data);
                },
                fail: function (data) {
                    Dialog.tips(Common.mergeErrMsg(uMLang.getImpFail, data));
                    me.renderImpResult();
                }
            };
            Ajax.request(opts);
        },


        /**
         * 渲染导入用户结果查询数据
         */
        renderImpResult: function (data) {
            var me = this;

            !data && (data = {importList: {status: -1}});

            !data.importList && (data.importList = {status: -2});

            var statusText = [uMLang.impStatus0, uMLang.impStatus1, uMLang.impStatus2, uMLang.impStatus3];

            var detailHtml, listHtml = ['<tr><td class="noFail" colspan="4">', uMLang.noFail, '</td></tr>'];


            var status = data.importList.status;

            if (status === -1) {
                detailHtml = uMLang.getImpFail;
            } else if (status === -2) {
                detailHtml = uMLang.noImpResult;

            } else if (status <= 2) {
                detailHtml = uMLang.importing;
                me.impTimer && clearTimeout(me.impTimer);
                me.impTimer = setTimeout(_.bind(me.getImpResult, me), 10 * 1000);
            } else {
                detailHtml = Common.stringFormat(uMLang.impResult, data.importList.succNum, data.importList.failNum);
                var l = data.importDetail.length;
                var rowTpl = '<tr><td width="10">&nbsp;</td><td width="200"><%-userId%></td><td width="120"><%-statusText%></td><td><%-result%></td></tr>';
                rowTpl = _.template(rowTpl);
                if (l) {
                    listHtml = [];
                    for (var i = 0, j = l; i < j; i++) {
                        var row = data.importDetail[i];
                        row.statusText = statusText[row.status];
                        listHtml.push(rowTpl(row));
                    }
                }
            }

            $('#imResultNumber').text(detailHtml);
            $('#imTable tbody').html(listHtml.join(''));
        },

        /**
         * 验证
         */
        deptAccountValidate: function (userLimit) {

            var me = this;
            $('#deptAccountForm').validate({
                rules: {
                    'name': {
                        required: true,
                        deptName: true,
                        reDeptName: true
                    },
                    'storageNum': {
                        required: true,
                        number: true,
                        min: 1
                    },
                    'userLimit': {
                        required: true,
                        number: true,
                        digits: true,
                        max: userLimit,
                        min: 1
                    },
                    remark: {
                        remark: true
                    }
                },
                messages: {
                    'name': {
                        required: uMLang.typeDeptName,
                        deptName: uMLang.illegalDeptName,
                        reDeptName: uMLang.reDeptName
                    },
                    'storageNum': {
                        required: sLang.typeSpace,
                        number: sLang.typeNumber,
                        min: sLang.minNumber
                    },
                    'userLimit': {
                        required: sLang.typeUserLimit,
                        number: sLang.typeNumber,
                        max: uMLang.maxDeptMember || sLang.maxNumber,
                        digits: sLang.typeDigits,
                        min: sLang.minNumber
                    },
                    remark: {
                        remark: sLang.remarkLength
                    }
                },
                wrapper: "div",
                errorPlacement: function (error, element) {
                    $(element).parent().append(error.prepend('<i class="i-warm ml_5"></i>'));
                }
            });

        },

        /**
         * 添加部门
         */
        addDept: function () {
            var me = this;
            var tplStr = Common.getTemplate(userManagerTpl, '#creatDept-tpl');
            var data = {
                name: '',
                parentId: '',
                remark: '',
                storage: '',
                userLimit: '',
                userLimit2: 999999,
                storageObj: {
                    num: '',
                    unit: 'M'
                },
                size: Common.formatStorageUnit(me.model.corpData.storage),
                type: 'add'
            };

            var openPop = function () {
                var pop = Dialog.pop({
                    title: uMLang.addDept,
                    content: ['<div id="addDept">', Common.tpl2Html(tplStr, data), '</div>'].join(''),
                    okRemovePop: false,
                    ok: function () {

                        if (!$('#deptAccountForm').valid(me.model.deptIds[0])) {
                            return
                        }


                        var $addDept = $('#addDept');
                        var storage = Common.convertToB($addDept.find('.storageNum').val(), me.addDeptUnitSelect.value);

                        var param = {
                            url: Common.getUrlByName('addDept'),
                            data: {
                                name: $.trim($addDept.find('.name').val()),
                                parentId: me.model.deptIds[0],
                                remark: $.trim($addDept.find('.remark').val()),
                                storage: storage,
                                userLimit: parseInt($addDept.find('.userLimit').val(), 10),
                                corpId: me.model.corpId,
                                rootDeptId: (me.deptModel && me.deptModel.rootDeptId) || 0,
                                corpName: me.model.corpData.name
                            },
                            success: function (data) {
                                Dialog.tips(uMLang.addDeptSuc);
                                var treeObj = $.fn.zTree.getZTreeObj('depart');
                                var nodes = treeObj.getNodesByParam("deptId", me.model.deptIds[0], null);

                                if (data.parentId == 0) {
                                    data.rootDeptId = data.deptId;
                                } else {
                                    data.rootDeptId = me.deptModel.rootDeptId;
                                }


                                if (nodes.length) {
                                    data.isParent = false;
                                    treeObj.addNodes(nodes[0], data);
                                } else {
                                    me.getTopDpt(me.model.corpId);
                                }

                                //更新本地缓存
                                if (me.deptObj[data.parentId]) {
                                    me.deptObj[data.parentId].push(data);
                                } else {
                                    me.deptObj[data.parentId] = [data];
                                }

                            },
                            fail: function (data) {
                                Dialog.tips(Common.mergeErrMsg(uMLang.addDeptFail, data));
                            }
                        };
                        //发送新建部门请求
                        Ajax.request(param);
                        pop.removePop();
                    },
                    onPop: function () {
                        var $addDept = $('#addDept');
                        me.addDeptUnitSelect = new Dropkick($addDept.find('.storageUnit')[0]);
                        //me.editDeptUnitSelect.select(data.storageObj.unit);
                        me.deptAccountValidate(data.userLimit2);
                    }
                });
            };


            //查询可用空间
            Ajax.request({
                url: Common.getUrlByName('getDeptUnUsed'),
                data: {
                    corpId: me.model.corpId,
                    deptId: me.deptModel.deptId || 0,
                    parentId: me.deptModel.deptId || 0
                },
                success: function (info) {
                    data.storage = Common.formatStorageUnit(info.storage);
                    data.userLimit2 = info.userLimit;
                    openPop();
                },
                fail: function (data) {
                    Dialog.tips(Common.mergeErrMsg('获取部门可用空间失败', data));
                }
            });

        },

        /**
         * 获取部门详情
         */
        getDeptDetail: function (opts) {

            var me = this;
            Ajax.request({
                url: Common.getUrlByName('getDeptDetail'),
                data: opts.data,
                success: opts.success,
                fail: opts.fail
            });


        },

        /**
         * 修改部门设置
         */
        editDepartment: function () {
            var me = this;


            var opts = {
                data: {
                    corpId: me.model.corpId,
                    deptId: me.model.deptIds[0]
                },
                success: function (data) {

                    var tpl = Common.getTemplate(userManagerTpl, '#creatDept-tpl');

                    data.storageObj = Common.formatStorageUnit(data.storage, true);

                    data.size = Common.formatStorageUnit(me.model.corpData.storage);

                    data.type = 'edit';

                    var name;

                    var openPop = function () {
                        var pop = Dialog.pop({
                            title: uMLang.editDept,
                            content: ['<div id="editDept">', Common.tpl2Html(tpl, data), '</div>'].join(''),
                            okRemovePop: false,
                            ok: function () {

                                if (!$('#deptAccountForm').valid()) {
                                    return
                                }


                                var $editDept = $('#editDept');
                                var storage = Common.convertToB($editDept.find('.storageNum').val(), me.editDeptUnitSelect.value);
                                var newModel = {
                                    name: $.trim($editDept.find('.name').val()),
                                    storage: storage,
                                    userLimit: $editDept.find('.userLimit').val(),
                                    remark: $.trim($editDept.find('.remark').val())
                                };

                                var updateModel = _.omit(newModel, function (value, key, object) {
                                    return data[key] == value
                                });

                                if (_.isEmpty(updateModel)) {
                                    pop.removePop();
                                    return;
                                }

                                name = updateModel.name;

                                updateModel.deptId = data.deptId;
                                updateModel.corpId = me.model.corpId;
                                updateModel.parentId = me.deptModel.parentId || 0;

                                var param = {
                                    url: Common.getUrlByName('updateDept'),
                                    data: updateModel,
                                    success: function () {
                                        Dialog.tips(uMLang.editDeptSuc);

                                        //如果改了名字，更新节点数据
                                        if (name) {
                                            var treeObj = $.fn.zTree.getZTreeObj('depart');
                                            var nodes = treeObj.getNodesByParam("deptId", updateModel.deptId, null);
                                            nodes[0].name = name;
                                            treeObj.updateNode(nodes[0]);

                                            //更新本地缓存
                                            var cDept = _.find(me.deptObj[updateModel.parentId], function (v) {
                                                return v.deptId == updateModel.deptId;
                                            });
                                            cDept && (cDept.name = name);

                                        }

                                    },
                                    fail: function (data) {
                                        Dialog.tips(Common.mergeErrMsg(uMLang.editDeptFail, data));
                                    }
                                };
                                //发送修改部门请求
                                Ajax.request(param);
                                pop.removePop();
                            },
                            onPop: function () {
                                var $editDept = $('#editDept');
                                me.editDeptUnitSelect = new Dropkick($editDept.find('.storageUnit')[0]);
                                me.editDeptUnitSelect.select(data.storageObj.unit);

                                me.deptAccountValidate(data.userLimit2);
                            }
                        });
                    };

                    //查询可用空间
                    Ajax.request({
                        url: Common.getUrlByName('getDeptUnUsed'),
                        data: {
                            corpId: me.model.corpId,
                            deptId: me.deptModel.deptId || 0,
                            parentId: me.deptModel.parentId || 0
                        },
                        success: function (info) {
                            data.storage = Common.formatStorageUnit(info.storage);
                            data.userLimit2 = info.userLimit;
                            openPop();
                        },
                        fail: function (data) {
                            Dialog.tips(Common.mergeErrMsg('获取部门可用空间失败', data));
                        }
                    });

                },
                fail: function (data) {
                    Dialog.tips(Common.mergeErrMsg(uMLang.getDeptInfoFail, data));
                }
            };

            this.getDeptDetail(opts);
        },

        /**
         * 删除部门
         */
        deleteDepartment: function () {

            var me = this;

            Dialog.confirm(cLang.tips, uMLang.delDeptConfirm, function () {

                var opts = {
                    url: Common.getUrlByName('delDept'),
                    data: {
                        corpId: me.model.corpId,
                        name: me.deptModel.name,
                        deptIds: me.model.deptIds,
                        rootDeptId: me.deptModel.rootDeptId,
                        corpName: me.model.corpData.name,
                        parentId: me.deptModel.parentId || 0
                    },
                    success: function (data) {
                        Dialog.tips(uMLang.delDeptSuc);

                        var treeObj = $.fn.zTree.getZTreeObj('depart');
                        var nodes = treeObj.getNodesByParam("deptId", me.model.deptIds[0], null);
                        treeObj.removeNode(nodes[0]);

                        var pid = me.deptModel.parentId;
                        var pObj = me.deptObj[pid];
                        if (typeof pid !== 'undefined') {
                            _.each(pObj, function (v, i) {
                                if (v.deptId == me.model.deptIds[0]) {
                                    pObj.splice(i, 1);
                                    return;
                                }
                            });

                        } else {
                            me.getTopDpt(me.model.corpId);
                        }

                        me.getTopUser(me.model.corpId);
                        me.setBtnStatus('top');
                        me.deptModel = {};

                    },
                    fail: function (data) {
                        Dialog.tips(Common.mergeErrMsg(uMLang.delDeptFail, data));
                    }
                };

                Ajax.request(opts);

            });

        }
    };


    return {
        init: function () {
            UserManage.init();
        }
    };
});