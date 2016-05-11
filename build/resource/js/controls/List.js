define(["jquery","underscore"],function(e,t){var n=function(e){this.option=e,this.data=this.option.data,this.option.operate&&(this.operateList=this.option.operate.list),this.Fn={};var n=this;return this.operateList&&this.operateList.length&&t.each(this.operateList,function(e){n.Fn[e.action]=e.onClick}),t.each(this.option.columns,function(e){e.action&&(n.Fn[e.action]=e.onClick)}),this.init(),this.html=[],this};return n.prototype={init:function(){this.render(),this.initEvents(),this.option.hasCheckBtn&&this.initCheck()},getTitleHtml:function(){var e=this,n=["<tr>"];return this.option.hasCheckBtn&&n.push(['<th width="25" style="padding-left:20px;"><input class="checkAll" type="checkbox"></th>'].join("")),t.each(this.option.columns,function(e){n.push(['<th scope="col"',e.titleStyle?' style="'+e.titleStyle+'"':"",e.titleAttr,">",e.columnName,"</th>"].join(""))}),e.option.operate&&e.option.operate.list&&e.option.operate.list.length&&n.push(['<th scope="col"',e.option.operate.titleStyle?' style="'+e.option.operate.titleStyle+'"':"",e.option.operate.titleAttr,">",e.option.operate.columnName,"</th>"].join("")),n.push("</tr>"),n.join("")},getListHtml:function(){var e=this,n=[];if(!e.data.length){var r=e.option.columns.length+(e.option.hasCheckBtn?1:0)+(e.option.operate?1:0);return'<tr class="no-data"><td colspan="'+r+'" align="center"><div class="tipsNoDate"><h5><i class="i-noDate"></i></h5><h4>暂无数据</h4></div></td></tr>'}return t.each(e.data,function(r){var i;e.option.rowClass&&typeof e.option.rowClass=="function"&&(i=e.option.rowClass(r));var s=["<tr",i?' class="'+i+'"':"",' data-key="',r[e.option.key],'">'];e.option.hasCheckBtn&&s.push(['<td style="padding-left:20px;"><input type="checkbox" class="list-checkbox" value="',r[e.option.key],'"></td>'].join("")),t.each(e.option.columns,function(e){var t=r[e.columnId],n=e.callback(t,r)||t||"";s.push(['<td data-columnId="',e.columnId,'">',n,"</td>"].join(""))}),e.option.operate&&e.option.operate.list&&e.option.operate.list.length&&(s.push("<td>"),t.each(e.option.operate.list,function(e){s.push(['<a href="javascript:;" class="',e.className,'" data-action="',e.action,'">',e.name,"</a>"].join(""))}),s.push("</td>")),s.push("</tr>"),n.push(s.join(""))}),n.join("")},render:function(){var t=this.getTitleHtml(),n=this.getListHtml(),r=['<div class="tableBox"><table width="100%" class="tableList"><tbody>',t,n,"</tbody></table></div>"];e(this.option.container).html(r.join(""))},initEvents:function(){var n=this;e(this.option.container).off("click.list").on("click.list",function(r){var i=e(r.target),s=i.parents("td").length?i.parents("td"):i,o=i.parents("tr"),u=o.data("key"),a=i.data("action");if(a){var f=t.find(n.data,function(e){return e[n.option.key]==u});n.Fn[a]&&typeof n.Fn[a]=="function"&&n.Fn[a](f,s,o)}})},getSelected:function(){var n=this,r=[];return e(this.option.container).find(".list-checkbox:checked").each(function(){var i=e(this).val(),s=t.find(n.data,function(e){return e[n.option.key]==i});r.push(s)}),r},initCheck:function(){var t=this;this.$container=e(this.option.container),this.$listCheckbox=this.$container.find(".list-checkbox"),this.$checkAll=e(this.option.container).find(".checkAll"),this.$checkAll.off("change.list").on("change.list",function(){var n=e(this).prop("checked");t.$listCheckbox.prop("checked",n)}),this.$listCheckbox.off("change.list").on("change.list",function(){var e=t.$container.find(".list-checkbox:checked").length;t.$checkAll.prop("checked",t.data.length==e)})},destroyEvents:function(){this.$checkAll&&this.$checkAll.off("change.list"),this.$listCheckbox&&this.$listCheckbox.off("change.list")},setData:function(e){this.destroyEvents(),this.data=e,this.init()}},n});