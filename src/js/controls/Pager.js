/**
 * Created by Yangz on 2016/3/8.
 */


define(['jquery', "myPagination"], function ($, myPagination) {


    var Pager = function (option) {
        this.option = option;
        this.el = option.el;//分页控件容器
        this.pageNo = option.pageNo;//当前页
        this.pageSize = option.pageSize;//每页数据条数
        this.total = option.total;//数据总条数
        this.onclick = option.onclick;//点击分页回调
        this.cssStyle = 'manu';//样式名

        this.init();
    };

    Pager.prototype = {
        getPageCount: function () {
            return Math.ceil(this.total / this.pageSize);
        },
        init: function () {
            var me = this;
            $(this.el).myPagination({
                currPage: me.pageNo,
                pageCount: me.getPageCount(),
                pageNumber: 10,
                cssStyle: me.cssStyle,
                ajax: {
                    on: false,
                    onClick: me.onclick
                }
                //panel: {
                //    tipInfo_on: true,
                //    tipInfo: '  跳{input}/{sumPage}页',
                //    tipInfo_css: {
                //        width: '25px',
                //        height: "20px",
                //        border: "2px solid #f0f0f0",
                //        padding: "0 0 0 5px",
                //        margin: "0 5px 0 5px",
                //        color: "#48b9ef"
                //    }
                //}
            });

        }
    };

    return Pager;
});