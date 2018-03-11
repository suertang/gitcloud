// ==UserScript==
// @name         ass
// @namespace    http://nickvico.com/
// @version      0.3
// @description  提供“加亮今日帖子”、“移除viidii跳转”、“图片自动缩放”、“种子链接转磁力链”、“预览整页图片”、“游客站内搜索”、“返回顶部”等功能！
// @author       NewType
// @match        */htm_data*
// @require      //cdn.staticfile.org/jquery/1.12.4/jquery.min.js
// @run-at       document-end
// @grant        none
// @license      MIT License
// ==/UserScript==

(function() {
    'use strict';

    var helper = {
        addCss: function(css) {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.appendChild(document.createTextNode(css));
            document.getElementsByTagName('head')[0].appendChild(style);
        },
        addScript: function(js) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.appendChild(document.createTextNode(js));
            document.body.appendChild(script);
        },
        getCss: function(src) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = src;
            document.getElementsByTagName('head')[0].appendChild(link);
        },
        getScript: function(src, onload) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.onload = onload;
            script.src = src;
            document.body.appendChild(script);
        },
        timeFormat: function(data, format) { // eg:data=new Data() eg:format="yyyy-MM-dd hh:mm:ss";
            var o = {
                'M+': data.getMonth() + 1,
                'd+': data.getDate(),
                'h+': data.getHours(),
                'm+': data.getMinutes(),
                's+': data.getSeconds(),
                'q+': Math.floor((data.getMonth() + 3) / 3),
                'S': data.getMilliseconds()
            };
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (data.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp('(' + k + ')').test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
                }
            }
            return format;
        },
        hash: function(url) {
            var hash = url.split('hash=');
            return hash[1].substring(3);
        },
        inurl: function(str) {
            var url = document.location.href;
            return url.indexOf(str) >= 0;
        }
    };

    /*-------------------------------------------------------------------------------------------------------------------------------------------*/

    var t66y = function() {
        if (helper.inurl('/thread')) {
            // 高亮今天发表的帖子
            helper.addCss('.newTag{border-bottom:1px dotted red; color:red !important}.newPost{color:#ff5722; background:#fafff4;}.newPost a[target=_blank]{color:#5656ff;}');
            var today = new Date();
            today = helper.timeFormat(today, 'yyyy-MM-dd');
            $('tr.tr3').each(function() {
                var isToday = $(this).children('td').eq(2).find('div.f10').text();
                if (isToday === today) {
                    $(this).find('td:first').children().html('NEW').addClass('newTag');
                    $(this).addClass('newPost');
                }
            });
        }

        /*-------------------------------------------------------------------------------------------------------------------------------------------*/

        if (helper.inurl('/htm_data/')) {
            // 移除图片viidii跳转 & 图片自动缩放
            var imgList = new Array(0);
            var maxWidth = parseInt($("div#main").width() - 200) + 'px';
            $('img,input[type=image]').each(function() {
                if (typeof($(this).attr('onclick')) != "undefined") {
                    //$(this).attr('onclick', 'window.open(this.src);').css('max-width', maxWidth);
                    imgList.push($(this).attr('src'));
                }
            });
            $('.tips').remove();
            $('.c').remove();
            // 移除a标签viidii跳转
            $("a[href*=\'.viidii.\']").each(function() {
                var href = $(this).attr('href');
                //$(this).removeAttr('onclick');
                var newHref = href.replace('http://www.viidii.com/?', '').replace('http://www.viidii.info/?', '').replace(/______/g, '.').replace(/&z/g, '');
                $(this).attr('href', newHref);
            });
            $("input[type=image]").each(function() {
                var mysrc = $(this).attr('src');
               $(this).prop('outerHTML','<img src="'+mysrc+'">');
            });
            $("img").each(function(){
                $(this).removeAttr('onclick');
                $(this).removeAttr('style');
            });
            $(".tiptop:first()").append($('<input type=button id="repost" value="转贴">'));
            $("#repost").click(function(){
                //alert('clicked');
                $(".tpc_content:first()").children("div").remove();
                copyToClipboard(".tpc_content:first()");
            });
            // 种子链接转磁力链
			var torLink = $("a[href*=\'?hash\=\']");
			if( torLink.length > 0 ){
				var tmpNode = '<summary>本页共有 ' + torLink.length + ' 个磁力链！</summary>';
				torLink.each(function() {
					var torrent = $(this).attr('href');
					var hash = helper.hash(torrent);
					var magnet = 'magnet:?xt=urn:btih:' + hash;
					tmpNode += '<p><a target="_blank" href="' + magnet + '">【 磁力链:　' + magnet + ' 】</a>　　<a target="_blank" href="' + torrent + '">【 下载种子 】</a>　　<a target="_blank" href="http://apiv.ga/magnet/' + hash + '">【 九秒磁力云播 】</a></p>';
				});
				$('body').append('<div style="position:fixed;top:0px;background:#def7d4;width:100%;padding:4px;text-align:center;"><details>' + tmpNode + '</details></div>');
			}

            if (imgList.length > 0) {
                ImageView(imgList);
            }
        }

        /*-------------------------------------------------------------------------------------------------------------------------------------------*/

        // 预处理整页图片
        /*
        function ImageView(imgList) {
            helper.getCss('//cdn.jsdelivr.net/lightgallery/1.3.7/css/lightgallery.min.css');
            helper.getScript('//cdn.jsdelivr.net/picturefill/2.3.1/picturefill.min.js');
            helper.getScript('//cdn.jsdelivr.net/lightgallery/1.3.7/js/lightgallery.min.js');
            helper.getScript('//cdn.jsdelivr.net/g/lg-fullscreen,lg-thumbnail,lg-autoplay,lg-zoom');
            helper.getScript('//cdn.jsdelivr.net/mousewheel/3.1.13/jquery.mousewheel.min.js');

            helper.addCss('#viewer{max-width:1280px;margin:auto;display:none}#viewer > ul{margin-bottom:0;padding:0}#viewer > ul > li{float:left;margin-bottom:15px;margin-right:15px;width:240px;list-style-type:none}#viewer > ul > li a{border:3px solid #FFF;border-radius:3px;display:block;overflow:hidden;position:relative;float:left}#viewer > ul > li a > img{transition:transform .3s ease 0s;transform:scale3d(1, 1, 1);height:200px;width:240px}#viewer > ul > li a:hover > img{transform:scale3d(1.1, 1.1, 1.1);opacity:.9}');
            $('div#main').before('<div id="viewer"><ul id="lightgallery" class="list-unstyled row"></ul></div>');

            var lightGallery = $('#lightgallery');
            $.each(imgList, function(i, n) {
                i++;
                lightGallery.append('<li data-src="' + n + '" data-sub-html="<h4>Image' + i + '</h4><p>' + n + '</p>"><a href=""><img class="img-responsive" src="' + n + '"></a></li>');
            });

            helper.addCss('.viewer{position:fixed; top:7px; right:7px; cursor:pointer;}');
            helper.addScript('function Viewer(){ $("#lightgallery").lightGallery(); $("div#viewer,div#main,div#footer").fadeToggle(300); }');
            $('body').append('<img src="//i1.piimg.com/4851/1a3ae804bbdebbf6.png" class="viewer" onclick="Viewer()" title="预览整页图片">');
        }
        */
        /*-------------------------------------------------------------------------------------------------------------------------------------------*/

        // 返回顶部
        //$('body').append('<img src="//i1.piimg.com/4851/d6647ba37ccc61f3.png" onclick="$(body).animate({scrollTop:0},300);" style="position:fixed; bottom:20px; right:10px; cursor:pointer;}" title="返回顶部">');

        /*-------------------------------------------------------------------------------------------------------------------------------------------*/

        // 游客站内搜索
        /*
        $(function() {
            helper.addScript('(function(){var cx = "017632740523370213667:kcbl-j-fmok";var gcse = document.createElement("script");gcse.type = "text/javascript";gcse.async = true;gcse.src = "https://cse.google.com/cse.js?cx=" + cx;var s = document.getElementsByTagName("script")[0];s.parentNode.insertBefore(gcse, s);})();');
            helper.addCss('.gsrch{width:400px;float:right;margin:15px -25px 0 0;}.gsc-control-cse {background-color:#0f7884 !important;border:0 !important;padding:0 !important;}');
            $('.banner').append('<div class="gsrch"><gcse:search></gcse:search></div>');
        });
        */
    };

    /*-------------------------------------------------------------------------------------------------------------------------------------------*/

    helper.getScript('//cdn.staticfile.org/jquery/1.12.4/jquery.min.js', t66y);

})();

