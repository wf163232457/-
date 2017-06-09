(function($){
	var _templates = '';
	var _wins = function(os){
		return os.context.ownerDocument !== null ? os.context.ownerDocument.defaultView.self : os.context.defaultView.self;
	};
	var _btm = function($el,_win){
		return $(_win).height()-$el.height()-($el.offset().top-$(_win.document).scrollTop())-4;
	};
	var _optionTree = function(list,parent_id,select_id,level,arr){
		var i = 0,j = 0,html = '',is_null = false;
		if(typeof(level) == 'undefined') level = 0;
		if(typeof(parent_id) == 'undefined') parent_id = 0;
		if(typeof(select_id) == 'undefined') select_id = '';
		if(typeof(arr) == 'undefined') arr = new Array();
		$.each(list,function(k,v){
			if(v.parent_id == '') is_null = true;
		});
		if(parent_id == 0 && is_null) parent_id = '';
		$.each(list,function(k,v){
			if(parent_id == '') t = v.parent_id; else t = parseInt(v.parent_id);
			if(t == parent_id) i++;
		});
		$.each(list,function(k,v){
			if(parent_id == '') t = v.parent_id; else t = parseInt(v.parent_id);
			if(t == parent_id){
				j++;
				var _tempHasChildren = false;
				$.each(list,function(k2,v2){
					if(v2.parent_id == v.id){
						_tempHasChildren = true;
						return false;
					}
				});
				if(v._hide && !_tempHasChildren) return true;
				html += '<li style="position:relative;" level="'+level+'" data_id="'+v.id+'">';
				//if(t != 0){
					//if(level >= 2){
						for(var n = 0; n < level; n++){
							temps = '<label style="width:18px;display:inline-block;">&nbsp;&nbsp;&nbsp;&nbsp;</label>';
							if(!arr[n]) temps = '<img style="vertical-align:middle" src="'+_templates+'images/line.gif">';
							html += temps;
						}
					//}
					var _left = (level < 0 ? 0 : level)*18+3;
					if(_tempHasChildren) html += '<img class="hitarea collapsable-hitarea" style="position:absolute;left:'
						+_left+'px;top:5px;background:#fff;cursor:pointer;" src="'+_templates+'images/minus.gif">';
					if(i > j){
						arr[level] = false;
						html += '<img style="vertical-align:middle" src="'+_templates+'images/join.gif">';
					}else if(i == j){
						arr[level] = true;
						html += '<img style="vertical-align:middle" src="'+_templates+'images/joinbottom.gif">';
					}
				//}
				html += '<input type="checkbox" value="'+v.id+'"'
					+(select_id == v.id ? ' checked="checked"' : '')
					+(v._hide ? ' disabled="disabled"' : '')
					+' />';
				html += '<a href="javascript:;">'+v.name+'</a></li>';
				if(v.id != 0) html += _optionTree(list,v.id,select_id,level+1,arr);
			}
		});
		return html;
	};
	var addTreeEvent = function(ot,$el,_win){
		var a = this;
		ot.find('.hitarea').off('click').on('click',function(e){
			var _o = $(this).parents('[level]'),
				_level = parseInt(_o.attr('level'))+1;
			if($(this).hasClass('collapsable-hitarea')){
				while(parseInt(_o.next().attr('level')) >= _level){
					_o = _o.next();
					_o.hide();
				}
				$(this).removeClass('collapsable-hitarea')
					.addClass('expandable-hitarea')
					.attr('src',_templates+'images/plus.gif');
			}else if($(this).hasClass('expandable-hitarea')){
				var _hide = false,
					_tmp_level = _level;
				while(parseInt(_o.next().attr('level')) >= _level){
					_o = _o.next();
					if((_o.find('.collapsable-hitarea').length > 0 && _tmp_level == _o.attr('level')) || _o.attr('level') == _level){
						_hide = false;
					}
					if(!_hide) _o.show();
					if(_o.find('.expandable-hitarea').length > 0){
						_tmp_level = _o.attr('level');
						_hide = true;
					}
				}
				$(this).removeClass('expandable-hitarea')
					.addClass('collapsable-hitarea')
					.attr('src',_templates+'images/minus.gif');
			}

			if(ot.is(':visible') && typeof $el === 'object'){
				var hgt = 0;
				ot.find('li:visible').each(function(i,n){
					hgt += $(n).outerHeight();
				});
				if(ot.offset().top < $el.offset().top){
					var maxHeight = $el.offset().top;
					if(maxHeight < hgt) hgt = maxHeight;
					ot.height(hgt).css('top',(maxHeight-hgt-2)+'px');
				}else{
					var maxHeight = _btm($el,_win);
					if(maxHeight < hgt) hgt = maxHeight;
					ot.height(hgt);
				}
			}
			e.stopPropagation();
		});
		ot.find('li input[type="checkbox"]').off('click').on('click',function(e){
			var _self = $(this).prop('checked'),
				_o = $(this).parents('[level]'),
				_level = parseInt(_o.attr('level'))+1;
			_o.toggleClass('hover',_self);
			while(parseInt(_o.next().attr('level')) >= _level){
				_o = _o.next();
				_o.toggleClass('hover',_self).find('[type="checkbox"]').attr('checked',_self);
			}
			var _id = ot.attr('id'),
				_Id = _id.substring(0,_id.indexOf('_treeview')),
				_ov = $('#'+_Id),
				_os = $('#'+_Id+'_show'),
				_val = [],
				_text = [];
			ot.find('[type="checkbox"]').each(function(i,n){
				if($(n).prop('checked')){
					_val.push($(n).val());
					_text.push($.trim($(n).parents('li').text()));
				}
			});
			_ov.val(_val.join(','));
			if(_text.length > 0) _os.val(_text.join(', ')).attr('title',_text.join(', '));
			else _os.val(_os.attr('default')).attr('title',_os.attr('default'));
			e.stopPropagation();
		});
		ot.find('li').off('click mouseover mouseout').on('click',function(e){
			var _input = $(this).find('input');
			_input[0].click();
			e.stopPropagation();
		}).css('cursor','pointer').hover(
			function(){
				$(this).css('background','#eee');
			},function(){
				$(this).css('background','#fff');
			}
		);
	};
	var methods = {
		init: function(options){
			return this.each(function(){
				var $this = $(this);
				var settings = $this.data('selectTreeview');
				var defaults = {
					type: 0, //0单选1多选
					url: '', //ajax 源
					data: [],//数据源
					collapse: false,
					afterFun:function(){},//加载完执行
					defaultValue: '请选择',//默认选项文字
					loaddingValue: '加载中...',//加载中
					nobodyValue: '无',//默认没有
					selectIds: ''//被选中项
				};
				if(typeof settings === 'undefined'){
					settings = $.extend({},defaults);
				}else{
					settings = $.extend({},defaults,settings);
				}
				$.extend(settings,options);

				var url = settings.url,
					os = $this,
					v = settings.selectIds,
					wh = settings.where,
					fun = settings.afterFun,
					type = settings.type,
					$children = os.children();
				var _name = settings.defaultValue,
					_id = os.attr('id')+'_treeview',
					_type = typeof type === 'undefined' ? 0 : type,
					_win = _wins(os),
					_frame = _win !== window.parent;
				if(os.val() !== null && os.val() !== '') v = os.val();
				if(os.prev().is('span.select')){
					_name = os.prev().text();
					os.prev().remove();
				}
				var el = '<input where="no" type="text"',
					elId = os.attr('id')+'_show',
					elName = os.attr('name')+'_show',
					Id = os.attr('id'),
					Name = os.attr('name');
				$.each(os[0].attributes,function(i,n){
					if(n.name == 'name') el += ' name="'+elName+'"';
					else if(n.name == 'id') el += ' id="'+elId+'"';
					else el += ' '+n.name+'="'+n.value+'"';
				});
				el += ' />';
				var $el = $(el);
				os.after($el);
				$el.css({
					'border-right':'0',
					'margin-left':os.css('margin-left'),
					'width':(os.width()-24>0?os.width()-24:100)+'px',
					'cursor':'pointer',
					'font-family':'sans-serif'
				});
				var _margin = os.css('margin-top')+' '+os.css('margin-right')+' '+os.css('margin-bottom')+' 0',
					_height = $el.height(),
					_border = $el.css('border'),
					_border_color = $el.css('borderTopColor');
				var btn = '<input type="button" style="width:24px;height:'+(_height+2)+'px;border:'+_border+';margin:'+_margin+';background:url('+_templates+'images/arrowdown.gif) center no-repeat;cursor:pointer;" />';
				var $btn = $(btn);
				$el.after($btn);
				$el.hover(function(){
					$el.addClass('input_hover');
					$btn.addClass('input_hover');
				},function(){
					$el.removeClass('input_hover');
					$btn.removeClass('input_hover');
				});
				$btn.hover(function(){
					$el.addClass('input_hover');
					$btn.addClass('input_hover');
				},function(){
					$el.removeClass('input_hover');
					$btn.removeClass('input_hover');
				});
				os.remove();
				_win.$('#'+_id).remove();
				$el.val(_name)
				   .attr('title',_name)
				   .attr('default',_name)
				   .attr('readonly',true)
				   .before('<input type="hidden" name="'+Id+'" id="'+Name+'" />')
				   .off('keydown keypress').on('keydown keypress',function(e){
						return !(e.keyCode==8);
				   });
				var slideUp = function(){
					if(_win.$('#'+_id).length > 0){
						var top = $el.offset().top;
						var animates = {};
						animates.height = 0;
						if(_win.$('#'+_id).offset().top < top) animates.top = top;
						_win.$('#'+_id).animate(animates,10,function(){
							_win.$('#'+_id).hide();
						});
					}
				};
				var slideDown = function(btm){
					if(_win.$('#'+_id).length > 0){
						_win.$('#'+_id).show();
						var hgt = 0;
						_win.$('#'+_id).find('li:visible').each(function(i,n){
							hgt += $(n).outerHeight();
						});
						var x = $el.offset();
						_win.$('#'+_id).css({ 'left':x.left+'px' });
						var top = x.top;
						var animates = {};
						if(btm < top){
							_win.$('#'+_id).css({ 'top':(top-2)+'px' });
							hgt = top>hgt?hgt:top;
							animates.top = top-hgt-2;
							animates.height = hgt;
						}else{
							_win.$('#'+_id).css({ 'top':(top+_height+2)+'px' });
							hgt = btm>hgt?hgt:btm;
							animates.height = hgt;
						}
						_win.$('#'+_id).animate(animates,10,function(){
							var $contain = _win.$('#'+_id),
								$checked = $contain.find('.hover:first');
							if($checked.length > 0) $contain.scrollTop($checked.offset().top-$contain.offset().top+$contain.scrollTop());
							$el.parents('.ui-dialog-content, body').one('scroll',function(){
								if(_win.$('#'+_id).height() > 0) _win.$('#'+_id).height(0).hide();
							});
						});
					}
				};
				var obtm = function(){
					return _btm($el,_win);
				};
				var body = function(){
					if(_frame) _win.$('body').one('mousedown',slideUp);
					window.parent.$('body').one('mousedown',slideUp);
					//var Frames = window.parent.document.getElementsByTagName('iframe');
					//for(var i = 0; i<Frames.length; i++) if(!Frames[i].id) $(window.parent.frames[i].document.body).one('click',slideUp);
				};
				var option = function(e){
					if(_win.$('#'+_id).length !== 0){
						var //x = $el.offset(),
							btm = obtm();
						//_win.$('#'+_id).css({ 'left':x.left+'px' });
						if(_win.$('#'+_id).height() === 0){
							slideDown(btm);
						}else{
							slideUp();
						}
					}else{
						var optionFill = function(){
							$el.val(_name)
							   .attr('title',_name);
							var x = $el.offset(),
								btm = obtm(),
								mixWidth = $el.outerWidth()+$btn.outerWidth()-2,
								data = settings.data;
							if(_win.$('#'+_id).length === 0){
								var optionHtml = '<li style="position:relative;" level="0" data_id="">'+_name+'</li>';
								if(data.length > 0){
									if(_type === 1){
										optionHtml+= _optionTree(data);
									}else{
										optionHtml = _optionTree(data);
									}
								}
								_win.$('body').append('<ul id="'+_id+'" class="treeview" \
										style="z-index:101;display:none;height:0;overflow-x:auto;position:absolute;left:'
										+(x.left)+'px;top:'+(x.top+_height+2)+'px;min-width:'+mixWidth+'px;background:#fff;border:1px solid '+_border_color+';">'
										+optionHtml+'</ul>');
								_win.$('#'+_id).css({ 'font-family':'sans-serif' }).on('mousedown',function(e2){ e2.stopPropagation(); });
								addTreeEvent(_win.$('#'+_id),$el,_win);
								if(settings.collapse) _win.$('#'+_id).find('.hitarea').trigger('click');
								if(typeof v !== 'undefined' && v !== null && v !== ''){
									
									
									
									/*var $checked = _win.$('#'+_id).find('[data_id="'+v+'"]');
									if($checked.find('[type="checkbox"]').length > 0){
										$checked.find('[type="checkbox"]').attr('checked',true); //多选一个被选中
									}*/
									if(_type === 1){ //单选
										var $checked = _win.$('#'+_id).find('[data_id="'+v+'"]');
										if($checked.length > 0){ //单选被选中
											var val = $checked.attr('data_id'),
												text = $.trim($checked.text());
											$el.val(text)
											   .attr('title',text);
											_win.$('#'+Id).val(val);
											$checked.addClass('hover');

											var $prev = $checked.prev();
											while($prev.length > 0){
												if($prev.attr('level') < $checked.attr('level')){
													if($prev.children('.expandable-hitarea').length > 0){
														$prev.children('.expandable-hitarea').trigger('click');
													}
												}
												if($prev.attr('level') == 0) break;
												$prev = $prev.prev();
											}
										}
									}else{
										var selectIds = v.split(',');
										$.each(selectIds,function(i,id){
											var $checked = _win.$('#'+_id).find('[data_id="'+id+'"]');
											if($checked.find('[type="checkbox"]').length > 0){
												$checked.find('[type="checkbox"]').attr('checked',true); //多选一个被选中
											}
											$checked.addClass('hover');
										});
									}
								}else{
									slideDown(btm);
								}
								if(_type === 1){ //单选
									_win.$('#'+_id).find('[type="checkbox"]').remove();
									_win.$('#'+_id).find('li').off('click').on('click',function(e){
										var val = $(this).attr('data_id'),
											text = $.trim($(this).text());
										$el.val(text)
										   .attr('default',text);
										_win.$('#'+Id).val(val);
										$(this).addClass('hover').siblings().removeClass('hover');
										slideUp();
									});
								}
							}
						};
						if(typeof url === 'string' && url !== ''){
							$el.val(settings.loaddingValue)
							   .attr('title',settings.loaddingValue);
							$.post(url, { page: 1, limit: 0, where: wh },function(d){
								if(typeof d.record !== 'undefined' && $.isArray(d.record)) settings.data = d.record;
								else if($.isArray(d)) settings.data = d;
								optionFill();
							},'json');
						}else if($.isArray(settings.data)){
							if($children.length > 0 && settings.data == 0){
								$children.each(function(i,n){
									settings.data.push({"id":$(n).attr('value'),"parent_id":$(n).data('parent_id'),"name":$(n).text()});
								});
							}
							optionFill();
						} 
					}
					body();
					if(typeof e === 'object') e.stopPropagation();
				};
				$el.click(option).on('mousedown',function(e2){ e2.stopPropagation(); });
				$btn.click(option).on('mousedown',function(e2){ e2.stopPropagation(); });
				if(typeof v !== 'undefined' && v !== null && v !== ''){
					_win.$('#'+Id).val(v);
					option();
				}
				if(typeof fun === 'function') fun();
			});
		},
		destory: function(options){
			return this.each(function(){
				var $this = $(this);
				$this.removeData('selectTreeview');
			});
		},

	};
	$.fn.selectTreeview = function(){
		var method = arguments[0];
		if(methods[method]){
			method = methods[method];
			arguments = Array.prototype.slice.call(arguments,1);
		}else if(typeof method === 'object' || !method){
			method = methods.init;
		}else{
			$.error('method '+method+' does not exist on jQuery.selectTreeview');
		}
		return method.apply(this,arguments);
	};
}(jQuery));