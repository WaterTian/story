Class(function Noise() {
  var module = this;

  function Grad(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z
  }
  Grad.prototype.dot2 = function(x, y) {
    return this.x * x + this.y * y
  };
  Grad.prototype.dot3 = function(x, y, z) {
    return this.x * x + this.y * y + this.z * z
  };
  var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0), new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1), new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
  var p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
  var perm = new Array(512);
  var gradP = new Array(512);
  module.seed = function(seed) {
    if (seed > 0 && seed < 1) {
      seed *= 65536
    }
    seed = Math.floor(seed);
    if (seed < 256) {
      seed |= seed << 8
    }
    for (var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ seed & 255
      } else {
        v = p[i] ^ seed >> 8 & 255
      }
      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12]
    }
  };
  module.seed(0);
  var F2 = .5 * (Math.sqrt(3) - 1);
  var G2 = (3 - Math.sqrt(3)) / 6;
  var F3 = 1 / 3;
  var G3 = 1 / 6;
  module.simplex2 = function(xin, yin) {
    var n0, n1, n2;
    var s = (xin + yin) * F2;
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var t = (i + j) * G2;
    var x0 = xin - i + t;
    var y0 = yin - j + t;
    var i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0
    } else {
      i1 = 0;
      j1 = 1
    }
    var x1 = x0 - i1 + G2;
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2;
    var y2 = y0 - 1 + 2 * G2;
    i &= 255;
    j &= 255;
    var gi0 = gradP[i + perm[j]];
    var gi1 = gradP[i + i1 + perm[j + j1]];
    var gi2 = gradP[i + 1 + perm[j + 1]];
    var t0 = .5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0)
    }
    var t1 = .5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1)
    }
    var t2 = .5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2)
    }
    return 70 * (n0 + n1 + n2)
  };
  module.simplex3 = function(xin, yin, zin) {
    var n0, n1, n2, n3;
    var s = (xin + yin + zin) * F3;
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var k = Math.floor(zin + s);
    var t = (i + j + k) * G3;
    var x0 = xin - i + t;
    var y0 = yin - j + t;
    var z0 = zin - k + t;
    var i1, j1, k1;
    var i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0
      }
    }
    var x1 = x0 - i1 + G3;
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;
    var x2 = x0 - i2 + 2 * G3;
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;
    var x3 = x0 - 1 + 3 * G3;
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;
    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i + perm[j + perm[k]]];
    var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
    var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
    var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];
    var t0 = .6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) {
      n0 = 0
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0)
    }
    var t1 = .6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) {
      n1 = 0
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1)
    }
    var t2 = .6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) {
      n2 = 0
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2)
    }
    var t3 = .6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) {
      n3 = 0
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3)
    }
    return 32 * (n0 + n1 + n2 + n3)
  };

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  function lerp(a, b, t) {
    return (1 - t) * a + t * b
  }
  module.perlin = function(x) {
    return module.perlin2(x, 0)
  };
  module.perlin2 = function(x, y) {
    var X = Math.floor(x),
      Y = Math.floor(y);
    x = x - X;
    y = y - Y;
    X = X & 255;
    Y = Y & 255;
    var n00 = gradP[X + perm[Y]].dot2(x, y);
    var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
    var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
    var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);
    var u = fade(x);
    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y))
  };
  module.perlin3 = function(x, y, z) {
    var X = Math.floor(x),
      Y = Math.floor(y),
      Z = Math.floor(z);
    x = x - X;
    y = y - Y;
    z = z - Z;
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;
    var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
    var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
    var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
    var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
    var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
    var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
    var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
    var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(x - 1, y - 1, z - 1);
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);
    return lerp(lerp(lerp(n000, n100, u), lerp(n001, n101, u), w), lerp(lerp(n010, n110, u), lerp(n011, n111, u), w), v)
  }
}, "Static");




