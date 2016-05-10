/**
 * Created by Yangz on 2016/4/18.
 */



define([
    'jquery',
    'underscore',
    'backbone',
    "controls/Common",
    "text!../../template/pager.html"
], function ($, _, Backbone, Common, pagerTpl) {

    return Backbone.View.extend({
        initialize: function (opts) {
            //this.model = opts.reqModel;
            this.dataModel = opts.dataModel;
            this.listenTo(this.dataModel, 'change', this.render);
            this.render();
        },
        render: function () {
            var reqData = this.model.toJSON(),
                modelData = this.dataModel.toJSON(),
                pageCount=Math.ceil(modelData.total / modelData.pageSize);
            var data = _.extend({
                total: 0,
                pageIndex: 1,
                pageSize: 10,
                pageCount: pageCount
            }, reqData, modelData);
            var html = Common.tpl2Html(pagerTpl, data);
            this.$el.html(html);
            this.setBtnStatus(data);
        },
        events: {
            'change .pageSize': 'changePageSize',
            'click .i-page-first': 'firstPage',
            'click .i-page-prev': 'prevPage',
            'keyup .pageInput': 'goPage',
            'click .i-page-next': 'nextPage',
            'click .i-page-last': 'lastPage',
            'click .i-page-reload': 'reload'
        },
        changePageSize: function (e) {
            var pageSize = $(e.currentTarget).val();
            this.model.set({
                pageIndex: 1,
                pageSize: ~~pageSize
            });
        },
        firstPage: function () {
            this.model.set({
                pageIndex: 1
            });
        },
        lastPage: function () {
            var listData = this.dataModel.attributes;
            var pageCount = Math.ceil(listData.total / listData.pageSize);
            if(pageCount==0){
                return
            }
            this.model.set({
                pageIndex: pageCount
            });
        },
        prevPage: function () {
            var nowPageIndex = this.model.attributes.pageIndex;
            var pageIndex = nowPageIndex - 1;
            this.model.set({
                pageIndex: pageIndex > 1 ? pageIndex : 1
            });
        },
        nextPage: function () {
            var nowPageIndex = this.model.attributes.pageIndex;
            var listData = this.dataModel.attributes;
            var pageCount = Math.ceil(listData.total / listData.pageSize);
            var pageIndex = nowPageIndex + 1 > pageCount ? pageCount : nowPageIndex + 1;
            if(pageCount==0||pageIndex==0){
                return
            }
            this.model.set({
                pageIndex: pageIndex
            });
        },
        goPage: function (e) {
            if (e.keyCode != 13) {
                return
            }
            var pageIndex = $(e.currentTarget).val();
            var listData = this.dataModel.attributes;
            var pageCount = Math.ceil(listData.total / listData.pageSize);

            if (pageIndex < 1 || pageIndex > pageCount) {
                return
            }
            this.model.set({
                pageIndex: ~~pageIndex
            });
        },
        reload: function () {
            this.getData();
        },
        setBtnStatus:function(pageData){
            var pageIndex=pageData.pageIndex,
                pageCount=pageData.pageCount;

            var $pageFirst=$('.i-page-first'),
                $pagePrev=$('.i-page-prev'),
                $pageNext=$('.i-page-next'),
                $pageLast=$('.i-page-last');

            if(pageIndex<=1){
                $pageFirst.addClass('i-page-first-disabled');
                $pagePrev.addClass('i-page-prev-disabled');
            }

            if(pageIndex>=pageCount){
                $pageNext.addClass('i-page-next-disabled');
                $pageLast.addClass('i-page-last-disabled');
            }



        },
        getData: function () {
            this.model.trigger('change');
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
        }
    });


});