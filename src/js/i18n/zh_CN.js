/**
 * Created by Yangz on 2016/3/25.
 */


define(function () {
    return {

        //公用
        common: {
            invalidFn: '无效请求方法名',
            weak: '弱',
            normal: '中',
            strong: '强',
            operate: '操作',
            add: '添加',
            addSuc: '添加成功',
            addFail: '添加失败',
            'del': '删除',
            delSuc: '删除成功',
            delFail: '删除失败',
            edit: '编辑',
            editSuc: '修改成功',
            editFail: '修改失败',
            setSuc: '设置成功',
            setFail: '设置失败',
            searchFail: '搜索失败',
            out: '移除',
            setting: '设置',
            tips: '提示',
            loading: '数据加载中，请稍候...',
            loadMore: '加载更多',
            loadFail: '数据加载失败,请重试！',
            fetchFail:'数据拉取失败！'
        },

        //头部
        head: {
            backToUser: '返回用户平台',
            exit: '退出',
            companyDisk: '企业网盘',
            managerCenter: '管理中心'
        },
        sideBar: {
            diskSetting: '网盘设置',
            userManager: '用户管理',
            logManager: '日志管理',
            statisticManager: '统计管理'
        },
        //企业开户
        addCompany: {
            typeAccount: '请输入帐号',
            addCompanySuc: '企业添加成功',
            addCompanyFail: '企业添加失败'
        },

        //网盘设置
        setting: {
            companyInfo: '企业信息',
            companyName: '企业名称',
            domain: '域名',
            timeout: '过期时间',
            space: '空间',
            userLimit: '用户数',
            status: '企业状态',
            account: '账号',
            password: '密码',
            confirmPwd: '确认密码',
            typeName: '请输入企业名称',
            typeLegalName: '请输入正确的企业名称',
            typeDomain: '请输入域名',
            typeSpace: '请输入空间大小',
            typeUserLimit: '请输入用户数',
            typeAccount: '请输入账号',
            typeLegalAccount: '请输入正确的账号',
            typePwd: '请输入密码',
            typePwd2: '请再次输入密码',
            typeConfirmPwd: '请再次输入密码',
            minPsw: '密码长度至少{0}位',
            maxPws: '请输入最多{0}位字符的密码',
            legalPsw: '请输入包含至少2种组合的密码',
            pswNotEqual: '两次输入密码不一致',
            typeNumber: '请输入数字',
            normal: '正常',
            locked: '锁定',
            canceled: '注销',
            userUnit: '人',
            month: '个月',
            year: '年',
            forever: '永久',
            typeKeyword: '请输入搜索关键字',
            selectCompany: '请选择要暂停的企业',
            userManage: '用户管理',
            listFail: '企业列表拉取失败',
            editStatusSuc: '修改企业状态成功',
            editStatusFail: '修改企业状态失败',
            accountExist: '帐号已存在',
            addComSuc: '企业添加成功',
            addComFail: '企业添加失败',
            editComSuc: '企业信息修改成功',
            editComFail: '企业信息修改失败',
            getComInfoFail: '获取企业信息失败',
            getSafeInfoFail: '获取安全设置失败'
        },

        //用户管理
        userManager: {
            userName: '用户名',
            depart: '所属部门',
            ungrouped: '未分组',
            spChar: '必须包含特殊字符,如!@#$%^&*.',
            caps: '必须包含大写字母',
            weak: '禁止使用弱密码，如一种字符或连续字符',
            allUser: '所有用户',
            userList: '成员列表',
            getDeptFail: '获取部门数据失败',
            getUserInfoFail: '获取用户数据失败',
            name: '姓名',
            typeName: '请输入姓名',
            userSpace: '个人空间',
            typeUserName: '请输入用户名',
            emailNotCorrect: '请输入正确的邮箱格式',
            addUserSuc: '用户添加成功',
            addUserFail: '用户添加失败',
            addUser: '创建用户',
            addDeptUser: '添加部门用户',
            selectUser: '请选择要添加的用户',
            addDeptUserSuc: '添加部门用户成功',
            addDeptUserFail: '添加部门用户失败',
            updateUserSuc: '用户信息更新成功',
            updateUserFail: '用户信息更新失败',
            userSetting: '用户设置',
            unactived: '该用户未激活',
            cantDelAdmin: '该用户为管理员，不能删除',
            confirmDel: '确定删除？',
            delUserSuc: '用户删除成功',
            delUserFail: '用户删除失败',
            selectDelUser: '请选择要删除的用户',
            outUserSuc: '移除用户成功',
            outUserFail: '移除用户失败',
            outConfirm: '确定要将该用户移除本部门吗？',
            outConfirms: '确定要将这些用户移除本部门吗？',
            selectOutUser: '请选择要从该部门移除的用户',
            importUser: '批量导入用户',
            selectFile: '请选择要上传的文件',
            uploading: '文件上传中，请稍候……',
            fileTips: '请选择格式为{0}的文件',
            importBtn: '导入',
            uploadTips: '文件上传成功，请稍后刷新页面查看部门用户数据！',
            uploadFail: '文件上传失败，请重试！',
            deptName: '部门名称',
            typeDeptName: '请输入部门名称',
            addDept: '新建部门',
            addDeptSuc: '新建部门成功',
            addDeptFail: '新建部门失败',
            editDept: '修改部门',
            editDeptSuc: '修改部门成功',
            editDeptFail: '修改部门失败',
            getDeptInfoFail: '获取部门详细信息失败',
            delDeptConfirm: '您确定要删除本部门吗？',
            delDeptSuc: '部门删除成功',
            delDeptFail: '部门删除失败',
            searchTips: '输入用户名、邮箱搜索',
            searchResult: '查找到',
            noResult: '没有符合条件的用户！',
            clearAll: '清空所有用户',
            user: '用户',
            lessThan: '不能超过企业总空间大小',
            email: '邮箱',
            typeEmail: '请输入邮箱',
            mobile: '手机号',
            typeMobile: '请输入手机号',
            modifyPsw: '首次登录修改密码',
            downFileTpl: '下载模板文件',
            downTpl: '下载模板',
            fileType: 'xls文件',
            editTpl: '编辑模板文件',
            selectTplFile: '选择编辑好的文件',
            selectTplFile2: '选择文件',
            deptSpace: '部门空间',
            deptUserLimit: '部门人数上限',
            typeDeptUserLimit: '请输入部门人数上限',
            remark: '备注',
            accountSetting: '用户设置',
            userPsw: '用户密码',
            usedSpace: '当前已用空间',
            all: '共'

        },

        //日志管理
        log: {

        },

        //统计管理
        statistic: {}


    }
});