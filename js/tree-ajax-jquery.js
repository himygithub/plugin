(function($) {

  var _selection ='<div class="selection">';
  var _div ='</div>';
  var _selectLeft ="#selectLeft .selections";

  $.fn.treeMultiselect =function(opt){
  	var options =optionDefault(opt);

    var getTreeUrl =options.getTreeUrl;
    if(lens(getTreeUrl) !=0){
      init(options);
    }else{
      alert("请传入完整url");
    }
  	
  }
  function init(options){

    var getTreeUrl =options.getTreeUrl,
        argument =options.argument,
        argument1 =options.argumentselectDefaul,
        selectDefaultURL =options.selectDefaultURL,
        _style =options._style;

    //拼html
    $(_selectLeft).html('');
    
    //加载文档    
    getDate(getTreeUrl,argument,function(data){
      getTreeRoot(data);
      //树形展开与折叠
      toggles();
      //点击选中与取消
      selects();
      //删除右边被选中的
      delectRight();
      $(".selections>.selection .selection").hide();
      
      if(lens(selectDefaultURL) !=0){
        getDate(selectDefaultURL,argument1,function(data1){

            //默认选中
            selectDefault(data1);
        });
      }

    });

    if(lens(_style) !=0){
      domSytle(_style);
    };
    
  }
  function getDate(url,argument,callback){
  	$.ajax({
        type:"POST",
        url:url,
        data:argument,
        dataType:"json",
        success:function(success){
          // var models = eval("("+success+")");
          // console.log("success.data=="+JSON.stringify(models.data));
          var datas =success.data;
          if(datas)
          !!datas && typeof callback ==='function' && callback(datas);
          else
            alert("数据错误，请联系管理员")
        },
        error:function(er){
          console.log(er);
          alert("网络错误");
        }
      })
   }
  //初始化数据
  function selectDefault(data){
    $(data).each(function(i,item){
      var thatbox =$("input[pid="+item+"]");
      $(thatbox).click();
    })

   }
  function optionDefault(options){
  	var defaults = {
        _style:"background:#fff;width:520px;height:620px;",
  	}
  	return $.extend({}, defaults, options);
  }
  //树形up/down效果
  function toggles(){
    $("#selectLeft").on("click",".updown",function(){
      var icon =$(this).text();
      if(icon == "+"){
        //是否获取子元素or展开
        var pdom =$(this).parent();
        var childrenDom =$(pdom).next(".selection");
        if(lens(childrenDom) ==0){
          var url =$(this).attr("ajaxUlr");
          var that =this;
          toggleLoad($(that).next(),"show");
          afterHtml(pdom,url,function(){
            $(that).text("-");
            toggleLoad($(that).next(),"hide");
          });
        }else{
         
          $(childrenDom).show();
          $(this).text("-");
        }
      }else{
        $(this).parent().next(".selection").hide();
        $(this).text("+");
      }
    })
  }
  //勾选、取消效果
  function selects(){
    
    $("#selectLeft").on("click","input[type=checkbox]",function(){
      //是否获取子元素or展开
      var pdom =$(this).parent();
      var childrenDom =$(pdom).next(".selection");
      //如果不存在子元素，就发ajax请求
      var ispid =$(this).attr("pid");
      if(lens(childrenDom) ==0 &&  lens(ispid)==0){
         $(this).prop("checked",false);
         var url =$(this).prev(".updown").attr("ajaxUlr");
         if(lens(url) !=0){
           var that = $(this).prev(".updown");
           var dom =this;
           toggleLoad($(dom),"show");
           afterHtml(pdom,url,function(){
            $(that).text("-");
            toggleLoad($(dom),"hide");
           });
         }
        
      }else{
        var selectbox =$(this).parent().next(".selection");
        var bs =false;
        var thisId =$(this).attr("pid");

        var bln =true;
        if(this.checked){
          bs=true;
          //选中本级上级应该全部选中
          selectParents(this);

          var ptext =$(this).parent().text();
          if(thisId && thisId !=""){
              appendToRight(ptext,thisId);
              bln =false;
          }
        }else{
          bs=false;
          //判断是否取消上级
          selectCancel(this);

          if(typeof thisId !="" && thisId !=""){
              delectToRight(thisId);
          }
        }

        $(selectbox).find("input[type=checkbox]").each(function(){

          $(this).prop("checked",bs);

          var pid =$(this).attr("pid");
          var ptext =$(this).parent().text();
          if(pid &&pid !="undefined"){
              if(bs){
                  appendToRight(ptext,pid);
                }else{
                  delectToRight(pid);
                }
                bln= false;
            }else{
              var checkboxData =$(this).parent().next(".selection").find("input[type=checkbox]");
              if(lens(checkboxData)==0){
                $(this).prop("checked",false);
              }

            }
        })

        if(bln){
          $(this).prop("checked",false); 
          alert("请先加载您要选中分枝");
        }

      }
    })
  }

  //把选中的元素放到右区
  function appendToRight(ptext,pid){
      //获取上级url
      var pidData= new Array();
      $("#selectRight div").each(function(){
        var pids =$(this).attr("pid");
        pidData.push(pids);
      })
      if(pidData.indexOf(pid) ==-1){
        
        var purl =$("#selectLeft").find("input[pid="+pid+"]").parent().attr("parenturl");
      
        var purlText =purl.replace(/\+/gm,"").replace(/\-/gm,"");
        var checkHtml ="<div pid ="+pid+"><span class='delectIcon'>x</span><span class='s-name'>"+ptext+"</span><span class='parent-name'>"+purlText+"</span></div>";
        $("#selectRight").append(checkHtml);
      }
  }

  //取消选中，从右区删除
  function delectToRight(pid){
    $("#selectRight div").each(function(){
      var rid =$(this).attr("pid");
      if(typeof pid !="undefined" && pid !=""){
        if(rid ==pid)
          $(this).remove();
      }
    })
  }
  //选中上级方法（循环判断）
  function selectParents(dom){

    var title =$(dom).parent().parent().prev(".title");
    var pdom =$(title).find("input[type=checkbox]");

    pdom.prop("checked",true);

    if(pdom && lens(pdom) !=0){
      selectParents(pdom)
    }
  }
  //取消上级选中方法（循环判断）
  function selectCancel(dom){
    var len =lens(dom);
    if(dom && len !=0){
        var siblingsData =$(dom).parent().siblings(".title");
        var bl =false;
        siblingsData.each(function(){
          var sibbox =$(this).find("input[type=checkbox]");
          if(sibbox.is(":checked")){
            bl =true;
          }
        });
        if(lens(siblingsData)==0){
          bl =false;
        }
        if(bl ==false){
          var parentTile =$(dom).parent().parent().prev(".title");
          var parentBox =$(parentTile).find("input[type=checkbox]");
          $(parentBox).prop("checked",false);
          selectCancel(parentBox);
        }
    }
  }
  //返回数组或者字符串长度
  function lens(dom){
    var len=0;
    if(dom){
      if(dom.length){
        len =dom.length;
      }else if(dom.size){
        len =$(dom).size();
      }else{
        if(typeof dom =='object'){
          for (var name in dom)
                  {
                     len =1;
                  }
        }
      }
    }
    return len;
  }
  //从右区删除
  function delectRight(){
    $("#selectRight").on("click",".delectIcon",function(){
        var pdom =$(this).parent();
        var pid =$(pdom).attr("pid");
        $(pdom).remove();
        //找到左边的选中框
        var rDom =$("#selectLeft").find("input[pid="+pid+"]");
        $(rDom).click();      
      });
  }
  //拼HTML
  
  function getTitleHtml(obj){
    var name =obj.sname||"null",
        id = obj.sid||"",
        parentId =obj.pid||"";
    var ajaxUlr =obj.ajaxUlr||"";

    if(id !="" && parentId !=""){
        var parentUrl ="";
        if(parentId !="root"){
          var parentDom =$("div[title-id=tree_"+parentId+"]");
          parentUrl=$(parentDom).attr("parentUrl")+"/"+$(parentDom).text();
        }
        var title ='<div class="title" parentUrl="'+parentUrl+'" title-id="tree_'+id+'" ><span class="updown" ajaxUlr="'+ajaxUlr+'">+</span><input type="checkbox">'+name+'</div>';
        var endnode ='<div class="title" parentUrl="'+parentUrl+'"><input type="checkbox" pid="'+id+'">'+name+'</div>';
        var bulidTitle="";

        if(ajaxUlr)
          bulidTitle =title;
        else
          bulidTitle =endnode;
        return bulidTitle;
    }
  }


  function getTreeRoot(data){
    var treeRoot =new Array();
    var rootLftHtml ='';
    rootLftHtml +=_selection;
    $(data).each(function(index,item){
      var parentid =(item.pid).toLowerCase();
      if(parentid.trim()=='root'){
        var id =item.sid;
        treeRoot.push(id);
        var title =getTitleHtml(item);
        rootLftHtml+=title;
      }
    })
    rootLftHtml+=_div;
    $("#selectLeft .selections").html(rootLftHtml);
    treeChildenData(treeRoot,data);
  }

  function treeChildenData(pidData,data){
    var parentData =new Array();

    $(pidData).each(function(index,item){
        var pid =item;
        var leftHtml ='';
        var bl =false;
        leftHtml+=_selection;

        $(data).each(function(index,item){
            if(item.pid ==pid){
              bl =true;

              var id =item.sid;
              parentData.push(id);

              var title =getTitleHtml(item);
              leftHtml+=title;
            }
        })
        leftHtml+=_div;
        if(bl){
          $('div[title-id="tree_'+pid+'"]').after(leftHtml);
        }
        
    })


    if(lens(parentData) !=0){
      treeChildenData(parentData,data);
    }
  }

  //动态插入子元素
  function afterHtml(that,url,callback){
    //显示加载图标
     getDate(url,{pidId:"chlidren"},function(data){
        var childrenHtml ='';
        var titleid =$(that).attr("title-id");
        var parentId =titleid.trim().replace("tree_","");
        var pidData =new Array();
            if(lens(parentId) !=0){
               pidData.push(parentId);
               if(lens(data) !=0){
                treeChildenData(pidData,data);
                if(typeof callback =='function'){
                    callback();
                }
                
              }else{
                alert("没有分点");
                $(that).find("input[type=checkbox]").prop("disabled",true);
                $(that).find(".updown").text("");
              }
               
            }
     });  
  }
  function toggleLoad(dom,type){
    if(type =="show"){
      var loadHtml="<span class='loading'><img src='img/loading.gif'></span>";
      $(dom).after(loadHtml)
    }else{
      $(dom).next(".loading").remove();
    }

  }
  function domSytle(css){
    $("#selectDiv").attr("style",css);
  }
})(jQuery);
