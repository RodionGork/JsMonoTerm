function JsMonoTerm(obj) {
    var w = obj.w;
    var h = obj.h;
    var self = this;
    
    var s = '';
    for (var i = 0; i < w; i++) {
        s += ' ';
    }
    
    this.emptyLine = s;
    
    var div = $(obj.selector);
    
    div.addClass("jsterm");
    
    var cursorDiv = $("<div/>");
    cursorDiv.addClass("jsterm-cursor");
    div.append(cursorDiv);
    
    this.cx = 0;
    this.cy = 0;
    this.w = w;
    this.h = h;
    this.div = div;
    
    for (var i = 0; i < h; i++) {
        this.addLine();
    }
    
    $(document).keypress(function(c) {
        self.key(c);
    }).keydown(function(e) {
        if (e.keyCode == 8) {
            e.charCode = 8;
            self.key(e);
        }
    });
    
    setInterval(function() {
        self.cursor();
    }, 300);
    
    this.getc = null;
    this.gets = null;
    this.getsBuffer = '';
}

JsMonoTerm.prototype.move = function(x, y) {
    this.cx = x;
    this.cy = y;
}

JsMonoTerm.prototype.print = function(s) {
    if (typeof(s) == 'undefined' || s == null) {
        return;
    }
    var len = s.length;
    var span = this.div.find("span").get(this.cy);
    var text = $(span).text();
    text = text.substr(0, this.cx) + s + text.substr(this.cx + len);
    $(span).text(text);
    this.cx += len;
}

JsMonoTerm.prototype.addLine = function() {
    this.div.append($("<span>" + this.emptyLine + "</span><br/>"));
}

JsMonoTerm.prototype.delLine = function(n) {
    if (!n) {
        n = 0;
    }
    var span = $(this.div.find("span").get(n));
    span.next().remove();
    span.remove();
    this.addLine();
}

JsMonoTerm.prototype.clear = function() {
    for (var i = this.h - 1; i >= 0; i--) {
        this.delLine(i);
    }
    this.move(0, 0);
}

JsMonoTerm.prototype.println = function(s) {
    this.print(s);
    this.cx = 0;
    this.cy += 1;
    while (this.cy >= this.h) {
        this.delLine();
        this.cy -= 1;
    }
}

JsMonoTerm.prototype.printf = function() {
    if (arguments.length < 1) {
        return;
    }
    var s = arguments[0];
    var res = '';
    var i = 0;
    var p = 1;
    while (i < s.length) {
        var next = s.indexOf('%', i);
        if (next < 0) {
            res += s.substring(i);
            break;
        }
        res += s.substring(i, next);
        next += 1;
        if (s.charAt(next) == '%') {
            res += '%';
            i = next + 1;
            continue;
        }
        for (var end = next; s.charCodeAt(end) < 65; end++) {
        }
        var suffix = s.charAt(end);
        i = end + 1;
        end = end > next ? s.substring(next, end + 1) : null;
        var subst = arguments[p++];
        if (suffix == 'd') {
            subst = '' + subst;
        } else if (suffix == 'x') {
            subst = subst.toString(16).toLowerCase();
        } else if (suffix == 'X') {
            subst = subst.toString(16).toUpperCase();
        }
        if (end != null) {
            var pad = end.charAt(0) == '0' ? '0' : ' ';
            end = parseInt(end);
            while (subst.length < end) {
                subst = pad + subst;
            }
        }
        res += subst;
    }
    this.print(res);
}

JsMonoTerm.prototype.key = function(c) {
    c = c.charCode;
    if (c >= 32) {
        var ch = String.fromCharCode(c);
        this.print(ch);
        if (this.gets && this.getsBuffer.length < 256) {
            this.getsBuffer += ch;
        }
    } else if (c == 13) {
        this.println('');
    } else if (c == 8 && this.cx > 0) {
        this.cx--;
        this.print(' ');
        this.cx--;
        if (this.gets && this.getsBuffer.length > 0) {
            this.getsBuffer = this.getsBuffer.substring(0, this.getsBuffer.length - 1);
        }
    }
    this.cursorPos();
    if (c >= 32 && this.getc) {
        var f = this.getc;
        this.getc = null;
        f(String.fromCharCode(c));
    }
    if (c == 13 && this.gets) {
        var f = this.gets;
        this.gets = null;
        f(this.getsBuffer);
        this.getsBuffer = '';
    }
}

JsMonoTerm.prototype.cursor = function() {
    var c = this.div.find(".jsterm-cursor");
    if (c.is(":visible")) {
        c.hide();
        return;
    } else {
        c.show();
    }
    this.cursorPos();
}

JsMonoTerm.prototype.cursorPos = function() {
    var c = this.div.find(".jsterm-cursor");
    var span = $(this.div.find("span").get(this.cy));
    var spanPos = span.offset();
    c.width(span.width() / this.w);
    c.height(span.height() / 4);
    var curPos = {};
    curPos.left = spanPos.left + span.width() * this.cx / this.w;
    curPos.top = spanPos.top + span.height() * 3 / 4;
    c.offset(curPos);
}

