define(function () {
    return {
        url: 'admin.do',
        fnName: {
            addCorp: 'corp:addCorp',//添加企业
            updateCorp: 'corp:updateCorp',//修改企业
            getCorpDetail: 'corp:getCorpDetail',//企业详情
            listCorp: 'corp:listCorp',//企业列表
            updateCorpStatus: 'corp:updateCorpStatus',//批量更新企业状态
            updateAccountRule: 'account:updateAccountRule',//账户安全设置
            getAccountRule: 'account:getAccountRule',//获取账户密码安全设置项
            getCorpService: 'corp:getCorpService',//获取常规设置
            updateCorpService: 'corp:updateCorpService',//更新常规设置
            searchUser: 'user:searchUser',//搜索用户信息
            addUser: 'user:addUser',//添加用户
            updateUser: 'user:updateUser',//修改用户
            delUser: 'user:delUser',//删除用户
            batchDelUser: 'user:batchDelUser',//批量删除用户
            getUser: 'user:getUser',//查询用户信息
            getDeptUsers: 'user:getDeptUsers',//查询部门用户信息
            removeUserDept: 'user:removeUserDept', //用户移出部门接口
            addDeptUser: 'user:addDeptUser',//
            manageDeptMember: 'user:manageDeptMember',
            addDept: 'dept:addDept', //新增部门
            updateDept: 'dept:updateDept', //更新部门
            getDeptDetail: 'dept:getDeptDetail', //部门详情
            delDept: 'dept:delDept', //删除部门
            uploadTemplate: 'upload:uploadTemplate',
            getBatchImpDetail: 'user:getBatchImpDetail',
            getDeptUnUsed: 'dept:getDeptUnUsed',
            getCorpMsgSet: 'corp:getCorpMsgSet',//获取消息盒子设置
            updateCorpMsgSet: 'corp:updateCorpMsgSet',//更新消息盒子设置
            searchLog: 'log:searchLog',
            getFileCount: 'count:getFileCount',
            getFileOperate: 'count:getFileOperate',
            getUseStorage: 'count:getUseStorage',
            getUseStorageDetail: 'count:getUseStorageDetail',
            getPersonStorage: 'user:getPersonStorage',
            getTeamStorage: 'count:getTeamStorage',
            getGroupStorage: 'count:getGroupStorage',
            uploadLogo:'upload:uploadLogo',//上传logo
            getCorpLogo:'corp:getCorpLogo'//获取logo
        }
    }

});