Class(function Utils() {
  var _this = this;
  var _obj = {};
  if (typeof Float32Array == "undefined") Float32Array = Array;
  if (typeof Promise == "undefined") Promise = {};

  function rand(min, max) {
    return lerp(Math.random(), min, max)
  }

  function lerp(ratio, start, end) {
    return start + (end - start) * ratio
  }
  this.doRandom = function(min, max, precision) {
    if (typeof precision == "number") {
      var p = Math.pow(10, precision);
      return Math.round(rand(min, max) * p) / p
    } else {
      return Math.round(rand(min - .5, max + .5))
    }
  };
  this.headsTails = function(heads, tails) {
    return !_this.doRandom(0, 1) ? heads : tails
  };
  this.toDegrees = function(rad) {
    return rad * (180 / Math.PI)
  };
  this.toRadians = function(deg) {
    return deg * (Math.PI / 180)
  };
  this.findDistance = function(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy)
  };
  this.timestamp = function() {
    var num = Date.now() + _this.doRandom(0, 99999);
    return num.toString()
  };
  this.hitTestObject = function(obj1, obj2) {
    var x1 = obj1.x,
      y1 = obj1.y,
      w = obj1.width,
      h = obj1.height;
    var xp1 = obj2.x,
      yp1 = obj2.y,
      wp = obj2.width,
      hp = obj2.height;
    var x2 = x1 + w,
      y2 = y1 + h,
      xp2 = xp1 + wp,
      yp2 = yp1 + hp;
    if (xp1 >= x1 && xp1 <= x2) {
      if (yp1 >= y1 && yp1 <= y2) {
        return true
      } else if (y1 >= yp1 && y1 <= yp2) {
        return true
      }
    } else if (x1 >= xp1 && x1 <= xp2) {
      if (yp1 >= y1 && yp1 <= y2) {
        return true
      } else if (y1 >= yp1 && y1 <= yp2) {
        return true
      }
    }
    return false
  };
  this.randomColor = function() {
    var color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    if (color.length < 7) color = this.randomColor();
    return color
  };
  this.touchEvent = function(e) {
    var touchEvent = {};
    touchEvent.x = 0;
    touchEvent.y = 0;
    if (e.windowsPointer) return e;
    if (!e) return touchEvent;
    if (e.touches || e.changedTouches) {
      if (e.touches.length) {
        touchEvent.x = e.touches[0].pageX;
        touchEvent.y = e.touches[0].pageY - Mobile.scrollTop
      } else {
        touchEvent.x = e.changedTouches[0].pageX;
        touchEvent.y = e.changedTouches[0].pageY - Mobile.scrollTop
      }
    } else {
      touchEvent.x = e.pageX;
      touchEvent.y = e.pageY
    }
    if (Mobile.orientationSet && Mobile.orientation !== Mobile.orientationSet) {
      if (window.orientation == 90 || window.orientation === 0) {
        var x = touchEvent.y;
        touchEvent.y = touchEvent.x;
        touchEvent.x = Stage.width - x
      }
      if (window.orientation == -90 || window.orientation === 180) {
        var y = touchEvent.x;
        touchEvent.x = touchEvent.y;
        touchEvent.y = Stage.height - y
      }
    }
    return touchEvent
  };
  this.clamp = function(num, min, max) {
    return Math.min(Math.max(num, min), max)
  };
  this.constrain = function(num, min, max) {
    return Math.min(Math.max(num, Math.min(min, max)), Math.max(min, max))
  };
  this.nullObject = function(object) {
    if (object.destroy || object.div) {
      for (var key in object) {
        if (typeof object[key] !== "undefined") object[key] = null
      }
    }
    return null
  };
  this.convertRange = this.range = function(oldValue, oldMin, oldMax, newMin, newMax, clamped) {
    var oldRange = oldMax - oldMin;
    var newRange = newMax - newMin;
    var newValue = (oldValue - oldMin) * newRange / oldRange + newMin;
    if (clamped) return _this.clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax));
    return newValue
  };
  this.cloneObject = function(obj) {
    return JSON.parse(JSON.stringify(obj))
  };
  this.mergeObject = function() {
    var obj = {};
    for (var i = 0; i < arguments.length; i++) {
      var o = arguments[i];
      for (var key in o) {
        obj[key] = o[key]
      }
    }
    return obj
  };
  this.mix = function(from, to, alpha) {
    return from * (1 - alpha) + to * alpha
  };
  this.numberWithCommas = function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  };
  this.query = function(key) {
    return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"))
  };
  this.smoothstep = function(min, max, value) {
    var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x)
  };
  this.shuffleArray = function(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue
    }
    return array
  };
  this.sign = function(num) {
    return num < 0 ? -1 : 1
  };
  String.prototype.strpos = function(str) {
    if (Array.isArray(str)) {
      for (var i = 0; i < str.length; i++) {
        if (this.indexOf(str[i]) > -1) return true
      }
      return false
    } else {
      return this.indexOf(str) != -1
    }
  };
  String.prototype.clip = function(num, end) {
    return this.length > num ? this.slice(0, num) + end : this
  };
  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
  };
  Array.prototype.findAndRemove = function(reference) {
    if (!this.indexOf) return;
    var index = this.indexOf(reference);
    if (index > -1) return this.splice(index, 1)
  };
  Array.prototype.getRandom = function() {
    return this[_this.doRandom(0, this.length - 1)]
  };
  Array.prototype.last = function() {
    return this[this.length - 1]
  };
  Promise.create = function() {
    var promise = new Promise(function(resolve, reject) {
      _obj.resolve = resolve;
      _obj.reject = reject
    });
    promise.resolve = _obj.resolve;
    promise.reject = _obj.reject;
    if (arguments.length) {
      var fn = arguments[0];
      var params = [];
      for (var i = 1; i < arguments.length; i++) params.push(arguments[i]);
      params.push(promise.resolve);
      fn.apply(fn, params)
    }
    _obj.resolve = _obj.reject = null;
    return promise
  }
}, "Static");