function copyToClipboard(element) {
  var $temp = $("<textarea>");
  $("body").append($temp);
  $temp.val(html2bb($(element).html())).select();
  document.execCommand("copy");
  $temp.remove();
}

function html2bb(str) {
    if(typeof str === "undefined") return "";
    str = str.replace(/< *table *[^>]*>/g, "[table]");
    str = str.replace(/< *\/table *>/g, "[/table]");
    str = str.replace(/< *tbody *[^>]*>/g, "");
    str = str.replace(/< *\/tbody *>/g, "");
    str = str.replace(/< *tr *[^>]*>/g, "[tr]");
    str = str.replace(/< *\/tr *>/g, "[/tr]");
    str = str.replace(/< *td *>/g, "[td]");
    str = str.replace(/< *\/td *>/g, "[/td]");
    str = str.replace(/< *br *\/*>/g, "\n");
    str = str.replace(/< *u *>/g, "[u]");
    str = str.replace(/< *\/ *u *>/g, "[/u]");
    str = str.replace(/< *\/ *li *>/g, "");
    str = str.replace(/< *li *>/g, "[*]");
    str = str.replace(/< *\/ *ul *>/g, "");
    str = str.replace(/< *ul *class=\\*\"bb_ul\\*\" *>/g, "");
    str = str.replace(/< *h2 *class=\"bb_tag\" *>/g, "[u]");
    str = str.replace(/< *\/ *h2 *>/g, "[/u]");
    str = str.replace(/< *strong *>/g, "[b]");
    str = str.replace(/< *\/ *strong *>/g, "[/b]");
    str = str.replace(/< *i *>/g, "[i]");
    str = str.replace(/< *\/ *i *>/g, "[/i]");
    str = str.replace(/\&quot;/g, "\"");
    str = str.replace(/< *img *src="([^"]*)" *>/g, "[img]$1[/img]");
    str = str.replace(/< *b *>/g, "[b]");
    str = str.replace(/< *\/ *b *>/g, "[/b]");
    str = str.replace(/< *a [^>]*>/g, "");

    str = str.replace(/< *\/ *a *>/g, "");
    str = str.replace(/< *p *[^>]*>/g, "");
    str = str.replace(/< *\/p *>/g, "");
    str = str.replace(/< *\/span *>/g, "");
    str = str.replace(/< *span *[^>]*>/g, "");
    str = str.replace(/\&nbsp;/g, " ");
   //str = str.replace(/>/g, "");
    str = str.replace(/\&amp;/g, "\&");
    //<p align="center"><span style="display:inline-block;color:#FF0000"><span class="f24">下载视频</span></span></p>
    //Yeah, all these damn stars. Because people put spaces where they shouldn't.
    var tit;
    tit=$("td:contains(本頁主題)").children('b').remove().end().text().replace(" --> ","");
    return str+ '\n'+tit;
}


