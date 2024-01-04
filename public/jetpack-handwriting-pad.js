(function() {
  var add_click, canvas_mousedown, canvas_mousemove, canvas_mouseup, canvas_touchmove, canvas_touchstart, redraw;

  canvas_mousedown = function (target, event, callback) {
      // NOTE: event.originalEvent.$material clause was added to compensate for the Angular-Material library picking up the touch event
      // not a part of original signature library
    //if (!event.originalEvent.$material) {
      var offset;
      target.data('paint', true);
      offset = target.offset();
      add_click(target, event.pageX - offset.left, event.pageY - offset.top);
      redraw(target);
      if (typeof callback !== 'undefined') {
          callback(target, event);
      }
    //}
  };
  canvas_mousemove = function(target, event) {
    var offset;
    if (target.data('paint')) {
      offset = target.offset();
      add_click(target, event.pageX - offset.left, event.pageY - offset.top, true);
      redraw(target);
    }
  };
  canvas_mouseup = function(target) {
    target.data('paint', false);
  };
  canvas_touchstart = function (target, event, callback) {
    var offset, touch;
    touch = event.originalEvent.touches[0];
    offset = target.offset();
    add_click(target, touch.pageX - offset.left, touch.pageY - offset.top);
    redraw(target);
    if (typeof callback !== 'undefined') {
      callback(target, event);
    }
  };
  canvas_touchmove = function(target, event) {
    var offset, touch;
    touch = event.originalEvent.touches[0];
    offset = target.offset();
    add_click(target, touch.pageX - offset.left, touch.pageY - offset.top, true);
    redraw(target);
  };
  add_click = function (target, x, y, dragging) {
    target.data('clickX').push(x);
    target.data('clickY').push(y);
    target.data('clickDrag').push(dragging);
  };
  redraw = function(target) {
    var context, i, _i, _ref;
    context = target.get(0).getContext('2d');
    context.strokeStyle = '#000000';
    context.lineJoin = 'round';
    context.lineWidth = 5;
    for (i = _i = 0, _ref = target.data('clickX').length; _i <= _ref; i = _i += 1) {
      context.beginPath();
      if ((target.data('clickDrag')[i])) {
        context.moveTo(target.data('clickX')[i - 1], target.data('clickY')[i - 1]);
      } else {
        context.moveTo(target.data('clickX')[i] - 1, target.data('clickY')[i]);
      }
      context.lineTo(target.data('clickX')[i], target.data('clickY')[i]);
      context.closePath();
      context.stroke();
    }
  };
  this.setupHandwritingPad = function(opts) {
    var activated_callback, selector;
    if (opts == null) {
      opts = {};
    }
    selector = typeof opts.selector === 'undefined' ? '.handwriting-pad-canvas' : opts.selector;
    activated_callback = opts.activated;
    $(selector).each(function() {
      $(this).data('clickX', new Array());
      $(this).data('clickY', new Array());
      $(this).data('clickDrag', new Array());
      $(this).data('paint', false);
      $(this).bind('mousedown', function(event) {
        canvas_mousedown($(this), event, activated_callback);
      });
      $(this).bind('mousemove', function(event) {
        canvas_mousemove($(this), event);
      });
      $(this).bind('mouseup', function(event) {
        canvas_mouseup($(this));
      });
      $(this).bind('touchstart', function(event) {
        event.preventDefault();
        canvas_touchstart($(this), event, activated_callback);
      });

      if (window.ResizeObserver){
        var resizeObersver = new ResizeObserver(function(oParams){
            // Canvas gets wiped out on screen rotate. Redraw it after a rotate
            //redraw($(oParams[0].target));

            // Make sure we aren't going to lose any of the signature
            var oCanvas = $(oParams[0].target);
            if (oCanvas.data('clickX').length > 0) {
                var mNewHeight = oCanvas[0].height, mNewWidth = oCanvas[0].width;
                var mMaxWidthDraw = Math.max.apply(null, oCanvas.data('clickX'));
                var mMaxHeightDraw = Math.max.apply(null, oCanvas.data('clickY'));

                if (mNewHeight < mMaxHeightDraw){
                    // we're going to lose part of the signature. Resize the canvas so that doesn't happen
                    oCanvas[0].height = mMaxHeightDraw + 10;
                }
                if (mNewWidth < mMaxWidthDraw){
                    oCanvas[0].width = mMaxWidthDraw + 10;
                }
            }
            
            redraw(oCanvas);
        });
        resizeObersver.observe($(this)[0]);
        
      } else {
          // Shouldn't really hit this since as of ios 13.4 Apple has supported it and Chrome supported it for years before that.
          // browser doesn't support resize observer, not much I can do. SRR 07/29/2020
      }

      return $(this).bind('touchmove', function(event) {          
        event.preventDefault();
        canvas_touchmove($(this), event);
      });
    });
  };
  this.getHandwritingDataUrl = function(selector) {
    return $(selector).get(0).toDataURL();
  };
  this.clearCanvas = function(selector, mFillStyle) {
    if (selector == null) {
      selector = '.handwriting-pad-canvas';
    }
    if (!mFillStyle){
        mFillStyle = '#ffffff'
    }
    $(selector).each(function() {
      var context;
      context = $(this).get(0).getContext('2d');
      $(this).data('clickX', new Array());
      $(this).data('clickY', new Array());
      $(this).data('clickDrag', new Array());
      context.fillStyle = mFillStyle; //'#ffffff';
      return context.fillRect(0, 0, $(this).get(0).width, $(this).get(0).height);
    });
  };
  this.refresh = function(selector){
      redraw($(selector));
  }
}).call(this);