Class(function Events(_this) {
  this.events = {};
  var _events = {};
  var _e = {};
  var _emitter, _linked;
  this.events.subscribe = function(object, evt, callback) {
    if (typeof object !== "object") {
      callback = evt;
      evt = object;
      object = null
    }
    if (object) {
      if (!_linked) _linked = [];
      let emitter = object.events.emitter();
      emitter._addEvent(evt, !!callback.resolve ? callback.resolve : callback, _this);
      emitter._saveLink(_this);
      _linked.push(emitter)
    } else {
      HydraEvents._addEvent(evt, !!callback.resolve ? callback.resolve : callback, _this)
    }
    return callback
  };
  this.events.unsubscribe = function(object, evt, callback) {
    if (typeof object !== "object") {
      callback = evt;
      evt = object;
      object = null
    }
    if (object) object.events.emitter()._removeEvent(evt, !!callback.resolve ? callback.resolve : callback, _this);
    else HydraEvents._removeEvent(evt, !!callback.resolve ? callback.resolve : callback)
  };
  this.events.fire = function(evt, obj, avoidGlobal) {
    obj = obj || _e;
    HydraEvents._checkDefinition(evt);
    if (_emitter && _emitter._fireEvent(evt, obj)) {} else if (_events[evt]) {
      obj.target = obj.target || _this;
      _events[evt](obj);
      obj.target = null
    } else if (!avoidGlobal) {
      HydraEvents._fireEvent(evt, obj)
    }
  };
  this.events.add = function(evt, callback) {
    HydraEvents._checkDefinition(evt);
    _events[evt] = !!callback.resolve ? callback.resolve : callback;
    return callback
  };
  this.events.remove = function(evt) {
    HydraEvents._checkDefinition(evt);
    if (_events[evt]) delete _events[evt]
  };
  this.events.bubble = function(object, evt) {
    HydraEvents._checkDefinition(evt);
    var _this = this;
    object.events.add(evt, function(e) {
      _this.fire(evt, e)
    })
  };
  this.events.scope = function(ref) {
    _this = ref
  };
  this.events.destroy = function() {
    HydraEvents._destroyEvents(_this);
    if (_linked) _linked.forEach(emitter => emitter._destroyEvents(_this));
    if (_emitter && _emitter.links) _emitter.links.forEach(obj => obj.events && obj.events._unlink(_emitter));
    _events = null;
    _this = null;
    return null
  };
  this.events.emitter = function() {
    if (!_emitter) _emitter = HydraEvents.createLocalEmitter();
    return _emitter
  };
  this.events.createEmitter = function() {
    HydraEvents.createLocalEmitter(_this)
  };
  this.events._unlink = function(emitter) {
    _linked.findAndRemove(emitter)
  }
});

