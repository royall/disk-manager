/**
 * Created by Yangz on 2016/3/3.
 */


define(['jquery', 'underscore'], function ($, _) {

    var List = function (option) {
        this.option = option;
        this.data = this.option.data;
        this.option.operate && (this.operateList = this.option.operate.list);
        this.Fn = {};
        var me = this;

        if (this.operateList && this.operateList.length) {
            _.each(this.operateList, function (data) {
                me.Fn[data.action] = data.onClick;
            });
        }
        _.each(this.option.columns, function (data) {
            if (data.action) {
                me.Fn[data.action] = data.onClick;
            }
        });

        this.init();
        this.html = [];
        return this;
    };

    List.prototype = {
        init: function () {
            this.render();
            this.initEvents();
            this.option.hasCheckBtn && this.initCheck();
        },
        getTitleHtml: function () {
            var me = this;
            var html = ['<tr>'];

            if (this.option.hasCheckBtn) {
                html.push(['<th width="25" style="padding-left:20px;"><input class="checkAll" type="checkbox"></th>'].join(''));
            }
            _.each(this.option.columns, function (data) {
                html.push(['<th scope="col"', (data.titleStyle ? (' style="' + data.titleStyle + '"') : ''), data.titleAttr, '>', data.columnName, '</th>'].join(''));
            });
            if (me.option.operate && me.option.operate.list && me.option.operate.list.length) {
                html.push(['<th scope="col"', (me.option.operate.titleStyle ? (' style="' + me.option.operate.titleStyle + '"') : ''), me.option.operate.titleAttr, '>', me.option.operate.columnName, '</th>'].join(''));
            }

            html.push('</tr>');
            return html.join('');
        },
        getListHtml: function () {
            var me = this;
            var listHtml = [];

            if (!me.data.length) {
                var n = me.option.columns.length + (me.option.hasCheckBtn ? 1 : 0) + (me.option.operate ? 1 : 0);
                return '<tr class="no-data"><td colspan="' + n + '" align="center"><div class="tipsNoDate"><h5><i class="i-noDate"></i></h5><h4>暂无数据</h4></div></td></tr>';
            }

            _.each(me.data, function (listData) {

                var rowClass;

                me.option.rowClass && typeof me.option.rowClass == 'function' && (rowClass = me.option.rowClass(listData));

                var html = ['<tr', (rowClass ? ' class="' + rowClass + '"' : ''), ' data-key="', listData[me.option.key], '">'];

                if (me.option.hasCheckBtn) {
                    html.push(['<td style="padding-left:20px;"><input type="checkbox" class="list-checkbox" value="', listData[me.option.key], '"></td>'].join(''));
                }
                _.each(me.option.columns, function (columnData) {
                    var value = listData[columnData.columnId];
                    var tdHtml = columnData.callback(value,listData) || value || '';
                    html.push(['<td data-columnId="', columnData.columnId, '">', tdHtml, '</td>'].join(''));
                });
                if (me.option.operate && me.option.operate.list && me.option.operate.list.length) {
                    html.push('<td>');
                    _.each(me.option.operate.list, function (operateData) {
                        html.push(['<a href="javascript:;" class="', operateData.className, '" data-action="', operateData.action, '">', operateData.name, '</a>'].join(''));
                    });
                    html.push('</td>');
                }


                html.push('</tr>');
                listHtml.push(html.join(''));
            });
            return listHtml.join('');
        },
        render: function () {
            var titleHtml = this.getTitleHtml(),
                listHtml = this.getListHtml();
            var html = ['<div class="tableBox"><table width="100%" class="tableList"><tbody>', titleHtml, listHtml, '</tbody></table></div>'];
            $(this.option.container).html(html.join(''));
        },
        initEvents: function () {
            var me = this;
            $(this.option.container).off('click.list').on('click.list', function (e) {
                var $this = $(e.target);
                var cellEl = $this.parents('td').length ? $this.parents('td') : $this;//当前点击单元格
                var rowEl = $this.parents('tr');//当前点击列
                var key = rowEl.data('key');
                var action = $this.data('action');
                if (action) {
                    var rowData = _.find(me.data, function (v) {
                        return v[me.option.key] == key;
                    });
                    me.Fn[action] && (typeof me.Fn[action] == 'function') && me.Fn[action](rowData, cellEl, rowEl);
                }
            });
        },
        getSelected: function () {
            var me = this;
            var selected = [];
            $(this.option.container).find('.list-checkbox:checked').each(function () {
                var key = $(this).val();
                var data = _.find(me.data, function (v) {
                    return v[me.option.key] == key;
                });
                selected.push(data);
                //selected.push(key);
            });
            return selected;
        },
        initCheck: function () {
            var me = this;
            this.$container = $(this.option.container);
            this.$listCheckbox = this.$container.find('.list-checkbox');
            this.$checkAll = $(this.option.container).find('.checkAll');

            this.$checkAll.off('change.list').on('change.list', function () {
                var check = $(this).prop('checked');
                me.$listCheckbox.prop('checked', check);
            });

            this.$listCheckbox.off('change.list').on('change.list', function () {
                var len = me.$container.find('.list-checkbox:checked').length;
                me.$checkAll.prop('checked', me.data.length == len);
            });
        },
        destroyEvents: function () {
            this.$checkAll && this.$checkAll.off('change.list');
            this.$listCheckbox && this.$listCheckbox.off('change.list');
        },
        setData: function (data) {
            this.destroyEvents();
            this.data = data||[];
            this.init();
        }
    };

    return List;
});