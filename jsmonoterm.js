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
}

JsMonoTerm.prototype.move = function(x, y) {
    this.cx = x;
    this.cy = y;
}

JsMonoTerm.prototype.print = function(s) {
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

JsMonoTerm.prototype.key = function(c) {
    c = c.charCode;
    if (c >= 32) {
        this.print(String.fromCharCode(c));
    } else if (c == 13) {
        this.println('');
    } else if (c == 8 && this.cx > 0) {
        this.cx--;
        this.print(' ');
        this.cx--;
    }
    this.cursorPos();
    if (c >= 32 && this.getc) {
        var f = this.getc;
        this.getc = null;
        f(String.fromCharCode(c));
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