Class(function MVC() {
  Inherit(this, Events);
  var _setters = {};
  var _active = {};
  var _timers = [];
  this.classes = {};

  function defineSetter(_this, prop) {
    _setters[prop] = {};
    Object.defineProperty(_this, prop, {
      set: function(v) {
        if (_setters[prop] && _setters[prop].s) _setters[prop].s.call(_this, v);
        v = null
      },
      get: function() {
        if (_setters[prop] && _setters[prop].g) return _setters[prop].g.apply(_this)
      }
    })
  }
  this.set = function(prop, callback) {
    if (!_setters[prop]) defineSetter(this, prop);
    _setters[prop].s = callback
  };
  this.get = function(prop, callback) {
    if (!_setters[prop]) defineSetter(this, prop);
    _setters[prop].g = callback
  };
  this.delayedCall = function(callback, time, params) {
    var _this = this;
    var timer = Timer.create(function() {
      if (!_this) return;
      if (_this.destroy) {
        callback && callback(params)
      }
      _this = callback = null
    }, time || 0);
    _timers.push(timer);
    if (_timers.length > 20) _timers.shift();
    return timer
  };
  this.initClass = function(clss, a, b, c, d, e, f, g) {
    var name = Utils.timestamp();
    if (window.Hydra) Hydra.arguments = arguments;
    var child = new clss(a, b, c, d, e, f, g);
    if (window.Hydra) Hydra.arguments = null;
    child.parent = this;
    if (child.destroy) {
      this.classes[name] = child;
      this.classes[name].__id = name
    }
    var lastArg = arguments[arguments.length - 1];
    if (Array.isArray(lastArg) && lastArg.length == 1 && lastArg[0] instanceof HydraObject) lastArg[0].addChild(child);
    else if (this.element && lastArg !== null) this.element.addChild(child);
    return child
  };
  this.destroy = function() {
    if (this.onDestroy) this.onDestroy();
    if (this.__renderLoop) Render.stop(this.__renderLoop);
    for (var i in this.classes) {
      var clss = this.classes[i];
      if (clss && clss.destroy) clss.destroy()
    }
    this.clearTimers && this.clearTimers();
    this.classes = null;
    if (this.events) this.events = this.events.destroy();
    if (this.element && this.element.remove) this.element = this.container = this.element.remove();
    if (this.parent && this.parent.__destroyChild) this.parent.__destroyChild(this.__id);
    return Utils.nullObject(this)
  };
  this.clearTimers = function() {
    for (let i = 0; i < _timers.length; i++) clearTimeout(_timers[i]);
    _timers.length = 0
  };
  this.active = function(name, value, time) {
    if (typeof value !== "undefined") {
      _active[name] = value;
      if (time) {
        this.delayedCall(function() {
          _active[name] = !_active[name]
        }, time)
      }
    } else {
      return _active[name]
    }
  };
  this.wait = function(callback, object, key) {
    var _this = this;
    let test = () => {
      if (!!object[key]) {
        callback();
        Render.stop(test)
      }
    };
    Render.start(test)
  };
  this.__destroyChild = function(name) {
    delete this.classes[name]
  }
});


