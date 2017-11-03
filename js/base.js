// $(document).ready(function(){
// 	console.log($);
// })
;(function(){
	'use strict';
	var $form_add_task=$('.add-task');
	// 取不到，因为在html文件里面没有，是动态添加的，要在添加了span之后的代码再取。
	//var $delete_task=$('.action.delete');
	var $delete_task;
	// task_list是一个数组，数组里面是对象
	var $detail_task;
	var task_list=[];
	var $task_detail=$('.task-detail');
	var $task_detail_mask=$('.task-detail-mask');
     // console.log($task_detail_mask)
	var current_index;
	var $update_form;
	var $task_detail_content;
	var  $task_detail_content_input;
	var  $msg = $('.msg');
	console.log($msg);
    var $msg_content = $msg.find('.msg-content');
    var  $msg_confirm = $msg.find('.confirmed');
	init();
	$form_add_task.on('submit',on_add_form_submit);
	$task_detail_mask.on('click',hide_task_detail);
	function on_add_form_submit(e){
		// 警用默认行为
        e.preventDefault();
        // 获取新task的值
        var new_task={};
        new_task.content=$(this).find('input[name=content]').val();
        // 如果新的task的值为空，返回
        if(!new_task.content) return;
        //如果值不为空，继续下一步,存入新的task
        // add_task(new_task);
        if(add_task(new_task)){
           //render_task_list();
           // 添加完了之后清空input框的内容
           $(this).find('input[name=content]').val('');
        }
       
	}

	// 刷新localstorage,同时渲染
	function refresh_task_list(){
		store.set('task_list',task_list);
		render_task_list();
	}
	function add_task(new_task){

		// 将新的task推入task_list数组内
		task_list.push(new_task);
		// 更新localstorage
	    refresh_task_list();
		//console.log(task_list);
		return true;
	}
	function render_task_list(){
		var $task_list = $('.task-list');
	    $task_list.html('');
	    var complete_items = [];
	    for (var i = 0; i < task_list.length; i++) {
	      var item = task_list[i];
	      if (item && item.complete){
	      	// i每次都改变，但是有时候并没有赋值。
	      	 complete_items[i] = item;
	         //console.log(complete_items[i]);
	      } 
	      else{
	      	var $task = render_task_item(item, i);
	        $task_list.prepend($task);
	      }
	    }
	    // 没赋值的都是空的
	    //console.log(complete_items);

	    for (var j = 0; j < complete_items.length; j++) {
	      $task = render_task_item(complete_items[j], j);
	      // 这句必须要，因为conplete_items里面很多空的
	      if (!$task) continue;
	      $task_list.append($task);
	      //$task.addClass('completed');
	    }
	 }
	function render_task_item(data,index){
		if(!data || index===undefined) return;
		// 串联方式，字符串用引号，变量之间就直接加号链接
          var list_item_template =
      '<div class="task-item" data-index="' + index + '">' +
      '<span><input class="complete" ' + (data.complete ? 'checked' : '') + ' type="checkbox"></span>' +
      '<span class="task-content">' + data.content + '</span>' +
      '<span class="fr">' +
      '<span class="action delete"> 删除</span>' +
      '<span class="action detail"> 详细</span>' +
      '</span>' +
      '</div>';
	    // 没有return怎么搞啊。。。
	    return list_item_template;
	}
	// 把delete这个监听事件封装，因为后面没更新一次dom之后都需要动态再监听一次事件。jq本身不会自动绑定数据变化
	// function listen_delete_task(){
	// 	$delete_task.on('click',function(){
	// 	//console.log('sun');
	// 	var $this=$(this);
	// 	// 获取delete按钮的父元素的父元素，也就是task-item
	// 	var $item=$this.parent().parent();
	// 	//console.log($item);
	// 	//js里面获取data值是dataset.index,jq 就是data("")
	// 	//console.log($item.data('index'));
	// 	var index=$item.data('index');
	// 	var temp=confirm("确定删除吗？")
	// 	temp?delete_task(index):null;
	// })
	// }
	// 这个代码中都是使用document这种方式，课程的代码是用在改变dom那边绑定触发函数那边。
	// 或者给整个document绑定事件。
	$(document).on('click','.action.delete',function(){
			//console.log('sun');
		var $this=$(this);
		// 获取delete按钮的父元素的父元素，也就是task-item
		var $item=$this.parent().parent();
		//console.log($item);
		//js里面获取data值是dataset.index,jq 就是data("")
		//console.log($item.data('index'));
		var index=$item.data('index');
		var temp=confirm("确定删除吗？")
		temp?delete_task(index):null;
	})
	function delete_task(index){
		if(index ===undefined|| !task_list[index]) return;
		delete task_list[index];
		refresh_task_list();
	}
   $(document).on('click','.action.detail',function(){
   	   var $this=$(this);
   	   var $item=$this.parent().parent();
   	   var index=$item.data('index');
   	  //console.log(index);
   	  show_task_detail(index);
   })
   $(document).on('dblclick','.task-item',function(){
   	   var index;
    	$('.task-item').on('dblclick',function(){
    		index=$(this).data('index');
    		show_task_detail(index);
    		//console.log(task_list[index])
       })
   })
   // 
   $(document).on('click','.task-list .complete',function(){
       var is_complete=($(this).is(':checked'));
      // console.log(is_complete);
       var $this=$(this);
       var index=$this.parent().parent().data('index');
       updata_task(index,{complete:is_complete});
      // console.log(task_list[index]);
   })
   function show_task_detail(index){
   	// 生成详情模板
   	render_task_detail(index);
   	current_index=index;
   	// 默认隐藏的
   	$task_detail.show();
   	$task_detail_mask.show();
   }
   function hide_task_detail(){
   	//console.log('hide_task_detail');
   	$task_detail.hide();
   	$task_detail_mask.hide();

   }
   function updata_task(index,data){
   	if(index===undefined || !task_list[index]) return;
   	// 吧task——detail里面的数据添加到task——list的对应的task——item里面
   	task_list[index]= $.extend({}, task_list[index], data);
   	//console.log(task_list[index]);
   	refresh_task_list();
   }
   function render_task_detail(index){
   	 if(index===undefined || !task_list[index]) return;
    	var item=task_list[index];
    	// form有提交的事件
    	//  (item.content || '')这里的括号是优先级，同时‘’是为了防止出现undefined的情况
     var task_detail_template=
      '<form>' +
      '<div class="content">' +
      item.content +
      '</div>' +
      '<div class="input-item">' +
      '<input style="display: none;" type="text" name="content" value="' + (item.content || '') + '">' +
      '</div>' +
      '<div>' +
      '<div class="desc input-item">' +
      '<textarea name="desc">' + (item.desc || '') + '</textarea>' +
      '</div>' +
      '</div>' +
      '<div class="remind input-item">' +
      '<label>提醒时间</label>' +
      '<input class="datetime" name="remind_date" type="text" value="' + (item.remind_date || '') + '">' +
      '</div>' +
      '<div class="input-item"><button type="submit">更新</button></div>' +
      '</form>';
      $task_detail.html('');
      $task_detail.html(task_detail_template);
      // 调用日历的js插件
      $('.datetime').datetimepicker();
      $update_form=$task_detail.find('form');
      $task_detail_content=$update_form.find('.content');
      // $task_detail_content_input=$update_form.find('.input-item');
      $task_detail_content_input=$update_form.find('[name=content]');
     // console.log($task_detail_content_input);
      // 双击详情里面标题出现input，可以进行修改
      $task_detail_content.on('dblclick',function(){
      	//console.log('1');
      	$task_detail_content_input.show();
      	$task_detail_content.hide();
      })
      $update_form.on('submit',function(e){
      	// 必须要先阻止默认事件，不然表单就先提交了。
      	e.preventDefault();
      	//console.log($update_form);
      	 var data = {};
      	 // 获取各个值，把他们追加到data里面，然后render出来
      	data.content=$(this).find('[name=content]').val();
      	data.desc=$(this).find('[name=desc]').val();
      	data.remind_date=$(this).find('[name=remind_date]').val();
      	updata_task(index,data);
      })
   }
	function task_remind_check(){
		var timer=setInterval(function(){
			//console.log("sun");
			for(var i=0;i<task_list.length;i++){
				var item=store.get('task_list')[i];
				//console.log(item);
				//console.log(item.content);
				if(!item || !item.remind_date || item.informed)
					continue;
				//console.log(item.content);
				var current_time=(new Date()).getTime();

				// var task_time=(new Date()).getTime();
                var task_time=(new Date(item.remind_date)).getTime();
				 if(current_time-task_time>=1){
				 	console.log('s');
					updata_task(i, {informed: true});
					show_msg(item.content);
				  }
			}
		},300);
	}
	//show_msg('买衣服');
	$msg_confirm.on('click',function(){
		hide_msg();
	})
	function show_msg(msg){
		if(!msg) return;
		$msg_content.html(msg);
		$msg.show();
	}
	function hide_msg(){
		$msg.hide();
	}
	//$msg.show();
	function init(){
		// task_list=store.get('task_list');
		task_list=store.get('task_list')|| [];
		// 先渲染，不然要提交了每次新的任务之前的任务才会出现
		if(task_list.length){
           render_task_list();
           task_remind_check();
		}
	}
})();