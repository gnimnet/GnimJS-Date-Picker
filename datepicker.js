/*
 * Gnim JS library Date Picker Component
 *  Version 0.2.0
 *  Write by Ming
 *  Date 2014.01.23
 */
(function($, NULL, UNDEFINED) {
    var CLASS_CON = 'picker-con';
    var CLASS_TITLE = 'picker-title';
    var CLASS_TITLE_PREV = 'picker-title-prev';
    var CLASS_TITLE_NEXT = 'picker-title-next';
    var CLASS_TITLE_TEXT = 'picker-title-text';
    var CLASS_CONTENT = 'picker-content';
    var CLASS_BUTTONS = 'picker-buttons';
    var CLASS_BUTTON = 'picker-button';
    var CLASS_HIDE = 'picker-hide';
    var CLASS_TODAY = 'picker-today';
    var CLASS_SELECT = 'picker-select';
    var WEEKDAY_NAME = ['日', '一', '二', '三', '四', '五', '六'];
    var BUTTON_NAME = ['今天', '明天', '后天', '清除'];
    var DAY_MS = 24 * 3600 * 1000;
    function create(tagName, addClass, con) {
        var $node = $(document.createElement(tagName));
        if (addClass) {
            $node.addClass(addClass);
        }
        if (con) {
            $node.appendTo(con);
        }
        return $node;
    }
    function createDiv(addClass, con) {
        return create('div', addClass, con);
    }
    function createLink(text, handler, con, addClass) {
        var $link = $('<a href="javascript:;"></a>').text(text).click(handler);
        if (con) {
            $link.appendTo(con);
        }
        if (addClass) {
            $link.addClass(addClass);
        }
        return $link;
    }
    function formatNum(num, len) {
        var i = len || 2;
        var str = '';
        while (i > 0) {
            str += '0';
            i--;
        }
        str += num;
        return str.substr(str.length - len, len);
    }
    function formatDate(ts, format) {
        var date = new Date(ts);
        return format.replace(/yyyy|yy|MM|dd|HH|mm|ss/g, function($0) {
            var len = $0.length;
            switch ($0) {
                case 'yyyy':
                case 'yy':
                    return formatNum(date.getFullYear(), len);
                case 'MM':
                    return formatNum(date.getMonth() + 1, len);
                case 'dd':
                    return formatNum(date.getDate(), len);
                case 'HH':
                    return formatNum(date.getHours(), len);
                case 'mm':
                    return formatNum(date.getMinutes(), len);
                case 'ss':
                    return formatNum(date.getSeconds(), len);
                default:
                    return $0;
            }
        });
    }
    function parseDate(datestr) {
        var nums = [];
        datestr.replace(/(\d+)/g, function($0) {
            nums.push(parseInt($0.replace(/^0+/, '') || 0));
        });
        var date = new Date();
        date.setFullYear(nums[0] || 1970, nums[1] ? (nums[1] - 1) : 0, nums[2] || 1);
        date.setHours(nums[3] || 0, nums[4] || 0, nums[5] || 0, nums[6] || 0);
        return date.getTime();
    }
    function toTs(dateInfo) {
        if (!dateInfo) {
            return $.now();
        }
        if ($.isNum(dateInfo)) {
            return dateInfo;
        } else if ($.isStr(dateInfo)) {
            return parseDate(dateInfo);
        } else {
            return parseDate(dateInfo.year + '-' + dateInfo.month + '-' + dateInfo.date);
        }
    }
    function toDate(ts) {
        var date = new Date(ts);
        var newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return newDate;
    }
    function computeMonthTs(ts, next) {
        var date = toDate(ts);
        var newDate = NULL;
        if (next) {
            if (date.getMonth() === 11) {
                newDate = new Date(date.getFullYear() + 1, 0, 1);
            } else {
                newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            }
        } else {
            if (date.getMonth() === 0) {
                newDate = new Date(date.getFullYear() - 1, 11, 1);
            } else {
                newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
            }
        }
        return newDate ? newDate.getTime() : 0;
    }
    function computeDistance(ts1, ts2) {
        return Math.ceil((toDate(ts1).getTime() - toDate(ts2).getTime()) / 86400000);
    }
    function Datepicker(cb, format, dateInfo) {
        var self = this;
        self.removed = false;
        self.cb = cb;
        self.format = format;
        var $dom = self.$dom = createDiv(CLASS_CON);
        //init title
        var $title = createDiv(CLASS_TITLE, $dom);
        createLink('上月', function() {
            self.refresh(computeMonthTs(self.cur, false));
        }, $title, CLASS_TITLE_PREV);
        createLink('下月', function() {
            self.refresh(computeMonthTs(self.cur, true));
        }, $title, CLASS_TITLE_NEXT);
        createDiv(CLASS_TITLE_TEXT, $title);
        //init content
        initContent($dom);
        //init buttons
        var $buttons = createDiv(CLASS_BUTTONS, $dom);
        for (var i = 0; i < BUTTON_NAME.length; i++) {
            (function(name, add, clear) {
                createLink(name, function() {
                    var ts = $.now() + DAY_MS * add;
                    self.set(ts, true);
                    if (cb) {
                        cb(clear ? '' : self.get());
                    }
                }, $buttons, CLASS_BUTTON);
            })(BUTTON_NAME[i], (i > 2 ? 0 : i), (i > 2));
        }
        self.set(dateInfo, true);
    }
    function initContent($con) {
        var htmlStr = '<table><thead><tr>';
        for (var i = 0; i < WEEKDAY_NAME.length; i++) {
            htmlStr += '<th>' + WEEKDAY_NAME[i] + '</th>';
        }
        htmlStr += '</tr></thead>';
        htmlStr += '<tbody>';
        for (var i = 0; i < 6; i++) {
            htmlStr += '<tr>';
            for (var j = 0; j < 7; j++) {
                htmlStr += '<td></td>';
            }
            htmlStr += '</tr>';
        }
        htmlStr += '</tbody></table>';
        createDiv(CLASS_CONTENT, $con).html(htmlStr);
    }
    function refresh(cur) {
        var self = this;
        if (cur) {
            self.cur = cur;
        }
        var curDate = toDate(self.cur);
        var firstDate = new Date(curDate.getFullYear(), curDate.getMonth(), 1);
        var lastDate = new Date(computeMonthTs(self.cur, true) - DAY_MS);
        var totalCount = lastDate.getDate();
        var $dom = self.$dom;
        $dom.find('.' + CLASS_TITLE_TEXT).html('<em>' + firstDate.getFullYear() + '</em> 年 <em>' + (firstDate.getMonth() + 1) + '</em> 月');
        var $trs = $dom.find('tbody tr').addClass(CLASS_HIDE);
        var $tds = $dom.find('tbody td').empty().removeClass(CLASS_TODAY).removeClass(CLASS_SELECT);
        var startIndex = firstDate.getDay();
        var dayToTs = computeDistance(self.ts, firstDate.getTime());
        var dayToNow = computeDistance($.now(), firstDate.getTime());
        var haveRows = Math.ceil((startIndex + totalCount) / 7);
        for (var i = 0; i < haveRows; i++) {
            $($trs[i]).removeClass(CLASS_HIDE);
        }
        for (var j = 0; j < totalCount; j++) {
            (function(dayIndex) {
                var $link = createLink((dayIndex + 1).toString(), function() {
                    var ts = firstDate.getTime() + dayIndex * DAY_MS;
                    self.set(ts, true);
                    if (self.cb) {
                        self.cb(self.get());
                    }
                }, $tds[startIndex + dayIndex]);
                if (dayIndex === dayToTs) {
                    $link.addClass(CLASS_SELECT);
                }
                if (dayIndex === dayToNow) {
                    $link.addClass(CLASS_TODAY);
                }
            })(j);
        }
    }
    function get() {
        var self = this;
        return self.format ? formatDate(self.ts, self.format) : self.ts;
    }
    function set(dateInfo, setDisplay) {
        var self = this;
        self.ts = toTs(dateInfo || $.now());
        self.refresh(setDisplay ? self.ts : UNDEFINED);
        return self;
    }
    function appendTo(selector) {
        this.$dom.appendTo(selector);
        return this;
    }
    function remove() {
        var self = this;
        if (!self.removed) {
            self.$dom.remove();
            self.$dom = NULL;
            self.removed = true;
        }
        return this;
    }
    Datepicker.formatDate = formatDate;
    Datepicker.parseDate = parseDate;
    Datepicker.prototype = {
        get: get,
        set: set,
        refresh: refresh,
        appendTo: appendTo,
        remove: remove
    };
    window.Datepicker = Datepicker;
})(Gnim, null);