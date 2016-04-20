module.exports = function (grunt) {
    // 构建任务配置
    grunt.initConfig({
        //读取package.json的内容，形成个json数据
        pkg: grunt.file.readJSON('package.json'),

        meta: {
            srcPath: '../src/',
            destPath: 'resource/'
        },

        requirejs: {
            build: {
                options: {
                    appDir: '../src',
                    baseUrl: 'js',
                    dir: './resource',
                    exclude:['html/*.*'],
                    /*optimize: 'uglify2',
                     generateSourceMaps: false,
                     preserveLicenseComments: false,*/
                    // useSourceUrl: true,
                    optimizeCss: 'standard',
                    paths: {
                        jquery: 'lib/jquery.min',
                        underscore:'lib/underscore/underscore',
                        backbone:'lib/backbone-min',
                        zTree:'lib/zTree/js/jquery.ztree.core',
                        json2:'lib/json2',
                        text:'lib/requirejs/text',
                        dropkick:'lib/dropkick/js/dropkick.min',
                        myPagination:'lib/myPagination/jquery.myPagination6.0',
                        validate:'lib/jquery.validate.min',
                        sobox:'lib/sobox/jquery.sobox',
                        echarts:'lib/echarts/echarts.common.min',
                        jqueryUI:'lib/jquery-ui/jquery-ui'
                    },
                    shim: {
                        dropkick: ['jquery'],
                        myPagination: ['jquery'],
                        sobox:['jquery'],
                        zTree:['jquery'],
                        validate:['jquery']
                    },
                    modules: [
                        {name: 'main'},
                        {name: 'modules/frame',exclude: ["jquery",'underscore']},
                        {name: 'modules/addcompany',exclude: ["jquery",'underscore']},
                        {name: 'modules/setting',exclude: ["jquery",'underscore']},
                        {name: 'modules/usermanager',exclude: ["jquery",'underscore']},
                        {name: 'modules/log',exclude: ["jquery",'underscore']},
                        {name: 'modules/statistic',exclude: ["jquery",'underscore']}
                    ],
                    onModuleBundleComplete: function (data) {
                        console.log(data.path,' - OK !')
                    }
                }
            }
        }


        ////压缩js
        //uglify: {
        //    //文件头部输出信息
        //    options: {
        //        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        //    },
        //    my_target: {
        //        files: [
        //            {
        //                src: '<%=meta.srcPath%>/js/main.js',
        //                dest: '<%=meta.destPath%>/js/main.js'
        //            },
        //            {
        //                expand: true,
        //                cwd: '<%=meta.srcPath%>/js/modules',
        //                src: '*.js',
        //                dest: '<%=meta.destPath%>/js/modules'
        //            }
        //        ]
        //    }
        //},
        
        //压缩css
        //cssmin: {
        //    //文件头部输出信息
        //    options: {
        //        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        //        //美化代码
        //        beautify: {
        //            //中文ascii化，非常有用！防止中文乱码的神配置
        //            ascii_only: true
        //        }
        //    },
        //    my_target: {
        //        files: [
        //            {
        //                expand: true,
        //                //相对路径
        //                cwd: '<%=meta.srcPath%>/css',
        //                src: '*.css',
        //                dest: '<%=meta.destPath%>/css'
        //            }
        //        ]
        //    }
        //},

        //复制文件
        //copy:{
        //    my_target:{
        //        files:[
        //            { expand: true, cwd: '<%=meta.srcPath%>images', src: ['**'], dest: '<%=meta.destPath%>images' },
        //            { expand: true, cwd: '<%=meta.srcPath%>template', src: ['**'], dest: '<%=meta.destPath%>template' },
        //            { expand: true, cwd: '<%=meta.srcPath%>js/lib', src: ['**'], dest: '<%=meta.destPath%>js/lib' }
        //        ]
        //    }
        //}

    });
    // 加载指定插件任务
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-cssmin');
    //grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-requirejs'); //requirejs优化

    // 默认执行的任务
    grunt.registerTask('default', ['requirejs']);
};