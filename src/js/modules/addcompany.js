/**
 * Created by Yangz on 2016/3/16.
 */


define([
    'jquery',
    'underscore',
    "validate",
    "controls/Common",
    'i18n/' + global.language,
    'controls/Ajax',
    'controls/Dialog',
    "dropkick"
], function ($, _, validate, Common, Lang, Ajax, Dialog, dropkick) {

    var addCompany = {
        ui: {
            name: '#name',
            domain: '#domain',
            timeout: '#timeout',
            companySpace: '#company-space',
            unitSelectAdd: '#unit-select-add',
            userCount: '#user-count',
            companyId: '#company-id',
            password: '#password',
            password2: '#password2',
            btnAdd: '#btn-add',
            formCtrlCon: '#formCtrlCon'
        },
        init: function () {
            this.initSelect();
            this.initEvents();
            this.validate();
        },
        initSelect: function () {
            this.timeoutSelect = new Dropkick($(this.ui.timeout)[0]);
            this.unitSelect = new Dropkick($(this.ui.unitSelectAdd)[0]);
            this.userCountSelect = new Dropkick($(this.ui.userCount)[0]);
        },
        initEvents: function () {

            $(this.ui.btnAdd).on('click', _.bind(this.addRequest, this));

        },
        validate: function () {

            $(this.ui.formCtrlCon).validate({
                rules: {
                    'name': {
                        required: true
                    },
                    'domain': {
                        required: true,
                        domain: true
                    },
                    'user-count': {
                        required: true,
                        number: true
                    },
                    'company-space': {
                        required: true,
                        number: true
                    },
                    'company-id': 'required',
                    'password': 'required',
                    'password2': {
                        required: true,
                        equalTo: "#password"
                    }
                },
                messages: {
                    'name': {
                        required: Lang.setting.typeName
                    },
                    'domain': {
                        required: Lang.setting.typeDomain
                    },
                    'user-count': {
                        required: Lang.setting.typeUserLimit,
                        number: Lang.setting.typeNumber
                    },
                    'company-space': {
                        required: Lang.setting.typeSpace,
                        number: Lang.setting.typeNumber
                    },
                    'company-id': {
                        required: Lang.addCompany.typeAccount
                    },
                    'password': {
                        required: Lang.setting.typePwd
                    },
                    'password2': {
                        required: Lang.setting.typePwd2,
                        equalTo: Lang.setting.pswNotEqual
                    }
                },
                wrapper: "span",
                errorPlacement: function (error, element) {
                    $(element).parent().append(error.prepend('<i class="i-warm ml_5"></i>'));
                }
            });

        },
        addRequest: function () {
            var me = this;

            if (!$(this.ui.formCtrlCon).valid()) {
                return
            }

            var loading = {};

            var storage = Common.convertToB($(this.ui.companySpace).val(), this.unitSelect.value);
            var data = {
                name: $(me.ui.name).val(),
                domain: $(me.ui.domain).val(),
                outDate: parseInt($(me.ui.timeout).val(), 10),
                storage: storage,
                userLimit: parseInt($(me.ui.userCount).val(), 10),
                status: 0,
                userId: $(me.ui.companyId).val(),
                pwd: $(me.ui.password).val(),
                affirmPwd: $(me.ui.password2).val()
            };

            var opts = {
                url: me.dataAPI.getUrlByFnName('addCorp'),
                data: data,
                success: function (data) {

                    loading.close();
                    Dialog.alert(Lang.addCompany.addCompanySuc);
                    location.href = 'setting.do';

                },
                fail: function (data) {
                    loading.close();
                    Dialog.alert(Lang.addCompany.addCompanyFail);
                }
            };
            loading = Dialog.loading();
            Ajax.request(opts);
        },
        dataAPI: _.extend({}, Common.APIObj, {
            fnName: {
                addCorp: 'corp:addCorp'//添加企业
            }
        })

    };


    return {
        init: function () {
            addCompany.init();
        }
    }
});