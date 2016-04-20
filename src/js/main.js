require.config({
    baseUrl: './resource/js',
    //baseUrl: '../js',
    shim: {
        dropkick: ['jquery'],
        myPagination: ['jquery'],
        sobox: ['jquery'],
        zTree: ['jquery'],
        validate: ['jquery']
    },
    paths: {
        jquery: 'lib/jquery.min',
        underscore: 'lib/underscore/underscore',
        backbone: 'lib/backbone-min',
        zTree: 'lib/zTree/js/jquery.ztree.core',
        json2: 'lib/json2',
        text: 'lib/requirejs/text',
        dropkick: 'lib/dropkick/js/dropkick.min',
        myPagination: 'lib/myPagination/jquery.myPagination6.0',
        validate: 'lib/jquery.validate.min',
        sobox: 'lib/sobox/jquery.sobox',
        echarts: 'lib/echarts/echarts.common.min',
        jqueryUI: 'lib/jquery-ui/jquery-ui'
        //shine:'lib/echarts/shine'
    }
});

var modules = {
    addCompany: 'addcompany',
    setting: 'setting',
    userManager: 'usermanager',
    log: 'log',
    statistic: 'statistic'
};

global.language = global.language || 'zh_CN';

//根据文件名加载对应的js文件模块
var moduleName = location.href;
moduleName = moduleName.substr(moduleName.lastIndexOf('/') + 1).split('.')[0];

require(["jquery", 'underscore', 'modules/frame'], function ($, _, frame) {

    $(document.body).addClass(moduleName);
    if (moduleName != modules.addCompany) {
        frame.init();
    }

    require(['modules/' + moduleName], function (module) {
        module.init();
    });

});