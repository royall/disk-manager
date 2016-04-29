/**
 * Created by liuwei on 2016/3/1.
 */
define([
    'jquery',
    'underscore',
    "validate",
    "controls/Common",
    "controls/List",
    'controls/Ajax',
    "controls/Pager",
    "controls/Dialog",
    "text!../../template/setting.html",
    'i18n/' + global.language,
    "dropkick",
    'CryptoJS'
], function ($, _, validate, Common, List, Ajax, Pager, Dialog, tpl, Lang, dropkick,CryptoJS) {

    window.global = window.global || {user: {}, corpList: {}};

    var sLang = Lang.setting,
        cLang = Lang.common;

    var Module = {
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
    };


    var Setting = {
        el: '.mainContent',
        model: {
            corpId: function () {
                var corpId = Common.parseURL(location.href).params.corpId;
                return global.user.corpId || corpId || global.corpList[0].corpId
            }(),
            corpData: function () {
                var corpId = global.user.corpId || Common.parseURL(location.href).params.corpId;
                return _.find(window.global.corpList, function (v) {
                    return v.corpId == corpId
                });
            }()
        },
        init: function () {

            this.render();

            //初始化tab切换
            var $tab = $(this.el).find('.secMenu li');
            $tab.on('click', function () {
                var $this = $(this),
                    id = $this.data('id');
                var $content = $('#' + id);
                if ($content.length) {
                    $tab.find('a').removeClass('act');
                    $this.find('a').addClass('act');
                    $('.tab-li').hide();
                    $content.show();

                    Module.callModule(Setting[id]);
                    //Setting[id].init();
                }
            });

            //默认初始化企业设置

            //root 才显示企业列表
            if(global.user.role=='root'){
                Module.callModule(Setting.companyManage);
            }else{
                //$('.secMenu li[data-id=companyManage]').hide();
                $('.searchBox').hide();
                $('.secMenu li[data-id=normalSetting]').click();
                //Module.callModule(Setting.accountSecurity);
            }

            //Setting.companyManage.init();
        },
        render: function () {
            var t=Common.getTemplate(tpl,'#setting-tpl');
            $(this.el).html(Common.tpl2Html(t,{}));
        }
    };

    //网盘设置-企业管理
    Setting.companyManage = {
        el: '#companyManage',

        init: function () {
            //this.listCompany.init();
            Module.callModule(this.listCompany);
            $('.secMenu li[data-id=companyManage]').show();
            this.initEvents();
            this.isInitialized = true;

        },

        initEvents: function () {
            if (this.isInitialized) {
                return
            }
            var me = this;
            $(this.el).find('.opera_back a').on('click', function () {
                //me.init();
                Module.callModule(me);
            });

            var seaInput = $('.seaInput');
            seaInput.on('keyup', function (e) {
                if (e.keyCode == 13) {
                    if (seaInput.val()) {
                        me.listCompany.getData(1);
                    } else {
                        Dialog.tips(sLang.typeKeyword);
                    }
                } else if (((e.ctrlKey && e.keyCode == 88) || e.keyCode == 8 || e.keyCode == 46) && seaInput.val() == '') {
                    Module.callModule(me);
                }
            });
        },

        //网盘设置-企业管理-企业列表
        listCompany: {
            el: "#listCompany",
            ui: {
                companyType: '#company-type',
                companyBtn: '#company-btn',
                companyAdd: '#company-add'
            },
            init: function () {

                $(this.el).show().siblings().hide();
                this.initSelect();
                this.initEvents();
                this.initList();
                this.initBtn();
                this.initStyle();
                this.pageNo = 1;
                this.pageSize = 20;
                this.isInitialized = true;

                $('.searchBox').show();


                this.getData(0);

                $(window).off('resize.setting').on('resize.setting', this.initStyle);

                //this.renderList();
            },

            initSelect: function () {
                if (this.isInitialized) {
                    return
                }
                $(this.ui.companyType).dropkick();
            },

            initEvents: function () {
                var me = this;
                if (this.isInitialized) {
                    return
                }
                //筛选企业
                $(this.ui.companyType).on('change', function () {
                    var status = $(this).val();
                    me.getData(0, status);
                });

                //暂停企业
                $(this.ui.companyBtn).on('click', function () {
                    var selected = me.list.getSelected();
                    if (!selected.length) {
                        Dialog.tips(sLang.selectCompany);
                        return;
                    }

                    Dialog.confirm(cLang.tips, '确定锁定所选企业？', function () {
                        me.updateCorpStatus(selected);
                    });

                });

                //添加企业
                $(this.ui.companyAdd).on('click', function () {
                    Module.callModule(Setting.companyManage.addCompany);
                    //Setting.companyManage.addCompany.init();
                });
            },

            initList: function () {
                var me = this;
                this.list = this.list || new List({
                        container: '#company-list',
                        data: [],
                        hasCheckBtn: true,
                        key: 'corpId',
                        columns: [
                            {
                                columnId: 'name',
                                columnName: sLang.companyName,
                                titleStyle: '',
                                titleAttr: 'width="20%"',
                                callback: function (value) {
                                    return ['<span class="tf"><a data-action="showDetail" href="javascript:;" title="', value, '">', value, '</a></span>'].join('')
                                },
                                action: 'showDetail',
                                onClick: $.proxy(me.showDetail, me)
                            },
                            {
                                columnId: 'domain',
                                columnName: sLang.domain,
                                titleStyle: '',
                                titleAttr: 'width="15%"',
                                callback: function () {
                                    return ""
                                }
                            },
                            {
                                columnId: 'status',
                                columnName: sLang.status,
                                titleStyle: '',
                                titleAttr: 'width="10%"',
                                callback: function (v) {
                                    return Common.getStatus(v);
                                }
                            },
                            {
                                columnId: 'outDate',
                                columnName: sLang.timeout,
                                titleStyle: '',
                                titleAttr: 'width="15%"',
                                callback: function (v) {
                                    return Common.getOutDate(v);

                                }
                            },
                            {
                                columnId: 'storage',
                                columnName: sLang.space,
                                titleStyle: '',
                                titleAttr: 'width="15%"',
                                callback: function (v) {
                                    return Common.formatStorageUnit(v);
                                }
                            },
                            {
                                columnId: 'userLimit',
                                columnName: sLang.userLimit,
                                titleStyle: '',
                                titleAttr: 'width="10%"',
                                callback: function (v) {
                                    return v + sLang.userUnit;
                                }
                            }
                        ],
                        operate: {
                            columnName: cLang.operate,
                            titleStyle: '',
                            titleAttr: 'width="15%"',
                            list: [
                                {name: cLang.edit, action: 'edit', className: 'mr_10', onClick: $.proxy(me.edit, me)},
                                {
                                    name: sLang.userManage,
                                    action: 'userManage',
                                    className: 'mr_10',
                                    onClick: $.proxy(me.userManage, me)
                                }
                            ]
                        }
                    });
            },

            initBtn: function () {
                var role = global.user.role;
                if (role != 'root') {
                    $('#company-add').hide();
                }
            },

            initStyle: function () {

                var h=global.height-49-49-44-10;
                var str='.tableBox{height:'+h+'px}';
                Common.addStyle('setting',str);
            },

            /**
             * 获取请求列表的参数，
             * @param type 获取参数的类型, 0 :分页列表 , 1：按名字搜索的列表
             */
            getRequestUrl: function (type) {

                return Setting.dataAPI.getUrlByFnName('listCorp');

                //if(!type){
                //    url=[url,'&pageNo=',this.pageNo,'&pageSize=',this.pageSize].join('');
                //}
            },

            /**
             * 获取列表数据
             * @param type 0-分页列表 ，1-搜索
             * @param status  根据企业状态查询列表入参
             */
            getData: function (type, status) {
                var me = this;
                var url = this.getRequestUrl(type),
                    opts;

                var keyword = $('.seaInput').val();

                var sta=$('#company-type').val();

                //是否搜索
                if (type) {

                    opts = {
                        url: url,
                        data: {
                            name: keyword,
                            domain: keyword,
                            status:sta
                        },
                        success: function (data) {

                            //$(me.el).show().siblings().hide();
                            me.listData = data || [];
                            me.getDataByPage(1);
                        },
                        fail: function (data) {
                            Dialog.alert(cLang.searchFail+' '+(data.code||''));
                            //me.renderList();
                        }
                    };

                } else {
                    opts = {
                        url: url,
                        data: {status: -1},
                        success: function (data) {
                            me.listData = data || [];
                            me.getDataByPage(me.pageNo);
                            //me.renderList(data);
                        },
                        fail: function (data) {
                            Dialog.tips(sLang.listFail+' '+(data.code||''));
                            //me.renderList();
                        }
                    };
                    if (status !== undefined) {
                        _.extend(opts, {
                            data: {status: status}
                        });
                    }
                    var v=keyword;
                    if(v){
                        opts.data.name=v;
                        opts.data.domain=v;
                    }
                }
                opts.data.status=sta;
                Ajax.request(opts);
            },

            getDataByPage: function (pageNo) {

                var me = this;
                var start = (pageNo - 1) * this.pageSize;
                var data = this.listData.concat().splice(start, this.pageSize);

                var dataObj = {
                    corpList: data,
                    pageNo: pageNo,
                    pageSize: me.pageSize,
                    total: this.listData.length
                };

                this.renderList(dataObj);
            },

            renderList: function (data) {
                var me = this;

                this.list.setData(data.corpList);

                this.pager = new Pager({
                    el: '.company-list-pager',
                    pageNo: data.pageNo,
                    total: data.total,
                    pageSize: data.pageSize,
                    onclick: function (page) {
                        me.pageNo = page;
                        me.getDataByPage(page);
                    }
                });

            },

            showDetail: function (data, el) {
                //Setting.companyManage.showCompany.init(data.corpId);
                Module.callModule(Setting.companyManage.showCompany, data.corpId);
            },

            edit: function (data, el) {
                //Setting.companyManage.editCompany.init(data.corpId);
                Module.callModule(Setting.companyManage.editCompany, data.corpId);
            },

            userManage: function (data, el) {
                location.href = window.modules.userManager + '.do?corpId=' + data.corpId;
            },

            updateCorpStatus: function (selected) {
                var corpIds = _.map(selected, function (v) {
                    return v.corpId;
                });

                var opts = {
                    url: Setting.dataAPI.getUrlByFnName('updateCorp'),
                    data: {
                        corpIds: corpIds,
                        status: 1
                    },
                    success: function (data) {
                        Dialog.tips(sLang.editStatusSuc);
                        Module.callModule(Setting.companyManage.listCompany);
                        //Setting.companyManage.listCompany.init();
                    },
                    fail: function (data) {
                        Dialog.tips(sLang.editStatusFail+' '+(data.code||''));
                    }
                };

                Ajax.request(opts);
            },

            destroy: function () {
                $('.searchBox').hide();
            }
        },

        //网盘设置-企业管理-添加企业
        addCompany: {
            el: "#addCompany",
            ui: {
                select: '#addCompany .real-select',
                unitSelect: '#addCompany #unit-select-add',
                formCtrlCon: '#formCtrlCon',
                addOk: "#add-ok"
            },
            init: function () {
                $(this.el).show().siblings().hide();
                this.render();
                this.initSelect();
                this.initEvents();

                this.validate();

                this.isInitialized = true;
            },
            render: function () {
                var tplStr = Common.getTemplate(tpl, '#formCtrlCon-tpl');
                var html = Common.tpl2Html(tplStr, {});
                $('#formCtrlCon').html(html);
            },
            initSelect: function () {
                //if(this.isInitialized){return}
                $(this.ui.select).dropkick();
                $(this.ui.unitSelect).dropkick();
            },
            initEvents: function () {
                var me = this;
                if (this.isInitialized) {
                    return
                }
                $(this.ui.addOk).on('click', function () {
                    me.add();
                });
            },
            validate: function () {

                $(this.ui.formCtrlCon).validate({
                    rules: {
                        'company-name': {
                            required: true,
                            companyName:true
                        },
                        'company-domain': {
                            required: true,
                            domain: true
                        },
                        'user-count': {
                            required: true,
                            number: true,
                            min:0
                        },
                        'company-space': {
                            required: true,
                            number: true,
                            min:0
                        },
                        'company-account': {
                            required: true,
                            account:true
                            //remote: {
                            //    url: "validateurl.aspx",
                            //    type: "get",               //数据发送方式
                            //    dataType: "json",
                            //    data: {
                            //        txtEmail: function () {
                            //            return $("#txtEmail").val();
                            //        }
                            //    },
                            //    dataFilter: function (data) {
                            //        var json = $.parseJSON(data);
                            //        if (json.error == "true") {
                            //            return "\"" + json.errorMessage + "\"";
                            //        } else {
                            //            return success;
                            //        }
                            //    }
                            //}
                        },
                        'company-pswd': {
                            required: true,
                            minlength: 6,
                            companyPswd:true
                            //maxlength:12
                        },
                        'company-pswd-2': {
                            required: true,
                            minlength: 6,
                            companyPswd:true,
                            //maxlength:12,
                            equalTo: "#company-pswd"
                        }
                    },
                    messages: {
                        'company-name': {
                            required: sLang.typeName,
                            companyName:sLang.typeLegalName
                        },
                        'company-domain': {
                            required: sLang.typeDomain
                        },
                        'user-count': {
                            required: sLang.typeUserLimit,
                            number: sLang.typeNumber,
                            min:sLang.minNumber
                        },
                        'company-space': {
                            required: sLang.typeSpace,
                            number: sLang.typeNumber,
                            min:sLang.minNumber
                        },
                        'company-account': {
                            required: sLang.typeAccount,
                            account:sLang.typeLegalAccount,
                            remote: sLang.accountExist
                        },
                        'company-pswd': {
                            required: sLang.typePwd,
                            minlength: sLang.minPsw,
                            maxlength: sLang.maxPws,
                            companyPswd:sLang.legalPsw
                        },
                        'company-pswd-2': {
                            required: sLang.typeConfirmPwd,
                            minlength: sLang.minPsw,
                            maxlength: sLang.maxPws,
                            equalTo: sLang.pswNotEqual,
                            companyPswd:sLang.legalPsw
                        }
                    },
                    wrapper: "span",
                    errorPlacement: function (error, element) {
                        $(element).parent().append(error.prepend('<i class="i-warm ml_5"></i>'));
                    }
                });

            },
            add: function () {

                if (!$(this.ui.formCtrlCon).valid()) {
                    return
                }

                var storage = Common.convertToB($('#company-space').val(), $(this.ui.unitSelect).val());
                var data = {
                    name: $('#company-name').val(),
                    domain: $('#company-domain').val(),
                    outDate: $('#timeout').val(),
                    storage: storage,
                    userLimit: $('#user-count').val(),
                    status: $('#company-status').val(),
                    userId: $('#company-account').val(),
                    pwd: CryptoJS.MD5($('#company-pswd').val()).toString().toUpperCase(),
                    affirmPwd: CryptoJS.MD5($('#company-pswd-2').val()).toString().toUpperCase()
                };

                var opts = {
                    url: Setting.dataAPI.getUrlByFnName('addCorp'),
                    data: data,
                    success: function (data) {
                        Dialog.tips(sLang.addComSuc);
                        setTimeout(function(){
                            window.location.reload();
                        },800);

                        //Module.callModule(Setting.companyManage.listCompany);
                    },
                    fail: function (data) {
                        Dialog.tips(sLang.addComFail+' '+(data.code||''));
                    }
                };
                Ajax.request(opts);
            }

        },

        //网盘设置-企业管理-编辑企业
        editCompany: {
            el: "#editCompany",
            ui: {
                select: '#editCompany .real-select',
                name: '#company-name-edit',
                domain: '#company-domain-edit',
                space: '#company-space-edit',
                spaceUnit: '#unit-select-edit',
                timeout: '#timeout-edit',
                count: '#user-count-edit',
                status: '#company-status-edit',
                editOk: '#edit-ok',
                editCancel: '#edit-cancel',
                formCtrlCon: '#formCtrl-edit-form'
            },
            init: function (id) {

                this.initEvents();

                this.getData(id);

                this.isInitialized = true;

                $(this.el).show().siblings().hide();
            },
            initSelect: function () {
                //if(this.isInitialized){return}
                //$(this.ui.select).dropkick();
                this.outDateSelect = new Dropkick($(this.ui.timeout)[0]);
                //this.countSelect=new Dropkick($(this.ui.count)[0]);
                this.statusSelect = new Dropkick($(this.ui.status)[0]);
                this.spaceUnitSelect = new Dropkick($(this.ui.spaceUnit)[0]);

            },
            initEvents: function () {
                var me = this;
                if (this.isInitialized) {
                    return
                }

                $(this.ui.editOk).on('click', function () {
                    me.update();
                });
                $(this.ui.editCancel).on('click', function () {
                    Module.callModule(Setting.companyManage.listCompany);
                    //Setting.companyManage.listCompany.init();
                });
            },
            getData: function (id) {

                var me = this;
                var opts = {
                    url: Setting.dataAPI.getUrlByFnName('getCorpDetail'),
                    data: {corpId: id},
                    success: function (data) {
                        me.render(data);
                    },
                    fail: function (data) {
                        Dialog.tips(sLang.getComInfoFail+' '+(data.code||''));
                    }
                };
                Ajax.request(opts);

            },
            tplHelper: function (data) {
                //{code:"S_OK",errorCode:"",summary:"",var:"{corpId:734004224,name:"陈华055",domain:"chenhua055",outDate:121,storage:100000001,userLimit:1001}"}
                var temp = _.extend({}, data);
                temp.outDate = Common.getOutDate(temp.outDate);

                var storage = Common.formatStorageUnit(temp.storage, true);
                temp.storage = storage.num;
                //temp.userLimit=temp.userLimit;
                return temp;
            },
            render: function (data) {

                this.model = data;

                var formCtrlEdit = $('#formCtrl-edit');

                //var template= _.template(Common.getTemplate(tpl,'#formCtrl-edit-tpl'));
                var tplData = this.tplHelper(data);
                var html = Common.tpl2Html(Common.getTemplate(tpl, '#formCtrl-edit-tpl'), tplData);

                formCtrlEdit.html(html);

                this.initSelect();

                this.outDateSelect.select(data.outDate.toString());
                //this.countSelect.select(data.userLimit.toString());
                this.statusSelect.select(data.status.toString());
                this.spaceUnitSelect.select(Common.formatStorageUnit(data.storage, true).unit.toString());

                this.validate();

            },
            validate: function () {

                $(this.ui.formCtrlCon).validate({
                    rules: {
                        'company-name-edit': {
                            required: true,
                            companyName:true
                        },
                        'company-domain-edit': {
                            required: true,
                            domain: true
                        },
                        'user-count-edit': {
                            required: true,
                            number: true,
                            min:0
                        },
                        'company-space-edit':{
                            required: true,
                            number: true,
                            min:0
                        },
                        remark:{
                            remark:true
                        }
                    },
                    messages: {
                        'company-name-edit': {
                            required: sLang.typeName,
                            companyName:sLang.typeLegalName
                        },
                        'company-domain-edit': {
                            required: sLang.typeDomain
                        },
                        'user-count-edit': {
                            required: sLang.typeUserLimit,
                            number: sLang.typeNumber,
                            min:sLang.minNumber
                        },
                        'company-space-edit': {
                            required: sLang.typeSpace,
                            number: sLang.typeNumber,
                            min:sLang.minNumber
                        },
                        remark:{
                            remark:sLang.remarkLength
                        }
                    },
                    wrapper: "span",
                    errorPlacement: function (error, element) {
                        $(element).parent().append(error.prepend('<i class="i-warm ml_5"></i>'));
                    }
                });
            },
            update: function () {
                var me = this;

                if (!$(this.ui.formCtrlCon).valid()) {
                    return
                }

                var storage = Common.convertToB($(me.ui.space).val(), $(this.ui.spaceUnit).val());

                var newModel = {
                    name: $.trim($(me.ui.name).val()),
                    domain: $(me.ui.domain).val(),
                    outDate: Number($(me.ui.timeout).val()),
                    storage: storage,
                    userLimit: Number($(me.ui.count).val()),
                    status: Number($(me.ui.status).val())
                };

                var updateData = _.omit(newModel, function (value, key, object) {
                    return me.model[key] == value
                });

                if (_.isEmpty(updateData)) {
                    Module.callModule(Setting.companyManage.listCompany);
                    return
                }

                updateData.corpId = me.model.corpId;

                updateData.status===undefined && (updateData.status=-1);

                var opts = {
                    url: Setting.dataAPI.getUrlByFnName('updateCorp'),
                    data: updateData,
                    success: function (data) {
                        me.model = newModel;
                        Dialog.tips(sLang.editComSuc);
                        Module.callModule(Setting.companyManage.listCompany);
                    },
                    fail: function (data) {
                        Dialog.tips(sLang.editComFail+' '+(data.code||''));
                    }
                };
                Ajax.request(opts);
            },
            destroy: function () {
                $('#formCtrl-edit .subCon input').val('');
            }
        },

        //网盘设置-企业管理-企业信息
        showCompany: {
            el: '#showCompany',
            init: function (id) {
                $(this.el).show().siblings().hide();
                this.getData(id);
            },
            getData: function (id) {

                var me = this;
                var opts = {
                    url: Setting.dataAPI.getUrlByFnName('getCorpDetail'),
                    data: {corpId: id},
                    success: function (data) {
                        me.render(data);
                    },
                    fail: function (data) {
                        Dialog.tips(sLang.getComInfoFail+' '+(data.code||''));
                    }
                };
                Ajax.request(opts);

            },
            tplHelper: function (data) {
                //{code:"S_OK",errorCode:"",summary:"",var:"{corpId:734004224,name:"陈华055",domain:"chenhua055",outDate:121,storage:100000001,userLimit:1001}"}
                data.outDate = Common.getOutDate(data.outDate);
                data.storage = Common.formatStorageUnit(data.storage);
                data.userLimit = data.userLimit + sLang.userUnit;
                data.status = Common.getStatus(data.status);
                return data;
            },
            render: function (data) {
                if (!data) {
                    return
                }
                this.model = data;
                var con = $('#detail-con'),
                    conTpl = $('#detail-con-tpl');
                var tplHelper = this.tplHelper(data);
                var html = Common.tpl2Html(Common.getTemplate(tpl, '#detail-con-tpl'), tplHelper);
                con.html(html);
            },
            destroy: function () {
                $('#detail-con .subCon').html('');
            }
        }
    };


    //网盘设置-账户安全
    Setting.accountSecurity = {
        ui: {
            minLength: '#min-length',
            special: '#account-checkbox-1',
            caps: '#account-checkbox-2',
            weak: '#account-checkbox-3',
            duration: '#password-duration',
            accountOk: '#account-ok'
        },
        init: function () {
            this.initSelect();
            this.initEvents();
            this.initData();
            this.isInitialized = true;
            $('.container .tab-li').hide();
            $('#accountSecurity').show();
        },
        initSelect: function () {
            if (this.isInitialized) {
                return
            }
            this.minLengthSelect = new Dropkick($(this.ui.minLength)[0]);
            this.durationSelect = new Dropkick($(this.ui.duration)[0]);
        },
        initEvents: function () {
            if (this.isInitialized) {
                return
            }
            var me = this;
            $(me.ui.accountOk).on('click', function () {
                me.updateAccountRule();
            });
        },
        initData: function () {

            var me = this;

            var opts = {
                url: Setting.dataAPI.getUrlByFnName('getAccountRule'),
                data: {corpId: Setting.model.corpId},
                success: function (data) {
                    me.render(data);
                },
                fail: function (data) {
                    Dialog.tips(sLang.getSafeInfoFail+' '+(data.code||''));
                }
            };
            Ajax.request(opts);

        },
        render: function (data) {
            //[{corpId:121212,ruleId:1,ruleName:'禁止若密码',ruleValue:'/\w/',isCheck:0}]

            var minLength = data[0],
                duration = data[4],
                special = data[1],
                caps = data[2],
                weak = data[3];

            this.minLengthSelect.select(minLength.ruleValue.toString());
            this.durationSelect.select(duration.ruleValue.toString());

            $(this.ui.special).prop('checked', special.isCheck);
            $(this.ui.caps).prop('checked', caps.isCheck);
            $(this.ui.weak).prop('checked', weak.isCheck);

        },
        updateAccountRule: function () {
            //1：密码长度，2特殊字符，3包含大写，4禁止若密码，5定期修改

            var me = this;
            var minLength = $(me.ui.minLength).val(),
                special = $(me.ui.special).is(":checked"),
                caps = $(me.ui.caps).is(":checked"),
                weak = $(me.ui.weak).is(":checked"),
                duration = $(me.ui.duration).val();

            var corpId = Setting.model.corpId;
            var data = [
                {"corpId": corpId, "ruleId": 1, "ruleValue": minLength, "isCheck": ''},
                {"corpId": corpId, "ruleId": 2, "ruleValue": "", "isCheck": special ? 1 : 0},
                {"corpId": corpId, "ruleId": 3, "ruleValue": "", "isCheck": caps ? 1 : 0},
                {"corpId": corpId, "ruleId": 4, "ruleValue": "", "isCheck": weak ? 1 : 0},
                {"corpId": corpId, "ruleId": 5, "ruleValue": duration, "isCheck": ''}
            ];

            var opts = {
                url: Setting.dataAPI.getUrlByFnName('updateAccountRule'),
                data: data,
                success: function (data) {
                    Dialog.tips(cLang.setSuc);
                },
                fail: function (data) {
                    Dialog.tips(cLang.setFail+' '+(data.code||''));
                }
            };
            Ajax.request(opts);


        }
    };


    //常规设置
    Setting.normalSetting={
        el:'#normalSetting',
        init: function () {

            this.getData();
            // this.render();
            this.initEvents();
            this.initValid();
            this.isInitialized = true;
        },
        render: function (data) {

            data = data || {
                    diskMaxFileUpLoad: 0,
                    diskMaxUserCapacity: 0,
                    maxUserTeamCapacity: 0,
                    maxUserTeamNum: 0,
                    maxUserTeamMember: 0,
                    diskVersionsNum: 0,
                    diskVersionsTime: 0
                };

            //单位转换
            data.diskMaxFileUpLoad=Common.formatStorageUnit(data.diskMaxFileUpLoad,true,'G').num;
            data.diskMaxUserCapacity=Common.formatStorageUnit(data.diskMaxUserCapacity,true,'M').num;
            data.maxUserTeamCapacity=Common.formatStorageUnit(data.maxUserTeamCapacity,true,'M').num;

            var t=Common.getTemplate(tpl,'#normalSetting2');
            $('#ns-ul').html(Common.tpl2Html(t,data));
        },
        initEvents: function () {
            var me=this;
            if(this.isInitialized){
                return
            }
            $('#s-btn-ok').on('click', function () {

                if($('#nsForm').valid()){
                    me.setData();
                }

            });
        },
        getData: function () {
            var me=this;

            var opts={
                url:Setting.dataAPI.getUrlByFnName('getCorpService'),
                data:{
                    corpId:Setting.model.corpId
                },
                success: function (data) {
                    me.render(data);
                },
                fail: function (data) {
                    Dialog.tips('获取常规设置数据失败! '+(data.code||''));
                    me.render();
                }
            };
            Ajax.request(opts);

        },
        setData: function () {
            var me=this;
            var formData={};
            $('#ns-ul input').each(function () {
                var $this=$(this);
                var name=$this.attr('name');
                formData[name]=Number($this.val());
            });


            //单位转换
            formData.diskMaxFileUpLoad=Common.convertToB(formData.diskMaxFileUpLoad,'G');
            formData.diskMaxUserCapacity=Common.convertToB(formData.diskMaxUserCapacity,'M');
            formData.maxUserTeamCapacity=Common.convertToB(formData.maxUserTeamCapacity,'M');

            formData.corpId=Setting.model.corpId;

            var opts={
                url:Setting.dataAPI.getUrlByFnName('updateCorpService'),
                data:formData,
                success: function (data) {
                    Dialog.tips('设置保存成功！');
                },
                fail: function (data) {
                    Dialog.tips('设置失败！'+(data.code||''));
                }
            };
            Ajax.request(opts);
        },
        initValid: function () {

            $('#nsForm').validate({
                rules: {
                    'diskMaxFileUpLoad': {
                        required: true,
                        number:true,
                        min:0
                    },
                    'diskMaxUserCapacity': {
                        required: true,
                        number:true,
                        min:0
                    },
                    'maxUserTeamCapacity': {
                        required: true,
                        number:true,
                        min:0
                    },
                    'maxUserTeamNum': {
                        required: true,
                        number:true,
                        digits:true,
                        min:0
                    },
                    'maxUserTeamMember': {
                        required: true,
                        number:true,
                        digits:true,
                        min:0
                    },
                    'diskVersionsNum': {
                        required: true,
                        number:true,
                        digits:true,
                        min:0
                    },
                    'diskVersionsTime': {
                        required: true,
                        number:true,
                        digits:true,
                        min:0
                    }
                },
                messages: {
                    'diskMaxFileUpLoad': {
                        required: '请输入单文件上传最大值',
                        number:true,
                        min:sLang.minNumber
                    },
                    'diskMaxUserCapacity': {
                        required: '请输入用户个人盘最大容量',
                        number:true,
                        min:sLang.minNumber
                    },
                    'maxUserTeamCapacity': {
                        required: '请输入单用户团队协作最大容量',
                        number:true,
                        min:sLang.minNumber
                    },

                    'maxUserTeamNum': {
                        required: '请输入单用户可创建团队协作个数',
                        number:true,
                        min:sLang.minNumber,
                        digits:'请输入整数'
                    },
                    'maxUserTeamMember': {
                        required: '请输入单用户团队协作成员上限',
                        number:true,
                        min:sLang.minNumber,
                        digits:'请输入整数'
                    },
                    'diskVersionsNum': {
                        required: '请输入历史版本保留个数',
                        number:true,
                        min:sLang.minNumber,
                        digits:'请输入整数'
                    },
                    'diskVersionsTime': {
                        required: '请输入历史版本保留时间',
                        number:true,
                        min:sLang.minNumber,
                        digits:'请输入整数'
                    }

                },
                wrapper: "span",
                errorPlacement: function (error, element) {
                    $(element).parent().append(error.prepend('<i class="i-warm ml_5"></i>'));
                }
            });

        }
    };


    //网盘设置-消息设置
    Setting.messageSetting = {};


    //网盘设置-企业定制
    Setting.companyDiy = {};


    //数据接口
    Setting.dataAPI = _.extend({}, Common.APIObj, {
        fnName: {
            addCorp: 'corp:addCorp',//添加企业
            updateCorp: 'corp:updateCorp',//修改企业
            getCorpDetail: 'corp:getCorpDetail',//企业详情
            listCorp: 'corp:listCorp',//企业列表
            updateCorpStatus: 'corp:updateCorpStatus',//批量更新企业状态
            updateAccountRule: 'account:updateAccountRule',//账户安全设置
            getAccountRule: 'account:getAccountRule',//获取账户密码安全设置项
            getCorpService:'corp:getCorpService',//获取常规设置
            updateCorpService:'corp:updateCorpService'//更新常规设置
        }
    });

    return {
        init: function () {
            Setting.init();
        }
    };

});