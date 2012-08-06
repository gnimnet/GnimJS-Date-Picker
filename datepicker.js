/*
 * Gnim JS library Date Picker Component
 *  Version 0.1.1
 *  Write by Ming
 *  Date 2011.10.12
 */
(function($,undefined) {
    var CLASS_CON='picker-con';
    var CLASS_TITLE='picker-title';
    var CLASS_TITLE_PREV='picker-title-prev';
    var CLASS_TITLE_NEXT='picker-title-next';
    var CLASS_TITLE_TEXT='picker-title-text';
    var CLASS_CONTENT='picker-content';
    var CLASS_TODAY='picker-today';
    var CLASS_SELECT='picker-select';
    var NONE_LINK='javascript:void(0);';
    var MONTH_DAY=[31,28,31,30,31,30,31,31,30,31,30,31];
    var WEEKDAY_NAME=['\u65e5','\u4e00','\u4e8c','\u4e09','\u56db','\u4e94','\u516d'];
    var ADD_YEAR=0;
    var ADD_MONTH=1;
    var FORMAT=/^(\d*)-(\d*)-(\d*)$/;
    function Datepicker(cb,format,date){
        var self=this;
        self.r=false;
        self.cb=cb;
        self.f=format;
        var div=document.createElement('div');
        div.className=CLASS_CON;
        self.$elm=$(div);
        date=_fix(date);
        self.sel=date;
        self.cur=_fix();
        self.y=date.y;
        self.m=date.m;
        self.refresh();
    }
    function _numXX(num){
        return (num>=10?'':'0')+num;
    }
    function _fix(date){
        if(typeof date=='string'){
            var matches=FORMAT.exec(date);
            return matches?_date(matches[1],matches[2],matches[3]):_date();
        }
        return date?date:_date();
    }
    function _format(format,obj){
        return format.replace('yyyy',obj.y)
            .replace('mm',_numXX(obj.m))
            .replace('dd',_numXX(obj.d))
            .replace('yy',_numXX(obj.y%100))
            .replace('m',obj.m)
            .replace('d',obj.d)
            .replace('ww','\u661f\u671f'+WEEKDAY_NAME[obj.w]);
    }
    function _date(year,month,day){
        var d=new Date();
        if(year!=undefined){
            d.setFullYear(year, month-ADD_MONTH, day);
        }
        return {
            y:d.getFullYear()+ADD_YEAR,
            m:d.getMonth()+ADD_MONTH,
            d:d.getDate(),
            w:d.getDay()
        };
    }
    function _leapYear(year){
        return (year%400==0)||((year%4==0)&&(year%100!=0));
    }
    function _totalDay(year,month){
        return MONTH_DAY[month-1]+((month==2 && _leapYear(year))?1:0);
    }
    function _tableHead(){
        var htmlStr='<thead><tr>';
        for(var i=0;i<WEEKDAY_NAME.length;i++){
            htmlStr+='<th>'+WEEKDAY_NAME[i]+'</th>';
        }
        htmlStr+='</tr></thead>';
        return htmlStr;
    }
    function _tableBody(picker){
        var cur=picker.cur;
        var sel=picker.sel;
        var year=picker.y;
        var month=picker.m;
        var fd=_date(year, month, 1);//get first dat of the month
        var td=_totalDay(year,month);//get total day count of the month
        var htmlStr='<tbody><tr>';
        var echoCnt=0;
        var day=1-fd.w;
        while(true){
            if(day>=1 && day<=td){
                var addClass='';
                if(cur.y==year && cur.m==month && cur.d==day){
                    addClass+=' '+CLASS_TODAY;
                }
                if(sel.y==year && sel.m==month && sel.d==day){
                    addClass+=' '+CLASS_SELECT;
                }
                addClass=$.trim(addClass);
                if(addClass!=''){
                    addClass=' class="'+addClass+'"';
                }
                htmlStr+='<td><a href="'+NONE_LINK+'"'+addClass+'>'+day+'</a></td>';
            }else{
                htmlStr+='<td></td>';
            }
            day++;
            echoCnt++;
            if(echoCnt%7==0 && (day>td||day>50))break;
            if(echoCnt%7==0){
                htmlStr+='</tr><tr>';
            }
        }
        htmlStr+='</tr></tbody>';
        return htmlStr;
    }
    function refresh(){
        var self=this;
        var year=self.y;
        var month=self.m;
        var $elm=self.$elm;
        //create picker title
        var titleHtml='<div class="'+CLASS_TITLE+'">'
            +'<a class="'+CLASS_TITLE_PREV+'" href="'+NONE_LINK+'">\u4e0a\u6708</a>'
            +'<a class="'+CLASS_TITLE_NEXT+'" href="'+NONE_LINK+'">\u4e0b\u6708</a>'
            +'<div class="'+CLASS_TITLE_TEXT+'"><em>'+year+'</em> \u5e74 <em>'+month+'</em> \u6708</div>'
            +'</div>';
        var $title=$(titleHtml);
        $title.find('.'+CLASS_TITLE_PREV).click(function(){
            if(--self.m<=0){
                self.m=12;
                --self.y;
            }
            self.refresh();
        });
        $title.find('.'+CLASS_TITLE_NEXT).click(function(){
            if(++self.m>=13){
                self.m=1;
                ++self.y;
            }
            self.refresh();
        });
        //create picker content
        var contentHtml='<div class="'+CLASS_CONTENT+'">'
            +'<table>'+_tableHead()+_tableBody(self)+'</table>'
            +'</div>';
        var $content=$(contentHtml);
        $content.find('a').click(function(e){
            var link=e.srcElement||e.target;
            self.$elm.find('.'+CLASS_CONTENT+' a').removeClass(CLASS_SELECT);
            var day=$(link).addClass(CLASS_SELECT).html();
            self.sel=_date(self.y, self.m, day);
            if(self.cb){
                self.cb(self.get());
            }
        });
        $elm.empty().append($title).append($content);
    }
    function appendTo(selector){
        this.$elm.appendTo(selector);
        return this;
    }
    function get(){
        var self=this;
        return self.f?_format(self.f, self.sel):self.sel;
    }
    function set(date){
        var self=this;
        date=_fix(date);
        self.sel=date;
        return self;
    }
    function show(date){
        var self=this;
        date=date?_fix(date):self.get();
        self.y=date.y;
        self.m=date.m;
        self.refresh();
        return self;
    }
    function noBubble(){
        this.$elm.click(function(e){
            $.noBubble(e);
        });
        return this;
    }
    function remove(){
        var self=this;
        if(!self.r){
            self.$elm.remove();
            self.r=true;
        }
        return this;
    }
    Datepicker.prototype={
        refresh:refresh,
        appendTo:appendTo,
        get:get,
        set:set,
        show:show,
        remove:remove,
        noBubble:noBubble
    }
    window.Datepicker=Datepicker;
})(Gnim);