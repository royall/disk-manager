/**
 * Created by Yangz on 2016/3/17.
 */
define([
    'jquery',
    'underscore',
    "controls/Common",
    'controls/Ajax',
    'controls/Dialog',
    "text!../../template/deptUserBox.html",
    'i18n/' + global.language,
    "zTree"
], function ($, _, Common, Ajax, Dialog, tpl, Lang, zTree) {

    var DeptUserBox = function (opts) {
        this.opts = opts;
        this.el = opts.el;
        this.html = tpl;
        this.selected = [];
        this.selectedObj = {};
        this.searchData = [];
        this.model = {
            pageNo: 1,
            deptPageSize: 1000,//获取部门的一页大小
            pageSize: 20,
            deptId: 0,
            deptIds: [0],
            searchPageNo: 1
        };
        this.pageModel = {};
        this.loadedData={};
        this.init();
        return this;
    };

    DeptUserBox.prototype = {
        init: function () {
            this.render();
            this.getTopDpt(this.opts.corpId);
            this.initEvents();
        },
        initEvents: function () {
            var me = this;

            $('#deptUserBox').off('click')
                .on('click', '#clear', function () {
                    me.clear();
                })
                .on('click', '.i-deletB', function () {
                    me.deleteSelected($(this));
                })
                .on('keyup', '.addGInput', function (e) {
                    var v = $(this).val();
                    if (v == '') {
                        $('.deptUser-list').show();
                        $('.search-list').hide();
                    } else {
                        if (e.keyCode == 13) {
                            me.model.searchPageNo = 1;
                            me.search();
                        }
                    }
                })
                .on('click', '#boxBtn-search', function () {
                    me.model.searchPageNo = 1;
                    me.search();
                })
                .on('click', '.search-list ul li', function () {
                    var index = $(this).data('index');
                    var data = me.searchData[index];
                    me.addSelected(data);
                })
                .on('click', '.btn-more', function () {
                    var corpId = $(this).data('corpid'),
                        deptIds = [$(this).data('deptid')];

                    me.getUser({
                        corpId: corpId,
                        deptIds: deptIds,
                        pageNo: me.pageModel[deptIds] + 1,
                        alluser:$(this).data('alluser')===true
                    });
                    $(this).text(Lang.common.loading);
                })
                .on('click', '.btn-search-more', function () {
                    me.model.searchPageNo += 1;
                    me.search();
                    $(this).text(Lang.common.loading);
                });
        },
        render: function () {
            $(this.el).html(_.template(this.html)({Lang: Lang}));
        },
        addSelected: function (data) {
            if (this.selectedObj[data.uid]) {
                return
            }
            this.selected.push(data);
            this.selectedObj[data.uid] = true;
            var liHtml = ['<li data-uid="', data.uid, '" title="', data.name, (data.email ? (" (" + data.email + ")") : ""), '"><span>', data.userId, '</span><a href="javascript:;"><i class="i-deletB"></i></a></li>'].join('');
            $('.addGListRs ul').append(liHtml);
        },
        deleteSelected: function (el) {
            var index = el.parents('li').index();
            var deleteData = this.selected.splice(index, 1)[0];
            this.selectedObj[deleteData.uid] && delete this.selectedObj[deleteData.uid];
            el.parents('li').remove();
        },
        clear: function () {
            this.selectedObj = {};
            this.selected = [];
            $('.addGListRs ul').html('');
        },
        getSelected: function () {
            return this.selected;
        },
        search: function () {
            var keyword = $('.addGInput').val();
            if (keyword == '') {
                return
            }

            var me = this;
            if(me.isLoading){
                return
            }
            var opts = {
                url: Common.getUrlByName('searchUser') + '&page=' + me.model.searchPageNo + '&pagesize=' + me.model.pageSize + '&matchrule=like',
                data: {corpId: me.opts.corpId, userId: keyword, email: keyword},
                success: function (data) {
                    me.isLoading=false;
                    me.model.searchPageNo = data.pageNo;
                    var totalPage = Math.ceil(data.total / me.model.pageSize);

                    var $btnSearchMore = $('.btn-search-more');
                    if (data.pageNo >= totalPage) {
                        $btnSearchMore.hide();
                    } else {
                        $btnSearchMore.text(Lang.common.loadMore).show();
                    }
                    var list = data.users;
                    me.renderList(list);
                },
                fail: function (data) {
                    me.isLoading=false;
                    Dialog.tips(Common.mergeErrMsg(Lang.common.searchFail,data));
                }
            };
            me.isLoading=true;
            Ajax.request(opts);
        },

        renderList: function (data) {

            var me = this;

            if (this.model.searchPageNo == 1) {
                this.searchData = data
            } else {
                this.searchData = this.searchData.concat(data);
            }
            //this.searchData = data;
            var $searchResult = $('.search-result');
            if (data.length == 0) {
                $searchResult.text(Lang.userManager.noResult);
            } else {
                $searchResult.text(Lang.userManager.searchResult + "：");
            }

            $('.search-list').show();
            $('.deptUser-list').hide();

            var $searchList = $('.search-list ul');
            if (this.model.searchPageNo == 1) {
                $searchList.html('');
            }
            var html = [];
            _.each(data, function (value, index) {
                html.push(['<li ', index == 0 ? '' : '', 'data-index="', (me.model.searchPageNo - 1) * me.model.pageSize + index, '"><div class="list-name" title="',value.name,'">', value.userId, '</div><div class="list-email">', value.email, '</div></li>'].join(''));
            });
            $searchList.append(html);
        },
        /**
         * 获取顶级部门
         * @param corpId
         */
        getTopDpt: function (corpId) {
            var me = this;
            var opts = {
                url: Common.getUrlByName('getDeptUsers') + '&page=1&pagesize=' + me.model.deptPageSize + '&type=subgrp',
                data: {"corpId": corpId, "deptIds": ["0"]},
                success: function (data) {
                    var tree = data.depts;

                    data.depts.unshift({
                        corpId: corpId,
                        deptId: 'all',
                        leaf: true,
                        name: "所有用户",
                        parentId: 'all',
                        ucount:1
                    });

                    _.each(data.depts,function(v){
                        v.showName=v.name;
                    });

                    me.initTree(tree);
                },
                fail: function (data) {
                    $('.deptLoad').html(Lang.common.loadFail);
                }
            };
            Ajax.request(opts);
        },

        /**
         * 返回部门下的user(不包括子部门中的)
         * @param opts
         */
        getUser: function (opts) {

            var me = this;

            if(me.isLoading){
                return
            }
            me.model.corpId = opts.corpId;
            me.model.deptIds = opts.deptIds;

            me.loadedData[opts.deptIds[0]]=true;

            var deptId= (opts.deptIds.concat())[0];

            if(opts.deptIds[0]=='all'){
                opts.deptIds[0]=0;

            }

            var opts2=_.extend({},opts);
            delete opts2.treeNode;

            var opt = {
                url: Common.getUrlByName('getDeptUsers') + '&page=' + opts.pageNo + '&pagesize=' + me.model.pageSize + '&type=' + (opts.alluser ? 'alluser' : 'user'),
                data: opts2,
                success: function (data) {
                    me.isLoading=false;

                    var users = data.users;
                    if (data.users.length == 0) {
                        return
                    }

                    _.each(users,function(v){
                        v.showName=v.userId;
                    });


                    //获取总页数
                    var totalPage = Math.ceil(data.total / me.model.pageSize);

                    //记录当前页数
                    me.pageModel[deptId] = data.pageNo;

                    //添加用户节点
                    var zTree = $.fn.zTree.getZTreeObj("deptUser-list"),
                        nodes = zTree.getNodesByParam("deptId", deptId, null),
                        treeNode = nodes[0];
                    zTree.addNodes(treeNode, users);

                    //第一次加载，加入加载更多按钮
                    if (data.pageNo == 1 && opts.treeNode) {
                        $('#' + opts.treeNode.tId).append('<a data-alluser="'+opts.alluser+'" class="btn-more btn-more-' + deptId + '" data-deptid="' + deptId + '" data-corpid="' + opts.corpId + '" href="javascript:;">' + Lang.common.loadMore + '</a>');
                    }

                    var btnMore = $('.btn-more-' + deptId);
                    btnMore.text(Lang.common.loadMore);
                    //最后一页隐藏加载更多按钮
                    if (data.pageNo >= totalPage) {
                        btnMore.remove();
                    }

                },
                fail: function () {
                    me.isLoading=false;
                }
            };
            me.isLoading=true;
            Ajax.request(opt);
        },
        getDept:function(opts){

            var me = this;

            me.model.corpId = opts.corpId;
            me.model.deptIds = opts.deptIds;

            var opts2=_.extend({},opts);
            delete opts2.treeNode;

            var opt = {
                url: Common.getUrlByName('getDeptUsers') + '&page=' + opts.pageNo + '&pagesize=' + me.model.deptPageSize + '&type=subgrp',
                data: opts2,
                success: function (data) {

                    me.loadedData[opts.deptIds[0]]=true;

                    var depts = data.depts;
                    if (depts.length== 0) {
                        return
                    }

                    _.map(depts, function (v) {
                        v.showName=v.name;
                        return v.isParent = !v.leaf||!!v.ucount
                    });

                    //添加部门节点
                    var zTree = $.fn.zTree.getZTreeObj("deptUser-list"),
                        nodes = zTree.getNodesByParam("deptId", opts.deptIds[0], null),
                        treeNode = nodes[0];
                    zTree.addNodes(treeNode, depts);
                },
                fail: function () {
                }
            };
            Ajax.request(opt);

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
                    key:{
                        name: "showName"
                        // title:'name'
                    },
                    simpleData: {
                        enable: true,
                        idKey: 'deptId',
                        pIdKey: 'parentId',
                        rootPid: 0
                    }
                },
                async: {
                    type: 'POST',
                    enable: false,
                    url: Common.getUrlByName('getDeptUsers') + "&type=subgrp",
                    contentType: 'text/plain; charset=UTF-8',
                    deptParam: ["corpId", "deptId"],
                    dataFilter: function (treeId, parentNode, responseData) {
                        if (responseData && responseData.code == "S_OK" && responseData['var']) {
                            _.map(responseData['var'].depts, function (v) {
                                return v.isParent = !v.leaf
                            });
                            return responseData['var'].depts
                        }
                    }
                },

                callback: {
                    onClick: function (event, treeId, treeNode, clickFlag) {

                        //是否点击的用户
                        if (treeNode.uid) {
                            me.addSelected(treeNode);
                        } else {
                            this.getZTreeObj(treeId).expandNode(treeNode,null, null, null, true);
                        }

                    },

                    onExpand:function(event,treeId, treeNode){

                        var moreBtn=$('#'+treeNode.tId).find('.btn-more');
                        if(moreBtn.length){
                            moreBtn.show();
                        }
                        
                        var corpId = treeNode.corpId,
                            deptId = treeNode.deptId,
                            userCount=treeNode.ucount;

                        if(me.loadedData[deptId]){
                            return
                        }

                        if(!treeNode.leaf){
                            me.getDept({
                                treeNode: treeNode,
                                corpId: corpId,
                                deptIds: [deptId],
                                pageNo: 1
                            });
                        }

                        if(userCount){
                            me.getUser({
                                treeNode: treeNode,
                                corpId: corpId,
                                deptIds: [deptId],
                                pageNo: 1,
                                alluser:treeNode.deptId==='all'
                            });
                        }

                    },
                    beforeCollapse:function (treeId, treeNode) {
                        var moreBtn=$('#'+treeNode.tId).find('.btn-more');
                        if(moreBtn.length){
                            moreBtn.hide();
                        }
                    }
                }
            };


            function addDiyDom(treeId, treeNode) {

                var nodeDom = $("#" + treeNode.tId);
                //是否是用户节点
                if (treeNode.uid) {
                    nodeDom.addClass('isUser');
                }

                var spaceWidth = 15;
                var switchObj = $("#" + treeNode.tId + "_switch"),
                    icoObj = $("#" + treeNode.tId + "_ico");
                switchObj.remove();
                icoObj.before(switchObj);

                var spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level) + "px'></span>";
                switchObj.before(spaceStr);

            }

            _.map(data, function (v) {
                return v.isParent = !v.leaf||v.ucount
            });

            $.fn.zTree.init($("#deptUser-list"), setting, data);
        }


    };

    return DeptUserBox;
});