Class(function View(_child) {
  Inherit(this, MVC);
  var _resize;
  var name = Hydra.getClassName(_child);
  this.element = $("." + name);
  this.element.__useFragment = true;
  this.css = function(obj) {
    this.element.css(obj);
    return this
  };
  this.transform = function(obj) {
    this.element.transform(obj || this);
    return this
  };
  this.tween = function(props, time, ease, delay, callback, manual) {
    return this.element.tween(props, time, ease, delay, callback, manual)
  };
  this.startRender = function(callback) {
    this.__renderLoop = callback;
    Render.start(callback)
  };
  this.stopRender = function(callback) {
    this.__renderLoop = null;
    Render.stop(callback)
  };
  var inter = Hydra.INTERFACES[name] || Hydra.INTERFACES[name + "UI"];
  if (inter) {
    this.ui = {};
    var params = Hydra.getArguments();
    params.push(_child);
    _resize = this.element.append(inter, params);
    var append = this.element.__append;
    for (var key in append) this.ui[key] = append[key];
    if (_resize) {
      this.resize = function() {
        _resize.apply(this.ui, arguments)
      }
    }
  }
  this.__call = function() {
    this.events.scope(this)
  }
});



Class(function LoaderUICircle(_size) {
  Inherit(this, View);
  var _this = this;
  var $this;
  var _svg, _path, _draw;
  var _canvasSize = _size;
  var _vertices = [];
  (function() {
    initHTML();
    initSVG();
    initVertices();
    draw()
  }());

  function initHTML() {
    $this = _this.element;
    $this.size(_canvasSize, _canvasSize).center()
  }

  function initSVG() {
    _svg = _this.initClass(SVG.Canvas, _canvasSize, _canvasSize);
    _path = _this.initClass(SVG.Path);
    _path.stroke("#ffffff");
    _path.fill("none");
    _path.strokeWidth(2);
    _path.lineJoin("round");
    _svg.add(_path)
  }

  function initVertices() {
    let radius = _size * .46;
    let num = 45;
    let inc = Math.PI * 2 / num;
    let angle = 0;
    let px = Utils.doRandom(0, .15);
    let py = Utils.doRandom(.05, .15);
    for (let i = 0; i < num; i++) {
      let random = Noise.perlin2(px, py);
      let x = radius * Math.cos(angle) + random + _canvasSize / 2;
      let y = radius * Math.sin(angle) + random + _canvasSize / 2;
      let v = new Vector2(x, y);
      v.spring = new Spring(v, v.clone(), .1, .95);
      v.origin = v.clone();
      _vertices.push(v);
      angle += inc;
      px += .17;
      py += .17
    }
    _draw = Array.from(_vertices);
    _draw.push(_vertices[0])
  }

  function draw() {
    for (let i = 0; i < _vertices.length; i++) {
      let v = _vertices[i];
      v.spring.update()
    }
    _path.moveTo(_draw[0].x, _draw[0].y);
    for (let i = 0; i < _vertices.length; i++) {
      let xc = (_draw[i].x + _draw[i + 1].x) / 2;
      let yc = (_draw[i].y + _draw[i + 1].y) / 2;
      _path.quadraticCurveTo(_draw[i].x.toFixed(8), _draw[i].y.toFixed(8), _draw[i + 1].x.toFixed(8), _draw[i + 1].y.toFixed(8));
      _path.draw()
    }
  }
  this.animateOn = function() {
    this.startRender(draw);
    for (let i = 0; i < _vertices.length; i++) {
      var v = _vertices[i];
      var scale = 1 + Utils.range(Math.sin(i), -1, 0, 0, .2) * .1;
      v.copy(v.origin).multiply(scale)
    }
  }
});