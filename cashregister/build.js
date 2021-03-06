Polymer("core-header-panel", {publish: {mode: {value: "", reflect: true}, tallClass: "tall", shadow: false}, domReady: function () {
    this.async("scroll")
}, modeChanged: function () {
    this.scroll()
}, get header() {
    return this.$.headerContent.getDistributedNodes()[0]
}, scroll: function () {
    var shadowMode = {waterfall: 1, "waterfall-tall": 1};
    var noShadow = {seamed: 1, cover: 1, scroll: 1};
    var tallMode = {"waterfall-tall": 1};
    var main = this.$.mainContainer;
    var header = this.header;
    var sTop = main.scrollTop;
    var atTop = sTop === 0;
    if (header) {
        this.$.dropShadow.classList.toggle("hidden", !this.shadow && (atTop && shadowMode[this.mode] || noShadow[this.mode]));
        if (tallMode[this.mode]) {
            header.classList.toggle(this.tallClass, atTop)
        }
        header.classList.toggle("animate", tallMode[this.mode])
    }
}});
Polymer("core-toolbar");
Polymer("core-selection", {multi: false, ready: function () {
    this.clear()
}, clear: function () {
    this.selection = []
}, getSelection: function () {
    return this.multi ? this.selection : this.selection[0]
}, isSelected: function (item) {
    return this.selection.indexOf(item) >= 0
}, setItemSelected: function (item, isSelected) {
    if (item !== undefined && item !== null) {
        if (isSelected) {
            this.selection.push(item)
        } else {
            var i = this.selection.indexOf(item);
            if (i >= 0) {
                this.selection.splice(i, 1)
            }
        }
        this.fire("core-select", {isSelected: isSelected, item: item})
    }
}, select: function (item) {
    if (this.multi) {
        this.toggle(item)
    } else if (this.getSelection() !== item) {
        this.setItemSelected(this.getSelection(), false);
        this.setItemSelected(item, true)
    }
}, toggle: function (item) {
    this.setItemSelected(item, !this.isSelected(item))
}});
Polymer("core-selector", {selected: null, multi: false, valueattr: "name", selectedClass: "core-selected", selectedProperty: "", selectedAttribute: "active", selectedItem: null, selectedModel: null, selectedIndex: -1, target: null, itemsSelector: "", activateEvent: "tap", notap: false, ready: function () {
    this.activateListener = this.activateHandler.bind(this);
    this.observer = new MutationObserver(this.updateSelected.bind(this));
    if (!this.target) {
        this.target = this
    }
}, get items() {
    if (!this.target) {
        return[]
    }
    var nodes = this.target !== this ? this.itemsSelector ? this.target.querySelectorAll(this.itemsSelector) : this.target.children : this.$.items.getDistributedNodes();
    return Array.prototype.filter.call(nodes || [], function (n) {
        return n && n.localName !== "template"
    })
}, targetChanged: function (old) {
    if (old) {
        this.removeListener(old);
        this.observer.disconnect();
        this.clearSelection()
    }
    if (this.target) {
        this.addListener(this.target);
        this.observer.observe(this.target, {childList: true});
        this.updateSelected()
    }
}, addListener: function (node) {
    node.addEventListener(this.activateEvent, this.activateListener)
}, removeListener: function (node) {
    node.removeEventListener(this.activateEvent, this.activateListener)
}, get selection() {
    return this.$.selection.getSelection()
}, selectedChanged: function () {
    this.updateSelected()
}, updateSelected: function () {
    this.validateSelected();
    if (this.multi) {
        this.clearSelection();
        this.selected && this.selected.forEach(function (s) {
            this.valueToSelection(s)
        }, this)
    } else {
        this.valueToSelection(this.selected)
    }
}, validateSelected: function () {
    if (this.multi && !Array.isArray(this.selected) && this.selected !== null && this.selected !== undefined) {
        this.selected = [this.selected]
    }
}, clearSelection: function () {
    if (this.multi) {
        this.selection.slice().forEach(function (s) {
            this.$.selection.setItemSelected(s, false)
        }, this)
    } else {
        this.$.selection.setItemSelected(this.selection, false)
    }
    this.selectedItem = null;
    this.$.selection.clear()
}, valueToSelection: function (value) {
    var item = value === null || value === undefined ? null : this.items[this.valueToIndex(value)];
    this.$.selection.select(item)
}, updateSelectedItem: function () {
    this.selectedItem = this.selection
}, selectedItemChanged: function () {
    if (this.selectedItem) {
        var t = this.selectedItem.templateInstance;
        this.selectedModel = t ? t.model : undefined
    } else {
        this.selectedModel = null
    }
    this.selectedIndex = this.selectedItem ? parseInt(this.valueToIndex(this.selected)) : -1
}, valueToIndex: function (value) {
    for (var i = 0, items = this.items, c; c = items[i]; i++) {
        if (this.valueForNode(c) == value) {
            return i
        }
    }
    return value
}, valueForNode: function (node) {
    return node[this.valueattr] || node.getAttribute(this.valueattr)
}, selectionSelect: function (e, detail) {
    this.updateSelectedItem();
    if (detail.item) {
        this.applySelection(detail.item, detail.isSelected)
    }
}, applySelection: function (item, isSelected) {
    if (this.selectedClass) {
        item.classList.toggle(this.selectedClass, isSelected)
    }
    if (this.selectedProperty) {
        item[this.selectedProperty] = isSelected
    }
    if (this.selectedAttribute && item.setAttribute) {
        if (isSelected) {
            item.setAttribute(this.selectedAttribute, "")
        } else {
            item.removeAttribute(this.selectedAttribute)
        }
    }
}, activateHandler: function (e) {
    if (!this.notap) {
        var i = this.findDistributedTarget(e.target, this.items);
        if (i >= 0) {
            var item = this.items[i];
            var s = this.valueForNode(item) || i;
            if (this.multi) {
                if (this.selected) {
                    this.addRemoveSelected(s)
                } else {
                    this.selected = [s]
                }
            } else {
                this.selected = s
            }
            this.asyncFire("core-activate", {item: item})
        }
    }
}, addRemoveSelected: function (value) {
    var i = this.selected.indexOf(value);
    if (i >= 0) {
        this.selected.splice(i, 1)
    } else {
        this.selected.push(value)
    }
    this.valueToSelection(value)
}, findDistributedTarget: function (target, nodes) {
    while (target && target != this) {
        var i = Array.prototype.indexOf.call(nodes, target);
        if (i >= 0) {
            return i
        }
        target = target.parentNode
    }
}});
(function () {
    var waveMaxRadius = 150;

    function waveRadiusFn(touchDownMs, touchUpMs, anim) {
        var touchDown = touchDownMs / 1e3;
        var touchUp = touchUpMs / 1e3;
        var totalElapsed = touchDown + touchUp;
        var ww = anim.width, hh = anim.height;
        var waveRadius = Math.min(Math.sqrt(ww * ww + hh * hh), waveMaxRadius) * 1.1 + 5;
        var duration = 1.1 - .2 * (waveRadius / waveMaxRadius);
        var tt = totalElapsed / duration;
        var size = waveRadius * (1 - Math.pow(80, -tt));
        return Math.abs(size)
    }

    function waveOpacityFn(td, tu, anim) {
        var touchDown = td / 1e3;
        var touchUp = tu / 1e3;
        var totalElapsed = touchDown + touchUp;
        if (tu <= 0) {
            return anim.initialOpacity
        }
        return Math.max(0, anim.initialOpacity - touchUp * anim.opacityDecayVelocity)
    }

    function waveOuterOpacityFn(td, tu, anim) {
        var touchDown = td / 1e3;
        var touchUp = tu / 1e3;
        var outerOpacity = touchDown * .3;
        var waveOpacity = waveOpacityFn(td, tu, anim);
        return Math.max(0, Math.min(outerOpacity, waveOpacity))
    }

    function waveGravityToCenterPercentageFn(td, tu, r) {
        var touchDown = td / 1e3;
        var touchUp = tu / 1e3;
        var totalElapsed = touchDown + touchUp;
        return Math.min(1, touchUp * 6)
    }

    function waveDidFinish(wave, radius, anim) {
        var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);
        if (waveOpacity < .01 && radius >= Math.min(wave.maxRadius, waveMaxRadius)) {
            return true
        }
        return false
    }

    function waveAtMaximum(wave, radius, anim) {
        var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);
        if (waveOpacity >= anim.initialOpacity && radius >= Math.min(wave.maxRadius, waveMaxRadius)) {
            return true
        }
        return false
    }

    function drawRipple(ctx, x, y, radius, innerColor, outerColor) {
        if (outerColor) {
            ctx.fillStyle = outerColor;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        }
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = innerColor;
        ctx.fill()
    }

    function createWave(elem) {
        var elementStyle = window.getComputedStyle(elem);
        var fgColor = elementStyle.color;
        var wave = {waveColor: fgColor, maxRadius: 0, isMouseDown: false, mouseDownStart: 0, mouseUpStart: 0, tDown: 0, tUp: 0};
        return wave
    }

    function removeWaveFromScope(scope, wave) {
        if (scope.waves) {
            var pos = scope.waves.indexOf(wave);
            scope.waves.splice(pos, 1)
        }
    }

    var pow = Math.pow;
    var now = Date.now;
    if (window.performance && performance.now) {
        now = performance.now.bind(performance)
    }
    function cssColorWithAlpha(cssColor, alpha) {
        var parts = cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (typeof alpha == "undefined") {
            alpha = 1
        }
        if (!parts) {
            return"rgba(255, 255, 255, " + alpha + ")"
        }
        return"rgba(" + parts[1] + ", " + parts[2] + ", " + parts[3] + ", " + alpha + ")"
    }

    function dist(p1, p2) {
        return Math.sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2))
    }

    function distanceFromPointToFurthestCorner(point, size) {
        var tl_d = dist(point, {x: 0, y: 0});
        var tr_d = dist(point, {x: size.w, y: 0});
        var bl_d = dist(point, {x: 0, y: size.h});
        var br_d = dist(point, {x: size.w, y: size.h});
        return Math.max(tl_d, tr_d, bl_d, br_d)
    }

    Polymer("paper-ripple", {initialOpacity: .25, opacityDecayVelocity: .8, backgroundFill: true, pixelDensity: 2, eventDelegates: {down: "downAction", up: "upAction"}, attached: function () {
        if (!this.$.canvas) {
            var canvas = document.createElement("canvas");
            canvas.id = "canvas";
            this.shadowRoot.appendChild(canvas);
            this.$.canvas = canvas
        }
    }, ready: function () {
        this.waves = []
    }, setupCanvas: function () {
        this.$.canvas.setAttribute("width", this.$.canvas.clientWidth * this.pixelDensity + "px");
        this.$.canvas.setAttribute("height", this.$.canvas.clientHeight * this.pixelDensity + "px");
        var ctx = this.$.canvas.getContext("2d");
        ctx.scale(this.pixelDensity, this.pixelDensity);
        if (!this._loop) {
            this._loop = this.animate.bind(this, ctx)
        }
    }, downAction: function (e) {
        this.setupCanvas();
        var wave = createWave(this.$.canvas);
        this.cancelled = false;
        wave.isMouseDown = true;
        wave.tDown = 0;
        wave.tUp = 0;
        wave.mouseUpStart = 0;
        wave.mouseDownStart = now();
        var width = this.$.canvas.width / 2;
        var height = this.$.canvas.height / 2;
        var rect = this.getBoundingClientRect();
        var touchX = e.x - rect.left;
        var touchY = e.y - rect.top;
        wave.startPosition = {x: touchX, y: touchY};
        if (this.classList.contains("recenteringTouch")) {
            wave.endPosition = {x: width / 2, y: height / 2};
            wave.slideDistance = dist(wave.startPosition, wave.endPosition)
        }
        wave.containerSize = Math.max(width, height);
        wave.maxRadius = distanceFromPointToFurthestCorner(wave.startPosition, {w: width, h: height});
        this.waves.push(wave);
        requestAnimationFrame(this._loop)
    }, upAction: function () {
        for (var i = 0; i < this.waves.length; i++) {
            var wave = this.waves[i];
            if (wave.isMouseDown) {
                wave.isMouseDown = false;
                wave.mouseUpStart = now();
                wave.mouseDownStart = 0;
                wave.tUp = 0;
                break
            }
        }
        this._loop && requestAnimationFrame(this._loop)
    }, cancel: function () {
        this.cancelled = true
    }, animate: function (ctx) {
        var shouldRenderNextFrame = false;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        var deleteTheseWaves = [];
        var longestTouchDownDuration = 0;
        var longestTouchUpDuration = 0;
        var lastWaveColor = null;
        var anim = {initialOpacity: this.initialOpacity, opacityDecayVelocity: this.opacityDecayVelocity, height: ctx.canvas.height, width: ctx.canvas.width};
        for (var i = 0; i < this.waves.length; i++) {
            var wave = this.waves[i];
            if (wave.mouseDownStart > 0) {
                wave.tDown = now() - wave.mouseDownStart
            }
            if (wave.mouseUpStart > 0) {
                wave.tUp = now() - wave.mouseUpStart
            }
            var tUp = wave.tUp;
            var tDown = wave.tDown;
            longestTouchDownDuration = Math.max(longestTouchDownDuration, tDown);
            longestTouchUpDuration = Math.max(longestTouchUpDuration, tUp);
            var radius = waveRadiusFn(tDown, tUp, anim);
            var waveAlpha = waveOpacityFn(tDown, tUp, anim);
            var waveColor = cssColorWithAlpha(wave.waveColor, waveAlpha);
            lastWaveColor = wave.waveColor;
            var x = wave.startPosition.x;
            var y = wave.startPosition.y;
            if (wave.endPosition) {
                var translateFraction = waveGravityToCenterPercentageFn(tDown, tUp, wave.maxRadius);
                var translateFraction = Math.min(1, radius / wave.containerSize * 2 / Math.sqrt(2));
                x += translateFraction * (wave.endPosition.x - wave.startPosition.x);
                y += translateFraction * (wave.endPosition.y - wave.startPosition.y)
            }
            var bgFillColor = null;
            if (this.backgroundFill) {
                var bgFillAlpha = waveOuterOpacityFn(tDown, tUp, anim);
                bgFillColor = cssColorWithAlpha(wave.waveColor, bgFillAlpha)
            }
            drawRipple(ctx, x, y, radius, waveColor, bgFillColor);
            var maximumWave = waveAtMaximum(wave, radius, anim);
            var waveDissipated = waveDidFinish(wave, radius, anim);
            var shouldKeepWave = !waveDissipated || maximumWave;
            var shouldRenderWaveAgain = !waveDissipated && !maximumWave;
            shouldRenderNextFrame = shouldRenderNextFrame || shouldRenderWaveAgain;
            if (!shouldKeepWave || this.cancelled) {
                deleteTheseWaves.push(wave)
            }
        }
        if (shouldRenderNextFrame) {
            requestAnimationFrame(this._loop)
        }
        for (var i = 0; i < deleteTheseWaves.length; ++i) {
            var wave = deleteTheseWaves[i];
            removeWaveFromScope(this, wave)
        }
        if (!this.waves.length) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            this._loop = null
        }
    }})
})();
Polymer("paper-tab", {noink: false});
Polymer("paper-tabs", {noink: false, nobar: false, activateEvent: "down", nostretch: false, selectedIndexChanged: function (old) {
    var s = this.$.selectionBar.style;
    if (!this.selectedItem) {
        s.width = 0;
        s.left = 0;
        return
    }
    var w = 100 / this.items.length;
    if (this.nostretch || old === null || old === -1) {
        s.width = w + "%";
        s.left = this.selectedIndex * w + "%";
        return
    }
    var m = 5;
    this.$.selectionBar.classList.add("expand");
    if (old < this.selectedIndex) {
        s.width = w + w * (this.selectedIndex - old) - m + "%"
    } else {
        s.width = w + w * (old - this.selectedIndex) - m + "%";
        s.left = this.selectedIndex * w + m + "%"
    }
}, barTransitionEnd: function () {
    var cl = this.$.selectionBar.classList;
    if (cl.contains("expand")) {
        cl.remove("expand");
        cl.add("contract");
        var s = this.$.selectionBar.style;
        var w = 100 / this.items.length;
        s.width = w + "%";
        s.left = this.selectedIndex * w + "%"
    } else if (cl.contains("contract")) {
        cl.remove("contract")
    }
}});
Polymer("core-xhr", {request: function (options) {
    var xhr = new XMLHttpRequest;
    var url = options.url;
    var method = options.method || "GET";
    var async = !options.sync;
    var params = this.toQueryString(options.params);
    if (params && method == "GET") {
        url += (url.indexOf("?") > 0 ? "&" : "?") + params
    }
    var xhrParams = this.isBodyMethod(method) ? options.body || params : null;
    xhr.open(method, url, async);
    if (options.responseType) {
        xhr.responseType = options.responseType
    }
    if (options.withCredentials) {
        xhr.withCredentials = true
    }
    this.makeReadyStateHandler(xhr, options.callback);
    this.setRequestHeaders(xhr, options.headers);
    xhr.send(xhrParams);
    if (!async) {
        xhr.onreadystatechange(xhr)
    }
    return xhr
}, toQueryString: function (params) {
    var r = [];
    for (var n in params) {
        var v = params[n];
        n = encodeURIComponent(n);
        r.push(v == null ? n : n + "=" + encodeURIComponent(v))
    }
    return r.join("&")
}, isBodyMethod: function (method) {
    return this.bodyMethods[(method || "").toUpperCase()]
}, bodyMethods: {POST: 1, PUT: 1, DELETE: 1}, makeReadyStateHandler: function (xhr, callback) {
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            callback && callback.call(null, xhr.response, xhr)
        }
    }
}, setRequestHeaders: function (xhr, headers) {
    if (headers) {
        for (var name in headers) {
            xhr.setRequestHeader(name, headers[name])
        }
    }
}});
Polymer("core-ajax", {url: "", handleAs: "", auto: false, params: "", response: null, method: "", headers: null, body: null, contentType: "application/x-www-form-urlencoded", withCredentials: false, xhrArgs: null, ready: function () {
    this.xhr = document.createElement("core-xhr")
}, receive: function (response, xhr) {
    if (this.isSuccess(xhr)) {
        this.processResponse(xhr)
    } else {
        this.error(xhr)
    }
    this.complete(xhr)
}, isSuccess: function (xhr) {
    var status = xhr.status || 0;
    return!status || status >= 200 && status < 300
}, processResponse: function (xhr) {
    var response = this.evalResponse(xhr);
    this.response = response;
    this.fire("core-response", {response: response, xhr: xhr})
}, error: function (xhr) {
    var response = xhr.status + ": " + xhr.responseText;
    this.fire("core-error", {response: response, xhr: xhr})
}, complete: function (xhr) {
    this.fire("core-complete", {response: xhr.status, xhr: xhr})
}, evalResponse: function (xhr) {
    return this[(this.handleAs || "text") + "Handler"](xhr)
}, xmlHandler: function (xhr) {
    return xhr.responseXML
}, textHandler: function (xhr) {
    return xhr.responseText
}, jsonHandler: function (xhr) {
    var r = xhr.responseText;
    try {
        return JSON.parse(r)
    } catch (x) {
        return r
    }
}, documentHandler: function (xhr) {
    return xhr.response
}, blobHandler: function (xhr) {
    return xhr.response
}, arraybufferHandler: function (xhr) {
    return xhr.response
}, urlChanged: function () {
    if (!this.handleAs) {
        var ext = String(this.url).split(".").pop();
        switch (ext) {
            case"json":
                this.handleAs = "json";
                break
        }
    }
    this.autoGo()
}, paramsChanged: function () {
    this.autoGo()
}, autoChanged: function () {
    this.autoGo()
}, autoGo: function () {
    if (this.auto) {
        this.goJob = this.job(this.goJob, this.go, 0)
    }
}, go: function () {
    var args = this.xhrArgs || {};
    args.body = this.body || args.body;
    args.params = this.params || args.params;
    if (args.params && typeof args.params == "string") {
        args.params = JSON.parse(args.params)
    }
    args.headers = this.headers || args.headers || {};
    if (args.headers && typeof args.headers == "string") {
        args.headers = JSON.parse(args.headers)
    }
    if (this.contentType) {
        args.headers["content-type"] = this.contentType
    }
    if (this.handleAs === "arraybuffer" || this.handleAs === "blob" || this.handleAs === "document") {
        args.responseType = this.handleAs
    }
    args.withCredentials = this.withCredentials;
    args.callback = this.receive.bind(this);
    args.url = this.url;
    args.method = this.method;
    return args.url && this.xhr.request(args)
}});
Polymer("post-service", {created: function () {
    this.posts = []
}, postsLoaded: function () {
    this.posts = this.$.ajax.response.slice(0)
}, setFavorite: function (uid, isFavorite) {
    console.log("Favorite changed: " + uid + ", now: " + isFavorite)
}});
(function () {
    var SKIP_ID = "meta";
    var metaData = {}, metaArray = {};
    Polymer("core-meta", {type: "default", alwaysPrepare: true, ready: function () {
        this.register(this.id)
    }, get metaArray() {
        var t = this.type;
        if (!metaArray[t]) {
            metaArray[t] = []
        }
        return metaArray[t]
    }, get metaData() {
        var t = this.type;
        if (!metaData[t]) {
            metaData[t] = {}
        }
        return metaData[t]
    }, register: function (id, old) {
        if (id && id !== SKIP_ID) {
            this.unregister(this, old);
            this.metaData[id] = this;
            this.metaArray.push(this)
        }
    }, unregister: function (meta, id) {
        delete this.metaData[id || meta.id];
        var i = this.metaArray.indexOf(meta);
        if (i >= 0) {
            this.metaArray.splice(i, 1)
        }
    }, get list() {
        return this.metaArray
    }, byId: function (id) {
        return this.metaData[id]
    }})
})();
Polymer("core-iconset", {src: "", width: 0, icons: "", iconSize: 24, offsetX: 0, offsetY: 0, type: "iconset", created: function () {
    this.iconMap = {};
    this.iconNames = [];
    this.themes = {}
}, ready: function () {
    if (this.src && this.ownerDocument !== document) {
        this.src = this.resolvePath(this.src, this.ownerDocument.baseURI)
    }
    this.super();
    this.updateThemes()
}, iconsChanged: function () {
    var ox = this.offsetX;
    var oy = this.offsetY;
    this.icons && this.icons.split(/\s+/g).forEach(function (name, i) {
        this.iconNames.push(name);
        this.iconMap[name] = {offsetX: ox, offsetY: oy};
        if (ox + this.iconSize < this.width) {
            ox += this.iconSize
        } else {
            ox = this.offsetX;
            oy += this.iconSize
        }
    }, this)
}, updateThemes: function () {
    var ts = this.querySelectorAll("property[theme]");
    ts && ts.array().forEach(function (t) {
        this.themes[t.getAttribute("theme")] = {offsetX: parseInt(t.getAttribute("offsetX")) || 0, offsetY: parseInt(t.getAttribute("offsetY")) || 0}
    }, this)
}, getOffset: function (icon, theme) {
    var i = this.iconMap[icon];
    if (!i) {
        var n = this.iconNames[Number(icon)];
        i = this.iconMap[n]
    }
    var t = this.themes[theme];
    if (i && t) {
        return{offsetX: i.offsetX + t.offsetX, offsetY: i.offsetY + t.offsetY}
    }
    return i
}, applyIcon: function (element, icon, scale) {
    var offset = this.getOffset(icon);
    scale = scale || 1;
    if (element && offset) {
        var style = element.style;
        style.backgroundImage = "url(" + this.src + ")";
        style.backgroundPosition = -offset.offsetX * scale + "px" + " " + (-offset.offsetY * scale + "px");
        style.backgroundSize = scale === 1 ? "auto" : this.width * scale + "px"
    }
}});
(function () {
    var meta;
    Polymer("core-icon", {src: "", size: 24, icon: "", observe: {"size icon": "updateIcon"}, defaultIconset: "icons", ready: function () {
        if (!meta) {
            meta = document.createElement("core-iconset")
        }
        this.updateIcon()
    }, srcChanged: function () {
        this.style.backgroundImage = "url(" + this.src + ")";
        this.style.backgroundPosition = "center";
        this.style.backgroundSize = this.size + "px " + this.size + "px"
    }, getIconset: function (name) {
        return meta.byId(name || this.defaultIconset)
    }, updateIcon: function () {
        if (this.size) {
            this.style.width = this.style.height = this.size + "px"
        }
        if (this.icon) {
            var parts = String(this.icon).split(":");
            var icon = parts.pop();
            if (icon) {
                var set = this.getIconset(parts.pop());
                if (set) {
                    set.applyIcon(this, icon, this.size / set.iconSize)
                }
            }
        }
    }})
})();
Polymer("core-iconset-svg", {iconSize: 24, type: "iconset", created: function () {
    this._icons = {}
}, ready: function () {
    this.super();
    this.updateIcons()
}, iconById: function (id) {
    return this._icons[id] || (this._icons[id] = this.querySelector("#" + id))
}, cloneIcon: function (id) {
    var icon = this.iconById(id);
    if (icon) {
        var content = icon.cloneNode(true);
        content.removeAttribute("id");
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 " + this.iconSize + " " + this.iconSize);
        svg.style.pointerEvents = "none";
        svg.appendChild(content);
        return svg
    }
}, get iconNames() {
    if (!this._iconNames) {
        this._iconNames = this.findIconNames()
    }
    return this._iconNames
}, findIconNames: function () {
    var icons = this.querySelectorAll("[id]").array();
    if (icons.length) {
        return icons.map(function (n) {
            return n.id
        })
    }
}, applyIcon: function (element, icon, scale) {
    var root = element.shadowRoot || element;
    var old = root.querySelector("svg");
    if (old) {
        old.remove()
    }
    var svg = this.cloneIcon(icon);
    if (!svg) {
        return
    }
    var size = scale * this.iconSize;
    if (size) {
        svg.style.height = svg.style.width = size + "px"
    } else {
        svg.setAttribute("height", "100%");
        svg.setAttribute("width", "100%");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
    }
    svg.style.display = "block";
    root.insertBefore(svg, root.firstElementChild)
}, updateIcons: function (selector, method) {
    selector = selector || "[icon]";
    method = method || "updateIcon";
    var deep = window.ShadowDOMPolyfill ? "" : "html /deep/ ";
    var i$ = document.querySelectorAll(deep + selector);
    for (var i = 0, e; e = i$[i]; i++) {
        if (e[method]) {
            e[method].call(e)
        }
    }
}});
Polymer("core-icon-button", {src: "", active: false, icon: "", activeChanged: function () {
    this.classList.toggle("selected", this.active)
}});
Polymer("post-card", {publish: {favorite: {value: false, reflect: true}}, favoriteTapped: function (event, detail, sender) {
    this.favorite = !this.favorite;
    this.fire("favorite-tap")
}});
Polymer("post-list", {handleFavorite: function (event, detail, sender) {
    var post = sender.templateInstance.model.post;
    this.$.service.setFavorite(post.uid, post.favorite)
}});
var list = document.querySelector("post-list");
var tabs = document.querySelector("paper-tabs");
tabs.addEventListener("core-select", function () {
    list.show = tabs.selected
});