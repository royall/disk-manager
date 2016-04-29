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
        this.dataAPI = _.extend({}, Common.APIObj, {
            fnName: {
                searchUser: 'user:searchUser',//搜索用户信息
                getDeptUsers: 'user:getDeptUsers'//查询部门用户信息
            }
        });
        this.html = tpl;
        this.selected = [];
        this.selectedObj = {};
        this.searchData = [];
        this.model = {
            pageNo: 1,
            deptPageSize: 100,//获取部门的一页大小
            pageSize: 10,
            deptId: 0,
            deptIds: [0],
            searchPageNo: 1
        };
        this.pageModel = {};
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
                        pageNo: me.pageModel[deptIds] + 1
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
            var liHtml = ['<li data-uid="', data.uid, '" title="', data.name, (data.email ? (" (" + data.email + ")") : ""), '"><span>', data.name, '</span><a href="javascript:;"><i class="i-deletB"></i></a></li>'].join('');
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
            var opts = {
                url: me.dataAPI.getUrlByFnName('searchUser') + '&page=' + me.model.searchPageNo + '&pagesize=' + me.model.pageSize + '&matchrule=like',
                data: {corpId: me.opts.corpId, userId: keyword, email: keyword},
                success: function (data) {
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
                error: function () {
                    Dialog.tips(Lang.common.searchFail);
                }
            };
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
                url: me.dataAPI.getUrlByFnName('getDeptUsers') + '&page=1&pagesize=' + me.model.deptPageSize + '&type=subgrp',
                data: {"corpId": corpId, "deptIds": ["0"]},
                success: function (data) {
                    var tree = data.depts;
                    me.initTree(tree);
                },
                error: function (data) {
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

            me.model.corpId = opts.corpId;
            me.model.deptIds = opts.deptIds;

            var opt = {
                url: me.dataAPI.getUrlByFnName('getDeptUsers') + '&page=' + opts.pageNo + '&pagesize=' + me.model.pageSize + '&type=' + (opts.alluser ? 'alluser' : 'user'),
                data: opts,
                success: function (data) {

                    var users = data.users;
                    if (data.users.length == 0) {
                        return
                    }

                    //获取总页数
                    var totalPage = Math.ceil(data.total / me.model.pageSize);

                    //记录当前页数
                    me.pageModel[opts.deptIds] = data.pageNo;

                    //添加用户节点
                    var zTree = $.fn.zTree.getZTreeObj("deptUser-list"),
                        nodes = zTree.getNodesByParam("deptId", opts.deptIds[0], null),
                        treeNode = nodes[0];
                    zTree.addNodes(treeNode, users);

                    //第一次加载，加入加载更多按钮
                    if (data.pageNo == 1 && opts.treeNode) {
                        $('#' + opts.treeNode.tId).append('<a class="btn-more btn-more-' + opts.deptIds[0] + '" data-deptid="' + opts.deptIds[0] + '" data-corpid="' + opts.corpId + '" href="javascript:;">' + Lang.common.loadMore + '</a>');
                    }

                    var btnMore = $('.btn-more-' + opts.deptIds[0]);
                    btnMore.text(Lang.common.loadMore);
                    //最后一页隐藏加载更多按钮
                    if (data.pageNo >= totalPage) {
                        btnMore.hide();
                    }

                },
                error: function () {

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
                    simpleData: {
                        enable: true,
                        idKey: 'deptId',
                        pIdKey: 'parentId',
                        rootPid: 0
                    }
                },
                async: {
                    type: 'POST',
                    enable: true,
                    url: me.dataAPI.getUrlByFnName('getDeptUsers') + "&type=subgrp",
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

                        var corpId = treeNode.corpId,
                            deptId = treeNode.deptId;
                        //是否点击的用户
                        if (treeNode.uid) {
                            me.addSelected(treeNode);
                        } else {
                            if (treeNode.leaf) {

                                if (me.pageModel[deptId] >= 1) {
                                    return
                                }
                                me.getUser({
                                    treeNode: treeNode,
                                    corpId: corpId,
                                    deptIds: [deptId],
                                    pageNo: 1
                                });
                            } else {
                                this.getZTreeObj(treeId).expandNode(treeNode);
                            }
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
                return v.isParent = !v.leaf
            });

            $.fn.zTree.init($("#deptUser-list"), setting, data);
        }


    };

    return DeptUserBox;
});