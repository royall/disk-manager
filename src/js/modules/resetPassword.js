/**
 * Created by Yangz on 2016/10/24.
 */

(function ($) {

    var resetPwd = {
        init: function () {
            var step = this.getStep();
            this[step]();
            // this.checkPwd();
        },
        getStep: function () {
            var step;
            var stepList = ['step1', 'step2', 'step3', 'step4', 'error'];
            for (var i = 0, l = stepList.length; i < l; i++) {
                var v = stepList[i];
                if ($('.' + v).length) {
                    step = v;
                    break;
                }
            }
            return step;
        },
        step1: function () {

            var errorCode=$('#errorCode').val();
            if(errorCode){
                var errMsg=this.getErrMsg(errorCode);
                $.sobox.alert('系统提示', '<div style="padding:10px 0">'+errMsg+'</div>', function(){});
            }

            var inputBox = document.getElementById('input-box');
            var input = inputBox.getElementsByTagName('input');

            var $email = $('#email');
            var $code = $('#code');
            var $emailErrTips = $('#email-err-tips');
            var $codeErrTips = $('#code-err-tips');

            var p1 = $email.attr('placeholder');
            var p2 = $code.attr('placeholder');

            var emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

            var codeUrl = $('.code').attr('src');

            $('#input-box .txt').on('focus', function () {
                var $this = $(this);
                var placeholder = $this.attr('placeholder');
                var text = $this.val();
                if (text == placeholder) {
                    $this.val('');
                }
                $this.addClass('txt-focus');
            }).on('blur', function () {
                var $this = $(this);
                var placeholder = $this.attr('placeholder');
                var text = $this.val();
                if (text == '') {
                    $this.val(placeholder);
                }
                $this.removeClass('txt-focus');
            });


            var check = function () {

                var email = $email.val();
                var code = $code.val();

                if (email == '' || email == p1) {
                    $emailErrTips.text('请输入邮箱地址').show();
                    $email.focus();
                    return false;
                } else {
                    if (emailReg.test(email)) {
                        $emailErrTips.hide();
                    } else {
                        $emailErrTips.text('请输入正确的邮箱地址').show();
                        $email.focus();
                        return false;
                    }
                }

                if (code == '' || code == p2) {
                    $codeErrTips.text('请输入验证码').show();
                    $code.focus();
                    return false;
                } else {
                    $codeErrTips.hide();
                }

                return true;
            };

            $('#form').on('submit', function () {
                if (!check()) {
                    return false;
                }
            });

            //刷新验证码
            $('.code').on('click', function () {
                $(this).attr('src', codeUrl + '&r=' + Math.random());
            });


        },
        step2: function () {

        },
        step3: function () {

            var pwd1 = $('#pwd1');
            var pwd2 = $('#pwd2');

            var errorCode=$('#errorCode').val();
            if(errorCode){
                var errMsg=this.getErrMsg(errorCode);
                $.sobox.alert('系统提示', '<div style="padding:10px 0">'+errMsg+'</div>', function(){});
            }

            var me = this;
            var inputBox = $('#input-box');
            var input = inputBox.find('input');

            input.on('focus', function () {
                $(this).addClass('txt-focus');
            }).on('blur', function () {
                $(this).removeClass('txt-focus');
            });

            $('#form').on('submit', function () {
                if (!me.checkPwd()) {
                    return false;
                } else {
                    pwd1.val(CryptoJS.MD5(pwd1.val()).toString().toUpperCase());
                    pwd2.val(CryptoJS.MD5(pwd2.val()).toString().toUpperCase());
                }
            });

        },
        step4: function () {

        },
        error: function () {

        },

        getErrMsg:function (errCode) {

            var errors = {
                MAIL_VALIDATE_FAILED: '系统邮箱验证失败',
                MAIL_NOT_BOUND: '该邮箱未被绑定',
                MAIL_BOUND_REPEAT: '该邮箱重复绑定',
                MAIL_SERVICE_CLOSE: '未开通发送邮件服务,请联系管理员重置密码',
                MAIL_SEND_FAILED: '邮件发送失败,请联系管理员',
                VALIDATION_CODE_ERROR: '图片验证码错误,请重新输入',
                USER_EMAIL_ERROR:'邮箱格式错误',
                PARAM_IS_NULL:'参数为空'
            };

            return errors[errCode]||('未知错误('+errCode+')');
        },
        checkPwd: function () {
            var pwd1 = $('#pwd1');
            var pwd2 = $('#pwd2');

            var errTips1 = $('#err-tips1');
            var errTips2 = $('#err-tips2');
            var errTips3 = $('#err-tips3');

            var v1 = pwd1.val();
            var v2 = pwd2.val();

            var pwdRule = {};
            var reg;
            try {
                var data = global.rules;
            } catch (e) {
                $.sobox.alert('系统提示', '<div style="padding:10px 0">'+'获取密码规则失败！'+'</div>', function(){});

                return false;
            }

            var keyArray = ['length', 'spChar', 'caps', 'weak', 'timeout'];

            if (v1 == '') {
                errTips1.text('请输入新密码').show();
                pwd1.focus();
                return false;
            } else {

                for (var i = 0, l = data.length; i < l; i++) {
                    var v = data[i];
                    var ruleId = v.ruleId;
                    pwdRule[keyArray[ruleId - 1]] = v;
                }

                var length = pwdRule['length'].ruleValue;

                if (v1.length < ~~pwdRule['length'].ruleValue) {
                    errTips1.text('请输入至少' + pwdRule.length.ruleValue + '个字符的密码').show();
                    pwd1.focus();
                    return false;
                }

                if (pwdRule.spChar.isCheck) {
                    reg = new RegExp(pwdRule.spChar.ruleValue);
                    if (!reg.test(v1)) {
                        errTips1.text('必须包含特殊字符,如!@#$%^&*.').show();
                        pwd1.focus();
                        return false;
                    }
                }

                if (pwdRule.caps.isCheck) {
                    reg = new RegExp(pwdRule.caps.ruleValue);
                    if (!reg.test(v1)) {
                        errTips1.text('必须包含大写字母').show();
                        pwd1.focus();
                        return false;
                    }
                }

                if (pwdRule.weak.isCheck) {
                    reg = new RegExp(pwdRule.weak.ruleValue);
                    if (reg.test(v1)) {
                        errTips1.text('禁止使用弱密码，如一种字符或连续字符').show();
                        pwd1.focus();
                        return false;
                    }
                }

                errTips1.hide();
            }

            if (v2 == '') {
                errTips2.show();
                pwd2.focus();
                return false;
            } else {
                errTips2.hide();
            }

            if (v1 != v2) {
                errTips3.show();
                return false;
            } else {
                errTips3.hide();
                return true;
            }

        }

    };

    resetPwd.init();

})(jQuery);