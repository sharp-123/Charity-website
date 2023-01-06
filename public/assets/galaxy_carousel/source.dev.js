'use strict'; var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }/* ! Magnific Popup - v1.0.0 - 2015-01-03
* http://dimsemenov.com/plugins/magnific-popup/
* Copyright (c) 2015 Dmitry Semenov; */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node/CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(window.jQuery || window.Zepto);
    }
})(function ($) {
    /* >>core*/
    /**
     *
     * Magnific Popup Core JS file
     *
     */


    /**
     * Private static constants
     */
    var CLOSE_EVENT = 'Close',
        BEFORE_CLOSE_EVENT = 'BeforeClose',
        AFTER_CLOSE_EVENT = 'AfterClose',
        BEFORE_APPEND_EVENT = 'BeforeAppend',
        MARKUP_PARSE_EVENT = 'MarkupParse',
        OPEN_EVENT = 'Open',
        CHANGE_EVENT = 'Change',
        NS = 'mfp',
        EVENT_NS = '.' + NS,
        READY_CLASS = 'mfp-ready',
        REMOVING_CLASS = 'mfp-removing',
        PREVENT_CLOSE_CLASS = 'mfp-prevent-close';


    /**
     * Private vars
     */
    /* jshint -W079 */
    var mfp = void 0,// As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
        MagnificPopup = function MagnificPopup() { },
        _isJQ = !!window.jQuery,
        _prevStatus = void 0,
        _window = $(window),
        _document = void 0,
        _prevContentType = void 0,
        _wrapClasses = void 0,
        _currPopupType = void 0;


    /**
     * Private functions
     */
    var _mfpOn = function _mfpOn(name, f) {
        mfp.ev.on(NS + name + EVENT_NS, f);
    },
        _getEl = function _getEl(className, appendTo, html, raw) {
            var el = document.createElement('div');
            el.className = 'mfp-' + className;
            if (html) {
                el.innerHTML = html;
            }
            if (!raw) {
                el = $(el);
                if (appendTo) {
                    el.appendTo(appendTo);
                }
            } else if (appendTo) {
                appendTo.appendChild(el);
            }
            return el;
        },
        _mfpTrigger = function _mfpTrigger(e, data) {
            mfp.ev.triggerHandler(NS + e, data);

            if (mfp.st.callbacks) {
                // converts "mfpEventName" to "eventName" callback and triggers it if it's present
                e = e.charAt(0).toLowerCase() + e.slice(1);
                if (mfp.st.callbacks[e]) {
                    mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [data]);
                }
            }
        },
        _getCloseBtn = function _getCloseBtn(type) {
            if (type !== _currPopupType || !mfp.currTemplate.closeBtn) {
                mfp.currTemplate.closeBtn = $(mfp.st.closeMarkup.replace('%title%', mfp.st.tClose));
                _currPopupType = type;
            }
            return mfp.currTemplate.closeBtn;
        },
        // Initialize Magnific Popup only when called at least once
        _checkInstance = function _checkInstance() {
            if (!$.magnificPopup.instance) {
                /* jshint -W020 */
                mfp = new MagnificPopup();
                mfp.init();
                $.magnificPopup.instance = mfp;
            }
        },
        // CSS transition detection, http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
        supportsTransitions = function supportsTransitions() {
            var s = document.createElement('p').style,// 's' for style. better to create an element if body yet to exist
                v = ['ms', 'O', 'Moz', 'Webkit'];// 'v' for vendor

            if (s['transition'] !== undefined) {
                return true;
            }

            while (v.length) {
                if (v.pop() + 'Transition' in s) {
                    return true;
                }
            }

            return false;
        };


    /**
     * Public functions
     */
    MagnificPopup.prototype = {

        constructor: MagnificPopup,

        /**
             * Initializes Magnific Popup plugin.
             * This function is triggered only once when $.fn.magnificPopup or $.magnificPopup is executed
             */
        init: function init() {
            var appVersion = navigator.appVersion;
            mfp.isIE7 = appVersion.indexOf('MSIE 7.') !== -1;
            mfp.isIE8 = appVersion.indexOf('MSIE 8.') !== -1;
            mfp.isLowIE = mfp.isIE7 || mfp.isIE8;
            mfp.isAndroid = /android/gi.test(appVersion);
            mfp.isIOS = /iphone|ipad|ipod/gi.test(appVersion);
            mfp.supportsTransition = supportsTransitions();

            // We disable fixed positioned lightbox on devices that don't handle it nicely.
            // If you know a better way of detecting this - let me know.
            mfp.probablyMobile = mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent);
            _document = $(document);

            mfp.popupsCache = {};
        },

        /**
             * Opens popup
             * @param  data [description]
             */
        open: function open(data) {
            var i = void 0;

            if (data.isObj === false) {
                // convert jQuery collection to array to avoid conflicts later
                mfp.items = data.items.toArray();

                mfp.index = 0;
                var items = data.items,
                    item = void 0;
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item.parsed) {
                        item = item.el[0];
                    }
                    if (item === data.el[0]) {
                        mfp.index = i;
                        break;
                    }
                }
            } else {
                mfp.items = $.isArray(data.items) ? data.items : [data.items];
                mfp.index = data.index || 0;
            }

            // if popup is already opened - we just update the content
            if (mfp.isOpen) {
                mfp.updateItemHTML();
                return;
            }

            mfp.types = [];
            _wrapClasses = '';
            if (data.mainEl && data.mainEl.length) {
                mfp.ev = data.mainEl.eq(0);
            } else {
                mfp.ev = _document;
            }

            if (data.key) {
                if (!mfp.popupsCache[data.key]) {
                    mfp.popupsCache[data.key] = {};
                }
                mfp.currTemplate = mfp.popupsCache[data.key];
            } else {
                mfp.currTemplate = {};
            }


            mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data);
            mfp.fixedContentPos = mfp.st.fixedContentPos === 'auto' ? !mfp.probablyMobile : mfp.st.fixedContentPos;

            if (mfp.st.modal) {
                mfp.st.closeOnContentClick = false;
                mfp.st.closeOnBgClick = false;
                mfp.st.showCloseBtn = false;
                mfp.st.enableEscapeKey = false;
            }


            // Building markup
            // main containers are created only once
            if (!mfp.bgOverlay) {
                // Dark overlay
                mfp.bgOverlay = _getEl('bg').on('click' + EVENT_NS, function () {
                    mfp.close();
                });

                mfp.wrap = _getEl('wrap').attr('tabindex', -1).on('click' + EVENT_NS, function (e) {
                    if (mfp._checkIfClose(e.target)) {
                        mfp.close();
                    }
                });

                mfp.container = _getEl('container', mfp.wrap);
            }

            mfp.contentContainer = _getEl('content');
            if (mfp.st.preloader) {
                mfp.preloader = _getEl('preloader', mfp.container, mfp.st.tLoading);
            }


            // Initializing modules
            var modules = $.magnificPopup.modules;
            for (i = 0; i < modules.length; i++) {
                var n = modules[i];
                n = n.charAt(0).toUpperCase() + n.slice(1);
                mfp['init' + n].call(mfp);
            }
            _mfpTrigger('BeforeOpen');


            if (mfp.st.showCloseBtn) {
                // Close button
                if (!mfp.st.closeBtnInside) {
                    mfp.wrap.append(_getCloseBtn());
                } else {
                    _mfpOn(MARKUP_PARSE_EVENT, function (e, template, values, item) {
                        values.close_replaceWith = _getCloseBtn(item.type);
                    });
                    _wrapClasses += ' mfp-close-btn-in';
                }
            }

            if (mfp.st.alignTop) {
                _wrapClasses += ' mfp-align-top';
            }


            if (mfp.fixedContentPos) {
                mfp.wrap.css({
                    overflow: mfp.st.overflowY,
                    overflowX: 'hidden',
                    overflowY: mfp.st.overflowY
                });

            } else {
                mfp.wrap.css({
                    top: _window.scrollTop(),
                    position: 'absolute'
                });

            }
            if (mfp.st.fixedBgPos === false || mfp.st.fixedBgPos === 'auto' && !mfp.fixedContentPos) {
                mfp.bgOverlay.css({
                    height: _document.height(),
                    position: 'absolute'
                });

            }


            if (mfp.st.enableEscapeKey) {
                // Close on ESC key
                _document.on('keyup' + EVENT_NS, function (e) {
                    if (e.keyCode === 27) {
                        mfp.close();
                    }
                });
            }

            _window.on('resize' + EVENT_NS, function () {
                mfp.updateSize();
            });


            if (!mfp.st.closeOnContentClick) {
                _wrapClasses += ' mfp-auto-cursor';
            }

            if (_wrapClasses)
                mfp.wrap.addClass(_wrapClasses);


            // this triggers recalculation of layout, so we get it once to not to trigger twice
            var windowHeight = mfp.wH = _window.height();


            var windowStyles = {};

            if (mfp.fixedContentPos) {
                if (mfp._hasScrollBar(windowHeight)) {
                    var s = mfp._getScrollbarSize();
                    if (s) {
                        windowStyles.marginRight = s;
                    }
                }
            }

            if (mfp.fixedContentPos) {
                if (!mfp.isIE7) {
                    windowStyles.overflow = 'hidden';
                } else {
                    // ie7 double-scroll bug
                    $('body, html').css('overflow', 'hidden');
                }
            }


            var classesToadd = mfp.st.mainClass;
            if (mfp.isIE7) {
                classesToadd += ' mfp-ie7';
            }
            if (classesToadd) {
                mfp._addClassToMFP(classesToadd);
            }

            // add content
            mfp.updateItemHTML();

            _mfpTrigger('BuildControls');

            // remove scrollbar, add margin e.t.c
            $('html').css(windowStyles);

            // add everything to DOM
            mfp.bgOverlay.add(mfp.wrap).prependTo(mfp.st.prependTo || $(document.body));

            // Save last focused element
            mfp._lastFocusedEl = document.activeElement;

            // Wait for next cycle to allow CSS transition
            setTimeout(function () {
                if (mfp.content) {
                    mfp._addClassToMFP(READY_CLASS);
                    mfp._setFocus();
                } else {
                    // if content is not defined (not loaded e.t.c) we add class only for BG
                    mfp.bgOverlay.addClass(READY_CLASS);
                }

                // Trap the focus in popup
                _document.on('focusin' + EVENT_NS, mfp._onFocusIn);
            }, 16);

            mfp.isOpen = true;
            mfp.updateSize(windowHeight);
            _mfpTrigger(OPEN_EVENT);

            return data;
        },

        /**
             * Closes the popup
             */
        close: function close() {
            if (!mfp.isOpen) return;
            _mfpTrigger(BEFORE_CLOSE_EVENT);

            mfp.isOpen = false;
            // for CSS3 animation
            if (mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition) {
                mfp._addClassToMFP(REMOVING_CLASS);
                setTimeout(function () {
                    mfp._close();
                }, mfp.st.removalDelay);
            } else {
                mfp._close();
            }
        },

        /**
             * Helper for close() function
             */
        _close: function _close() {
            _mfpTrigger(CLOSE_EVENT);

            var classesToRemove = REMOVING_CLASS + ' ' + READY_CLASS + ' ';

            mfp.bgOverlay.detach();
            mfp.wrap.detach();
            mfp.container.empty();

            if (mfp.st.mainClass) {
                classesToRemove += mfp.st.mainClass + ' ';
            }

            mfp._removeClassFromMFP(classesToRemove);

            if (mfp.fixedContentPos) {
                var windowStyles = { marginRight: '' };
                if (mfp.isIE7) {
                    $('body, html').css('overflow', '');
                } else {
                    windowStyles.overflow = '';
                }
                $('html').css(windowStyles);
            }

            _document.off('keyup' + EVENT_NS + ' focusin' + EVENT_NS);
            mfp.ev.off(EVENT_NS);

            // clean up DOM elements that aren't removed
            mfp.wrap.attr('class', 'mfp-wrap').removeAttr('style');
            mfp.bgOverlay.attr('class', 'mfp-bg');
            mfp.container.attr('class', 'mfp-container');

            // remove close button from target element
            if (mfp.st.showCloseBtn && (
                !mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
                if (mfp.currTemplate.closeBtn)
                    mfp.currTemplate.closeBtn.detach();
            }


            if (mfp._lastFocusedEl) {
                $(mfp._lastFocusedEl).focus();// put tab focus back
            }
            mfp.currItem = null;
            mfp.content = null;
            mfp.currTemplate = null;
            mfp.prevHeight = 0;

            _mfpTrigger(AFTER_CLOSE_EVENT);
        },

        updateSize: function updateSize(winHeight) {
            if (mfp.isIOS) {
                // fixes iOS nav bars https://github.com/dimsemenov/Magnific-Popup/issues/2
                var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
                var height = window.innerHeight * zoomLevel;
                mfp.wrap.css('height', height);
                mfp.wH = height;
            } else {
                mfp.wH = winHeight || _window.height();
            }
            // Fixes #84: popup incorrectly positioned with position:relative on body
            if (!mfp.fixedContentPos) {
                mfp.wrap.css('height', mfp.wH);
            }

            _mfpTrigger('Resize');
        },

        /**
             * Set content of popup based on current index
             */
        updateItemHTML: function updateItemHTML() {
            var item = mfp.items[mfp.index];

            // Detach and perform modifications
            mfp.contentContainer.detach();

            if (mfp.content)
                mfp.content.detach();

            if (!item.parsed) {
                item = mfp.parseEl(mfp.index);
            }

            var type = item.type;

            _mfpTrigger('BeforeChange', [mfp.currItem ? mfp.currItem.type : '', type]);
            // BeforeChange event works like so:
            // _mfpOn('BeforeChange', function(e, prevType, newType) { });

            mfp.currItem = item;


            if (!mfp.currTemplate[type]) {
                var markup = mfp.st[type] ? mfp.st[type].markup : false;

                // allows to modify markup
                _mfpTrigger('FirstMarkupParse', markup);

                if (markup) {
                    mfp.currTemplate[type] = $(markup);
                } else {
                    // if there is no markup found we just define that template is parsed
                    mfp.currTemplate[type] = true;
                }
            }

            if (_prevContentType && _prevContentType !== item.type) {
                mfp.container.removeClass('mfp-' + _prevContentType + '-holder');
            }

            var newContent = mfp['get' + type.charAt(0).toUpperCase() + type.slice(1)](item, mfp.currTemplate[type]);
            mfp.appendContent(newContent, type);

            item.preloaded = true;

            _mfpTrigger(CHANGE_EVENT, item);
            _prevContentType = item.type;

            // Append container back after its content changed
            mfp.container.prepend(mfp.contentContainer);

            _mfpTrigger('AfterChange');
        },


        /**
             * Set HTML content of popup
             */
        appendContent: function appendContent(newContent, type) {
            mfp.content = newContent;

            if (newContent) {
                if (mfp.st.showCloseBtn && mfp.st.closeBtnInside &&
                    mfp.currTemplate[type] === true) {
                    // if there is no markup, we just append close button element inside
                    if (!mfp.content.find('.mfp-close').length) {
                        mfp.content.append(_getCloseBtn());
                    }
                } else {
                    mfp.content = newContent;
                }
            } else {
                mfp.content = '';
            }

            _mfpTrigger(BEFORE_APPEND_EVENT);
            mfp.container.addClass('mfp-' + type + '-holder');

            mfp.contentContainer.append(mfp.content);
        },


        /**
             * Creates Magnific Popup data object based on given data
             * @param  {int} index Index of item to parse
             */
        parseEl: function parseEl(index) {
            var item = mfp.items[index],
                type = void 0;

            if (item.tagName) {
                item = { el: $(item) };
            } else {
                type = item.type;
                item = { data: item, src: item.src };
            }

            if (item.el) {
                var types = mfp.types;

                // check for 'mfp-TYPE' class
                for (var i = 0; i < types.length; i++) {
                    if (item.el.hasClass('mfp-' + types[i])) {
                        type = types[i];
                        break;
                    }
                }

                item.src = item.el.attr('data-mfp-src');
                if (!item.src) {
                    item.src = item.el.attr('href');
                }
            }

            item.type = type || mfp.st.type || 'inline';
            item.index = index;
            item.parsed = true;
            mfp.items[index] = item;
            _mfpTrigger('ElementParse', item);

            return mfp.items[index];
        },


        /**
             * Initializes single popup or a group of popups
             */
        addGroup: function addGroup(el, options) {
            var eHandler = function eHandler(e) {
                e.mfpEl = this;
                mfp._openClick(e, el, options);
            };

            if (!options) {
                options = {};
            }

            var eName = 'click.magnificPopup';
            options.mainEl = el;

            if (options.items) {
                options.isObj = true;
                el.off(eName).on(eName, eHandler);
            } else {
                options.isObj = false;
                if (options.delegate) {
                    el.off(eName).on(eName, options.delegate, eHandler);
                } else {
                    options.items = el;
                    el.off(eName).on(eName, eHandler);
                }
            }
        },
        _openClick: function _openClick(e, el, options) {
            var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;


            if (!midClick && (e.which === 2 || e.ctrlKey || e.metaKey)) {
                return;
            }

            var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;

            if (disableOn) {
                if ($.isFunction(disableOn)) {
                    if (!disableOn.call(mfp)) {
                        return true;
                    }
                } else {// else it's number
                    if (_window.width() < disableOn) {
                        return true;
                    }
                }
            }

            if (e.type) {
                e.preventDefault();

                // This will prevent popup from closing if element is inside and popup is already opened
                if (mfp.isOpen) {
                    e.stopPropagation();
                }
            }


            options.el = $(e.mfpEl);
            if (options.delegate) {
                options.items = el.find(options.delegate);
            }
            mfp.open(options);
        },


        /**
             * Updates text on preloader
             */
        updateStatus: function updateStatus(status, text) {
            if (mfp.preloader) {
                if (_prevStatus !== status) {
                    mfp.container.removeClass('mfp-s-' + _prevStatus);
                }

                if (!text && status === 'loading') {
                    text = mfp.st.tLoading;
                }

                var data = {
                    status: status,
                    text: text
                };

                // allows to modify status
                _mfpTrigger('UpdateStatus', data);

                status = data.status;
                text = data.text;

                mfp.preloader.html(text);

                mfp.preloader.find('a').on('click', function (e) {
                    e.stopImmediatePropagation();
                });

                mfp.container.addClass('mfp-s-' + status);
                _prevStatus = status;
            }
        },


        /*
                "Private" helpers that aren't private at all
             */
        // Check to close popup or not
        // "target" is an element that was clicked
        _checkIfClose: function _checkIfClose(target) {
            if ($(target).hasClass(PREVENT_CLOSE_CLASS)) {
                return;
            }

            var closeOnContent = mfp.st.closeOnContentClick;
            var closeOnBg = mfp.st.closeOnBgClick;

            if (closeOnContent && closeOnBg) {
                return true;
            } else {
                // We close the popup if click is on close button or on preloader. Or if there is no content.
                if (!mfp.content || $(target).hasClass('mfp-close') || mfp.preloader && target === mfp.preloader[0]) {
                    return true;
                }

                // if click is outside the content
                if (target !== mfp.content[0] && !$.contains(mfp.content[0], target)) {
                    if (closeOnBg) {
                        // last check, if the clicked element is in DOM, (in case it's removed onclick)
                        if ($.contains(document, target)) {
                            return true;
                        }
                    }
                } else if (closeOnContent) {
                    return true;
                }
            }
            return false;
        },
        _addClassToMFP: function _addClassToMFP(cName) {
            mfp.bgOverlay.addClass(cName);
            mfp.wrap.addClass(cName);
        },
        _removeClassFromMFP: function _removeClassFromMFP(cName) {
            this.bgOverlay.removeClass(cName);
            mfp.wrap.removeClass(cName);
        },
        _hasScrollBar: function _hasScrollBar(winHeight) {
            return (mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height());
        },
        _setFocus: function _setFocus() {
            (mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).focus();
        },
        _onFocusIn: function _onFocusIn(e) {
            if (e.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], e.target)) {
                mfp._setFocus();
                return false;
            }
        },
        _parseMarkup: function _parseMarkup(template, values, item) {
            var arr = void 0;
            if (item.data) {
                values = $.extend(item.data, values);
            }
            _mfpTrigger(MARKUP_PARSE_EVENT, [template, values, item]);

            $.each(values, function (key, value) {
                if (value === undefined || value === false) {
                    return true;
                }
                arr = key.split('_');
                if (arr.length > 1) {
                    var el = template.find(EVENT_NS + '-' + arr[0]);

                    if (el.length > 0) {
                        var attr = arr[1];
                        if (attr === 'replaceWith') {
                            if (el[0] !== value[0]) {
                                el.replaceWith(value);
                            }
                        } else if (attr === 'img') {
                            if (el.is('img')) {
                                el.attr('src', value);
                            } else {
                                el.replaceWith('<img src="' + value + '" class="' + el.attr('class') + '" />');
                            }
                        } else {
                            el.attr(arr[1], value);
                        }
                    }
                } else {
                    template.find(EVENT_NS + '-' + key).html(value);
                }
            });
        },

        _getScrollbarSize: function _getScrollbarSize() {
            // thx David
            if (mfp.scrollbarSize === undefined) {
                var scrollDiv = document.createElement('div');
                scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
                document.body.appendChild(scrollDiv);
                mfp.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                document.body.removeChild(scrollDiv);
            }
            return mfp.scrollbarSize;
        }
    };

    /* MagnificPopup core prototype end */


    /**
     * Public static functions
     */
    $.magnificPopup = {
        instance: null,
        proto: MagnificPopup.prototype,
        modules: [],

        open: function open(options, index) {
            _checkInstance();

            if (!options) {
                options = {};
            } else {
                options = $.extend(true, {}, options);
            }


            options.isObj = true;
            options.index = index || 0;
            return this.instance.open(options);
        },

        close: function close() {
            return $.magnificPopup.instance && $.magnificPopup.instance.close();
        },

        registerModule: function registerModule(name, module) {
            if (module.options) {
                $.magnificPopup.defaults[name] = module.options;
            }
            $.extend(this.proto, module.proto);
            this.modules.push(name);
        },

        defaults: {

            // Info about options is in docs:
            // http://dimsemenov.com/plugins/magnific-popup/documentation.html#options

            disableOn: 0,

            key: null,

            midClick: false,

            mainClass: '',

            preloader: true,

            focus: '',// CSS selector of input to focus after popup is opened

            closeOnContentClick: false,

            closeOnBgClick: true,

            closeBtnInside: true,

            showCloseBtn: true,

            enableEscapeKey: true,

            modal: false,

            alignTop: false,

            removalDelay: 0,

            prependTo: null,

            fixedContentPos: 'auto',

            fixedBgPos: 'auto',

            overflowY: 'auto',

            closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>',

            tClose: 'Close (Esc)',

            tLoading: 'Loading...'
        }
    };





    $.fn.magnificPopup = function (options) {
        _checkInstance();

        var jqEl = $(this);

        // We call some API method of first param is a string
        if (typeof options === 'string') {
            if (options === 'open') {
                var items = void 0,
                    itemOpts = _isJQ ? jqEl.data('magnificPopup') : jqEl[0].magnificPopup,
                    index = parseInt(arguments[1], 10) || 0;

                if (itemOpts.items) {
                    items = itemOpts.items[index];
                } else {
                    items = jqEl;
                    if (itemOpts.delegate) {
                        items = items.find(itemOpts.delegate);
                    }
                    items = items.eq(index);
                }
                mfp._openClick({ mfpEl: items }, jqEl, itemOpts);
            } else {
                var _mfp;
                if (mfp.isOpen)
                    (_mfp = mfp)[options].apply(_mfp, _toConsumableArray(Array.prototype.slice.call(arguments, 1)));
            }
        } else {
            // clone options obj
            options = $.extend(true, {}, options);

            /*
                     * As Zepto doesn't support .data() method for objects
                     * and it works only in normal browsers
                     * we assign "options" object directly to the DOM element. FTW!
                     */
            if (_isJQ) {
                jqEl.data('magnificPopup', options);
            } else {
                jqEl[0].magnificPopup = options;
            }

            mfp.addGroup(jqEl, options);
        }
        return jqEl;
    };


    // Quick benchmark
    /*
    var start = performance.now(),
        i,
        rounds = 1000;
    
    for(i = 0; i < rounds; i++) {
    
    }
    console.log('Test #1:', performance.now() - start);
    
    start = performance.now();
    for(i = 0; i < rounds; i++) {
    
    }
    console.log('Test #2:', performance.now() - start);
    */


    /* >>core*/

    /* >>inline*/

    var INLINE_NS = 'inline',
        _hiddenClass = void 0,
        _inlinePlaceholder = void 0,
        _lastInlineElement = void 0,
        _putInlineElementsBack = function _putInlineElementsBack() {
            if (_lastInlineElement) {
                _inlinePlaceholder.after(_lastInlineElement.addClass(_hiddenClass)).detach();
                _lastInlineElement = null;
            }
        };

    $.magnificPopup.registerModule(INLINE_NS, {
        options: {
            hiddenClass: 'hide',// will be appended with `mfp-` prefix
            markup: '',
            tNotFound: 'Content not found'
        },

        proto: {

            initInline: function initInline() {
                mfp.types.push(INLINE_NS);

                _mfpOn(CLOSE_EVENT + '.' + INLINE_NS, function () {
                    _putInlineElementsBack();
                });
            },

            getInline: function getInline(item, template) {
                _putInlineElementsBack();

                if (item.src) {
                    var inlineSt = mfp.st.inline,
                        el = $(item.src);

                    if (el.length) {
                        // If target element has parent - we replace it with placeholder and put it back after popup is closed
                        var parent = el[0].parentNode;
                        if (parent && parent.tagName) {
                            if (!_inlinePlaceholder) {
                                _hiddenClass = inlineSt.hiddenClass;
                                _inlinePlaceholder = _getEl(_hiddenClass);
                                _hiddenClass = 'mfp-' + _hiddenClass;
                            }
                            // replace target inline element with placeholder
                            _lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
                        }

                        mfp.updateStatus('ready');
                    } else {
                        mfp.updateStatus('error', inlineSt.tNotFound);
                        el = $('<div>');
                    }

                    item.inlineElement = el;
                    return el;
                }

                mfp.updateStatus('ready');
                mfp._parseMarkup(template, {}, item);
                return template;
            }
        }
    });



    /* >>inline*/

    /* >>ajax*/
    var AJAX_NS = 'ajax',
        _ajaxCur = void 0,
        _removeAjaxCursor = function _removeAjaxCursor() {
            if (_ajaxCur) {
                $(document.body).removeClass(_ajaxCur);
            }
        },
        _destroyAjaxRequest = function _destroyAjaxRequest() {
            _removeAjaxCursor();
            if (mfp.req) {
                mfp.req.abort();
            }
        };

    $.magnificPopup.registerModule(AJAX_NS, {

        options: {
            settings: null,
            cursor: 'mfp-ajax-cur',
            tError: '<a href="%url%">The content</a> could not be loaded.'
        },


        proto: {
            initAjax: function initAjax() {
                mfp.types.push(AJAX_NS);
                _ajaxCur = mfp.st.ajax.cursor;

                _mfpOn(CLOSE_EVENT + '.' + AJAX_NS, _destroyAjaxRequest);
                _mfpOn('BeforeChange.' + AJAX_NS, _destroyAjaxRequest);
            },
            getAjax: function getAjax(item) {
                if (_ajaxCur) {
                    $(document.body).addClass(_ajaxCur);
                }

                mfp.updateStatus('loading');

                var opts = $.extend({
                    url: item.src,
                    success: function success(data, textStatus, jqXHR) {
                        var temp = {
                            data: data,
                            xhr: jqXHR
                        };


                        _mfpTrigger('ParseAjax', temp);

                        mfp.appendContent($(temp.data), AJAX_NS);

                        item.finished = true;

                        _removeAjaxCursor();

                        mfp._setFocus();

                        setTimeout(function () {
                            mfp.wrap.addClass(READY_CLASS);
                        }, 16);

                        mfp.updateStatus('ready');

                        _mfpTrigger('AjaxContentAdded');
                    },
                    error: function error() {
                        _removeAjaxCursor();
                        item.finished = item.loadError = true;
                        mfp.updateStatus('error', mfp.st.ajax.tError.replace('%url%', item.src));
                    }
                },
                    mfp.st.ajax.settings);

                mfp.req = $.ajax(opts);

                return '';
            }
        }
    });




    /* >>ajax*/

    /* >>image*/
    var _imgInterval = void 0,
        _getTitle = function _getTitle(item) {
            if (item.data && item.data.title !== undefined)
                return item.data.title;

            var src = mfp.st.image.titleSrc;

            if (src) {
                if ($.isFunction(src)) {
                    return src.call(mfp, item);
                } else if (item.el) {
                    return item.el.attr(src) || '';
                }
            }
            return '';
        };

    $.magnificPopup.registerModule('image', {

        options: {
            markup: '<div class="mfp-figure">' +
                '<div class="mfp-close"></div>' +
                '<figure>' +
                '<div class="mfp-img"></div>' +
                '<figcaption>' +
                '<div class="mfp-bottom-bar">' +
                '<div class="mfp-title"></div>' +
                '<div class="mfp-counter"></div>' +
                '</div>' +
                '</figcaption>' +
                '</figure>' +
                '</div>',
            cursor: 'mfp-zoom-out-cur',
            titleSrc: 'title',
            verticalFit: true,
            tError: '<a href="%url%">The image</a> could not be loaded.'
        },


        proto: {
            initImage: function initImage() {
                var imgSt = mfp.st.image,
                    ns = '.image';

                mfp.types.push('image');

                _mfpOn(OPEN_EVENT + ns, function () {
                    if (mfp.currItem.type === 'image' && imgSt.cursor) {
                        $(document.body).addClass(imgSt.cursor);
                    }
                });

                _mfpOn(CLOSE_EVENT + ns, function () {
                    if (imgSt.cursor) {
                        $(document.body).removeClass(imgSt.cursor);
                    }
                    _window.off('resize' + EVENT_NS);
                });

                _mfpOn('Resize' + ns, mfp.resizeImage);
                if (mfp.isLowIE) {
                    _mfpOn('AfterChange', mfp.resizeImage);
                }
            },
            resizeImage: function resizeImage() {
                var item = mfp.currItem;
                if (!item || !item.img) return;

                if (mfp.st.image.verticalFit) {
                    var decr = 0;
                    // fix box-sizing in ie7/8
                    if (mfp.isLowIE) {
                        decr = parseInt(item.img.css('padding-top'), 10) + parseInt(item.img.css('padding-bottom'), 10);
                    }
                    item.img.css('max-height', mfp.wH - decr);
                }
            },
            _onImageHasSize: function _onImageHasSize(item) {
                if (item.img) {
                    item.hasSize = true;

                    if (_imgInterval) {
                        clearInterval(_imgInterval);
                    }

                    item.isCheckingImgSize = false;

                    _mfpTrigger('ImageHasSize', item);

                    if (item.imgHidden) {
                        if (mfp.content)
                            mfp.content.removeClass('mfp-loading');

                        item.imgHidden = false;
                    }
                }
            },

            /**
                     * Function that loops until the image has size to display elements that rely on it asap
                     */
            findImageSize: function findImageSize(item) {
                var counter = 0,
                    img = item.img[0],
                    mfpSetInterval = function mfpSetInterval(delay) {
                        if (_imgInterval) {
                            clearInterval(_imgInterval);
                        }
                        // decelerating interval that checks for size of an image
                        _imgInterval = setInterval(function () {
                            if (img.naturalWidth > 0) {
                                mfp._onImageHasSize(item);
                                return;
                            }

                            if (counter > 200) {
                                clearInterval(_imgInterval);
                            }

                            counter++;
                            if (counter === 3) {
                                mfpSetInterval(10);
                            } else if (counter === 40) {
                                mfpSetInterval(50);
                            } else if (counter === 100) {
                                mfpSetInterval(500);
                            }
                        }, delay);
                    };

                mfpSetInterval(1);
            },

            getImage: function getImage(item, template) {
                var guard = 0,

                    // image load complete handler
                    onLoadComplete = function onLoadComplete() {
                        if (item) {
                            if (item.img[0].complete) {
                                item.img.off('.mfploader');

                                if (item === mfp.currItem) {
                                    mfp._onImageHasSize(item);

                                    mfp.updateStatus('ready');
                                }

                                item.hasSize = true;
                                item.loaded = true;

                                _mfpTrigger('ImageLoadComplete');
                            } else {
                                // if image complete check fails 200 times (20 sec), we assume that there was an error.
                                guard++;
                                if (guard < 200) {
                                    setTimeout(onLoadComplete, 100);
                                } else {
                                    onLoadError();
                                }
                            }
                        }
                    },

                    // image error handler
                    onLoadError = function onLoadError() {
                        if (item) {
                            item.img.off('.mfploader');
                            if (item === mfp.currItem) {
                                mfp._onImageHasSize(item);
                                mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src));
                            }

                            item.hasSize = true;
                            item.loaded = true;
                            item.loadError = true;
                        }
                    },
                    imgSt = mfp.st.image;


                var el = template.find('.mfp-img');
                if (el.length) {
                    var img = document.createElement('img');
                    img.className = 'mfp-img';
                    if (item.el && item.el.find('img').length) {
                        img.alt = item.el.find('img').attr('alt');
                    }
                    item.img = $(img).on('load.mfploader', onLoadComplete).on('error.mfploader', onLoadError);
                    img.src = item.src;

                    // without clone() "error" event is not firing when IMG is replaced by new IMG
                    // TODO: find a way to avoid such cloning
                    if (el.is('img')) {
                        item.img = item.img.clone();
                    }

                    img = item.img[0];
                    if (img.naturalWidth > 0) {
                        item.hasSize = true;
                    } else if (!img.width) {
                        item.hasSize = false;
                    }
                }

                mfp._parseMarkup(template, {
                    title: _getTitle(item),
                    img_replaceWith: item.img
                },
                    item);

                mfp.resizeImage();

                if (item.hasSize) {
                    if (_imgInterval) clearInterval(_imgInterval);

                    if (item.loadError) {
                        template.addClass('mfp-loading');
                        mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src));
                    } else {
                        template.removeClass('mfp-loading');
                        mfp.updateStatus('ready');
                    }
                    return template;
                }

                mfp.updateStatus('loading');
                item.loading = true;

                if (!item.hasSize) {
                    item.imgHidden = true;
                    template.addClass('mfp-loading');
                    mfp.findImageSize(item);
                }

                return template;
            }
        }
    });




    /* >>image*/

    /* >>zoom*/
    var hasMozTransform = void 0,
        getHasMozTransform = function getHasMozTransform() {
            if (hasMozTransform === undefined) {
                hasMozTransform = document.createElement('p').style.MozTransform !== undefined;
            }
            return hasMozTransform;
        };

    $.magnificPopup.registerModule('zoom', {

        options: {
            enabled: false,
            easing: 'ease-in-out',
            duration: 300,
            opener: function opener(element) {
                return element.is('img') ? element : element.find('img');
            }
        },


        proto: {

            initZoom: function initZoom() {
                var zoomSt = mfp.st.zoom,
                    ns = '.zoom',
                    image = void 0;

                if (!zoomSt.enabled || !mfp.supportsTransition) {
                    return;
                }

                var duration = zoomSt.duration,
                    getElToAnimate = function getElToAnimate(image) {
                        var newImg = image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
                            transition = 'all ' + zoomSt.duration / 1000 + 's ' + zoomSt.easing,
                            cssObj = {
                                'position': 'fixed',
                                'zIndex': 9999,
                                'left': 0,
                                'top': 0,
                                '-webkit-backface-visibility': 'hidden'
                            },

                            t = 'transition';

                        cssObj['-webkit-' + t] = cssObj['-moz-' + t] = cssObj['-o-' + t] = cssObj[t] = transition;

                        newImg.css(cssObj);
                        return newImg;
                    },
                    showMainContent = function showMainContent() {
                        mfp.content.css('visibility', 'visible');
                    },
                    openTimeout = void 0,
                    animatedImg = void 0;

                _mfpOn('BuildControls' + ns, function () {
                    if (mfp._allowZoom()) {
                        clearTimeout(openTimeout);
                        mfp.content.css('visibility', 'hidden');

                        // Basically, all code below does is clones existing image, puts in on top of the current one and animated it

                        image = mfp._getItemToZoom();

                        if (!image) {
                            showMainContent();
                            return;
                        }

                        animatedImg = getElToAnimate(image);

                        animatedImg.css(mfp._getOffset());

                        mfp.wrap.append(animatedImg);

                        openTimeout = setTimeout(function () {
                            animatedImg.css(mfp._getOffset(true));
                            openTimeout = setTimeout(function () {
                                showMainContent();

                                setTimeout(function () {
                                    animatedImg.remove();
                                    image = animatedImg = null;
                                    _mfpTrigger('ZoomAnimationEnded');
                                }, 16);// avoid blink when switching images
                            }, duration);// this timeout equals animation duration
                        }, 16);// by adding this timeout we avoid short glitch at the beginning of animation


                        // Lots of timeouts...
                    }
                });
                _mfpOn(BEFORE_CLOSE_EVENT + ns, function () {
                    if (mfp._allowZoom()) {
                        clearTimeout(openTimeout);

                        mfp.st.removalDelay = duration;

                        if (!image) {
                            image = mfp._getItemToZoom();
                            if (!image) {
                                return;
                            }
                            animatedImg = getElToAnimate(image);
                        }


                        animatedImg.css(mfp._getOffset(true));
                        mfp.wrap.append(animatedImg);
                        mfp.content.css('visibility', 'hidden');

                        setTimeout(function () {
                            animatedImg.css(mfp._getOffset());
                        }, 16);
                    }
                });

                _mfpOn(CLOSE_EVENT + ns, function () {
                    if (mfp._allowZoom()) {
                        showMainContent();
                        if (animatedImg) {
                            animatedImg.remove();
                        }
                        image = null;
                    }
                });
            },

            _allowZoom: function _allowZoom() {
                return mfp.currItem.type === 'image';
            },

            _getItemToZoom: function _getItemToZoom() {
                if (mfp.currItem.hasSize) {
                    return mfp.currItem.img;
                } else {
                    return false;
                }
            },

            // Get element postion relative to viewport
            _getOffset: function _getOffset(isLarge) {
                var el = void 0;
                if (isLarge) {
                    el = mfp.currItem.img;
                } else {
                    el = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem);
                }

                var offset = el.offset();
                var paddingTop = parseInt(el.css('padding-top'), 10);
                var paddingBottom = parseInt(el.css('padding-bottom'), 10);
                offset.top -= $(window).scrollTop() - paddingTop;


                /*
                
                            Animating left + top + width/height looks glitchy in Firefox, but perfect in Chrome. And vice-versa.
                
                             */
                var obj = {
                    width: el.width(),
                    // fix Zepto height+padding issue
                    height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
                };


                // I hate to do this, but there is no another option
                if (getHasMozTransform()) {
                    obj['-moz-transform'] = obj['transform'] = 'translate(' + offset.left + 'px,' + offset.top + 'px)';
                } else {
                    obj.left = offset.left;
                    obj.top = offset.top;
                }
                return obj;
            }
        }
    });





    /* >>zoom*/

    /* >>iframe*/

    var IFRAME_NS = 'iframe',
        _emptyPage = '//about:blank',

        _fixIframeBugs = function _fixIframeBugs(isShowing) {
            if (mfp.currTemplate[IFRAME_NS]) {
                var el = mfp.currTemplate[IFRAME_NS].find('iframe');
                if (el.length) {
                    // reset src after the popup is closed to avoid "video keeps playing after popup is closed" bug
                    if (!isShowing) {
                        el[0].src = _emptyPage;
                    }

                    // IE8 black screen bug fix
                    if (mfp.isIE8) {
                        el.css('display', isShowing ? 'block' : 'none');
                    }
                }
            }
        };

    $.magnificPopup.registerModule(IFRAME_NS, {

        options: {
            markup: '<div class="mfp-iframe-scaler">' +
                '<div class="mfp-close"></div>' +
                '<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>' +
                '</div>',

            srcAction: 'iframe_src',

            // we don't care and support only one default type of URL by default
            patterns: {
                youtube: {
                    index: 'youtube.com',
                    id: 'v=',
                    src: '//www.youtube.com/embed/%id%?autoplay=1'
                },

                vimeo: {
                    index: 'vimeo.com/',
                    id: '/',
                    src: '//player.vimeo.com/video/%id%?autoplay=1'
                },

                gmaps: {
                    index: '//maps.google.',
                    src: '%id%&output=embed'
                }
            }
        },




        proto: {
            initIframe: function initIframe() {
                mfp.types.push(IFRAME_NS);

                _mfpOn('BeforeChange', function (e, prevType, newType) {
                    if (prevType !== newType) {
                        if (prevType === IFRAME_NS) {
                            _fixIframeBugs();// iframe if removed
                        } else if (newType === IFRAME_NS) {
                            _fixIframeBugs(true);// iframe is showing
                        }
                    }// else {
                    // iframe source is switched, don't do anything
                    // }
                });

                _mfpOn(CLOSE_EVENT + '.' + IFRAME_NS, function () {
                    _fixIframeBugs();
                });
            },

            getIframe: function getIframe(item, template) {
                var embedSrc = item.src;
                var iframeSt = mfp.st.iframe;

                $.each(iframeSt.patterns, function () {
                    if (embedSrc.indexOf(this.index) > -1) {
                        if (this.id) {
                            if (typeof this.id === 'string') {
                                embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id) + this.id.length, embedSrc.length);
                            } else {
                                embedSrc = this.id.call(this, embedSrc);
                            }
                        }
                        embedSrc = this.src.replace('%id%', embedSrc);
                        return false;// break;
                    }
                });

                var dataObj = {};
                if (iframeSt.srcAction) {
                    dataObj[iframeSt.srcAction] = embedSrc;
                }
                mfp._parseMarkup(template, dataObj, item);

                mfp.updateStatus('ready');

                return template;
            }
        }
    });




    /* >>iframe*/

    /* >>gallery*/
    /**
     * Get looped index depending on number of slides
     */
    var _getLoopedId = function _getLoopedId(index) {
        var numSlides = mfp.items.length;
        if (index > numSlides - 1) {
            return index - numSlides;
        } else if (index < 0) {
            return numSlides + index;
        }
        return index;
    },
        _replaceCurrTotal = function _replaceCurrTotal(text, curr, total) {
            return text.replace(/%curr%/gi, curr + 1).replace(/%total%/gi, total);
        };

    $.magnificPopup.registerModule('gallery', {

        options: {
            enabled: false,
            arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
            preload: [0, 2],
            navigateByImgClick: true,
            arrows: true,

            tPrev: 'Previous (Left arrow key)',
            tNext: 'Next (Right arrow key)',
            tCounter: '%curr% of %total%'
        },


        proto: {
            initGallery: function initGallery() {
                var gSt = mfp.st.gallery,
                    ns = '.mfp-gallery',
                    supportsFastClick = Boolean($.fn.mfpFastClick);

                mfp.direction = true;// true - next, false - prev

                if (!gSt || !gSt.enabled) return false;

                _wrapClasses += ' mfp-gallery';

                _mfpOn(OPEN_EVENT + ns, function () {
                    if (gSt.navigateByImgClick) {
                        mfp.wrap.on('click' + ns, '.mfp-img', function () {
                            if (mfp.items.length > 1) {
                                mfp.next();
                                return false;
                            }
                        });
                    }

                    _document.on('keydown' + ns, function (e) {
                        if (e.keyCode === 37) {
                            mfp.prev();
                        } else if (e.keyCode === 39) {
                            mfp.next();
                        }
                    });
                });

                _mfpOn('UpdateStatus' + ns, function (e, data) {
                    if (data.text) {
                        data.text = _replaceCurrTotal(data.text, mfp.currItem.index, mfp.items.length);
                    }
                });

                _mfpOn(MARKUP_PARSE_EVENT + ns, function (e, element, values, item) {
                    var l = mfp.items.length;
                    values.counter = l > 1 ? _replaceCurrTotal(gSt.tCounter, item.index, l) : '';
                });

                _mfpOn('BuildControls' + ns, function () {
                    if (mfp.items.length > 1 && gSt.arrows && !mfp.arrowLeft) {
                        var markup = gSt.arrowMarkup,
                            arrowLeft = mfp.arrowLeft = $(markup.replace(/%title%/gi, gSt.tPrev).replace(/%dir%/gi, 'left')).addClass(PREVENT_CLOSE_CLASS),
                            arrowRight = mfp.arrowRight = $(markup.replace(/%title%/gi, gSt.tNext).replace(/%dir%/gi, 'right')).addClass(PREVENT_CLOSE_CLASS);

                        var eName = supportsFastClick ? 'mfpFastClick' : 'click';
                        arrowLeft[eName](function () {
                            mfp.prev();
                        });
                        arrowRight[eName](function () {
                            mfp.next();
                        });

                        // Polyfill for :before and :after (adds elements with classes mfp-a and mfp-b)
                        if (mfp.isIE7) {
                            _getEl('b', arrowLeft[0], false, true);
                            _getEl('a', arrowLeft[0], false, true);
                            _getEl('b', arrowRight[0], false, true);
                            _getEl('a', arrowRight[0], false, true);
                        }

                        mfp.container.append(arrowLeft.add(arrowRight));
                    }
                });

                _mfpOn(CHANGE_EVENT + ns, function () {
                    if (mfp._preloadTimeout) clearTimeout(mfp._preloadTimeout);

                    mfp._preloadTimeout = setTimeout(function () {
                        mfp.preloadNearbyImages();
                        mfp._preloadTimeout = null;
                    }, 16);
                });


                _mfpOn(CLOSE_EVENT + ns, function () {
                    _document.off(ns);
                    mfp.wrap.off('click' + ns);

                    if (mfp.arrowLeft && supportsFastClick) {
                        mfp.arrowLeft.add(mfp.arrowRight).destroyMfpFastClick();
                    }
                    mfp.arrowRight = mfp.arrowLeft = null;
                });
            },
            next: function next() {
                mfp.direction = true;
                mfp.index = _getLoopedId(mfp.index + 1);
                mfp.updateItemHTML();
            },
            prev: function prev() {
                mfp.direction = false;
                mfp.index = _getLoopedId(mfp.index - 1);
                mfp.updateItemHTML();
            },
            goTo: function goTo(newIndex) {
                mfp.direction = newIndex >= mfp.index;
                mfp.index = newIndex;
                mfp.updateItemHTML();
            },
            preloadNearbyImages: function preloadNearbyImages() {
                var p = mfp.st.gallery.preload,
                    preloadBefore = Math.min(p[0], mfp.items.length),
                    preloadAfter = Math.min(p[1], mfp.items.length),
                    i = void 0;

                for (i = 1; i <= (mfp.direction ? preloadAfter : preloadBefore); i++) {
                    mfp._preloadItem(mfp.index + i);
                }
                for (i = 1; i <= (mfp.direction ? preloadBefore : preloadAfter); i++) {
                    mfp._preloadItem(mfp.index - i);
                }
            },
            _preloadItem: function _preloadItem(index) {
                index = _getLoopedId(index);

                if (mfp.items[index].preloaded) {
                    return;
                }

                var item = mfp.items[index];
                if (!item.parsed) {
                    item = mfp.parseEl(index);
                }

                _mfpTrigger('LazyLoad', item);

                if (item.type === 'image') {
                    item.img = $('<img class="mfp-img" />').on('load.mfploader', function () {
                        item.hasSize = true;
                    }).on('error.mfploader', function () {
                        item.hasSize = true;
                        item.loadError = true;
                        _mfpTrigger('LazyLoadError', item);
                    }).attr('src', item.src);
                }


                item.preloaded = true;
            }
        }
    });



    /*
    Touch Support that might be implemented some day
    
    addSwipeGesture: function() {
        var startX,
            moved,
            multipleTouches;
    
            return;
    
        var namespace = '.mfp',
            addEventNames = function(pref, down, move, up, cancel) {
                mfp._tStart = pref + down + namespace;
                mfp._tMove = pref + move + namespace;
                mfp._tEnd = pref + up + namespace;
                mfp._tCancel = pref + cancel + namespace;
            };
    
        if(window.navigator.msPointerEnabled) {
            addEventNames('MSPointer', 'Down', 'Move', 'Up', 'Cancel');
        } else if('ontouchstart' in window) {
            addEventNames('touch', 'start', 'move', 'end', 'cancel');
        } else {
            return;
        }
        _window.on(mfp._tStart, function(e) {
            var oE = e.originalEvent;
            multipleTouches = moved = false;
            startX = oE.pageX || oE.changedTouches[0].pageX;
        }).on(mfp._tMove, function(e) {
            if(e.originalEvent.touches.length > 1) {
                multipleTouches = e.originalEvent.touches.length;
            } else {
                //e.preventDefault();
                moved = true;
            }
        }).on(mfp._tEnd + ' ' + mfp._tCancel, function(e) {
            if(moved && !multipleTouches) {
                var oE = e.originalEvent,
                    diff = startX - (oE.pageX || oE.changedTouches[0].pageX);
    
                if(diff > 20) {
                    mfp.next();
                } else if(diff < -20) {
                    mfp.prev();
                }
            }
        });
    },
    */


    /* >>gallery*/

    /* >>retina*/

    var RETINA_NS = 'retina';

    $.magnificPopup.registerModule(RETINA_NS, {
        options: {
            replaceSrc: function replaceSrc(item) {
                return item.src.replace(/\.\w+$/, function (m) {
                    return '@2x' + m;
                });
            },
            ratio: 1// Function or number.  Set to 1 to disable.
        },
        proto: {
            initRetina: function initRetina() {
                if (window.devicePixelRatio > 1) {
                    var st = mfp.st.retina,
                        ratio = st.ratio;

                    ratio = !isNaN(ratio) ? ratio : ratio();

                    if (ratio > 1) {
                        _mfpOn('ImageHasSize' + '.' + RETINA_NS, function (e, item) {
                            item.img.css({
                                'max-width': item.img[0].naturalWidth / ratio,
                                'width': '100%'
                            });

                        });
                        _mfpOn('ElementParse' + '.' + RETINA_NS, function (e, item) {
                            item.src = st.replaceSrc(item, ratio);
                        });
                    }
                }
            }
        }
    });



    /* >>retina*/

    /* >>fastclick*/
    /**
     * FastClick event implementation. (removes 300ms delay on touch devices)
     * Based on https://developers.google.com/mobile/articles/fast_buttons
     *
     * You may use it outside the Magnific Popup by calling just:
     *
     * $('.your-el').mfpFastClick(function() {
     *     console.log('Clicked!');
     * });
     *
     * To unbind:
     * $('.your-el').destroyMfpFastClick();
     *
     *
     * Note that it's a very basic and simple implementation, it blocks ghost click on the same element where it was bound.
     * If you need something more advanced, use plugin by FT Labs https://github.com/ftlabs/fastclick
     *
     */

    (function () {
        var ghostClickDelay = 1000,
            supportsTouch = 'ontouchstart' in window,
            unbindTouchMove = function unbindTouchMove() {
                _window.off('touchmove' + ns + ' touchend' + ns);
            },
            eName = 'mfpFastClick',
            ns = '.' + eName;


        // As Zepto.js doesn't have an easy way to add custom events (like jQuery), so we implement it in this way
        $.fn.mfpFastClick = function (callback) {
            return $(this).each(function () {
                var elem = $(this),
                    lock = void 0;

                if (supportsTouch) {
                    var timeout = void 0,
                        startX = void 0,
                        startY = void 0,
                        pointerMoved = void 0,
                        point = void 0,
                        numPointers = void 0;

                    elem.on('touchstart' + ns, function (e) {
                        pointerMoved = false;
                        numPointers = 1;

                        point = e.originalEvent ? e.originalEvent.touches[0] : e.touches[0];
                        startX = point.clientX;
                        startY = point.clientY;

                        _window.on('touchmove' + ns, function (e) {
                            point = e.originalEvent ? e.originalEvent.touches : e.touches;
                            numPointers = point.length;
                            point = point[0];
                            if (Math.abs(point.clientX - startX) > 10 ||
                                Math.abs(point.clientY - startY) > 10) {
                                pointerMoved = true;
                                unbindTouchMove();
                            }
                        }).on('touchend' + ns, function (e) {
                            unbindTouchMove();
                            if (pointerMoved || numPointers > 1) {
                                return;
                            }
                            lock = true;
                            e.preventDefault();
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                lock = false;
                            }, ghostClickDelay);
                            callback();
                        });
                    });
                }

                elem.on('click' + ns, function () {
                    if (!lock) {
                        callback();
                    }
                });
            });
        };

        $.fn.destroyMfpFastClick = function () {
            $(this).off('touchstart' + ns + ' click' + ns);
            if (supportsTouch) _window.off('touchmove' + ns + ' touchend' + ns);
        };
    })();

    /* >>fastclick*/
    _checkInstance();
});
'use strict';//
// Meerkat JS
// jquery.meerkat.1.3.js
// ==========================
jQuery.fn.extend({

    meerkat: function meerkat(options) {
        var defaults = {
            background: 'none',
            opacity: null,
            height: 'auto',
            width: '100%',
            position: 'bottom',
            close: '.close',
            dontShowAgain: '#dont-show',
            dontShowAgainAuto: false,
            animationIn: 'none',
            animationOut: null,
            easingIn: 'swing',
            easingOut: 'swing',
            animationSpeed: 'normal',
            cookieExpires: 0,
            removeCookie: '.removeCookie',
            delay: 0,
            onMeerkatShow: function onMeerkatShow() { },
            timer: null
        };


        var settings = jQuery.extend(defaults, options);


        if (jQuery.easing.def) {
            settings.easingIn = settings.easingIn;
            settings.easingOut = settings.easingOut;
        } else {
            settings.easingIn = 'swing';
            settings.easingOut = 'swing';
        }

        if (settings.animationOut === null) {
            settings.animationOut = settings.animationIn;
        }

        settings.delay = settings.delay * 1000;
        if (settings.timer != null) {
            settings.timer = settings.timer * 1000;
        }

        function createCookie(name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                var expires = '; expires=' + date.toGMTString();
            } else {
                var expires = '';
            }
            document.cookie = name + '=' + value + expires + '; path=/';
        }

        function readCookie(name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') { c = c.substring(1, c.length); }
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        function eraseCookie(name) {
            createCookie(name, '', -1);
        }
        jQuery(settings.removeCookie).click(function () {
            eraseCookie('meerkat');
        });

        return this.each(function () {
            var element = jQuery(this);
            if (readCookie('meerkat') != 'dontshow') {
                var


                    animateMeerkat = function animateMeerkat(showOrHide, fadeOrSlide) {
                        var meerkatWrap = jQuery('#meerkat-wrap');
                        if (fadeOrSlide === 'slide') {
                            if (settings.position === 'left' || settings.position === 'right') {
                                var animationType = 'width';
                            } else {
                                var animationType = 'height';
                            }
                        } else {
                            var animationType = 'opacity';
                        }
                        var animationProperty = {};
                        animationProperty[animationType] = showOrHide;

                        if (showOrHide === 'show') {
                            if (fadeOrSlide !== 'none') {
                                if (settings.delay > 0) {
                                    jQuery(meerkatWrap).hide().delay(settings.delay).animate(animationProperty, settings.animationSpeed, settings.easingIn);
                                } else {
                                    jQuery(meerkatWrap).hide().animate(animationProperty, settings.animationSpeed, settings.easingIn);
                                }
                            } else if (fadeOrSlide === 'none' && settings.delay > 0) {
                                jQuery(meerkatWrap).hide().delay(settings.delay).show(0);
                            } else {
                                jQuery(meerkatWrap).show();
                            }
                            jQuery(element).show(0);
                        }

                        if (showOrHide === 'hide') {
                            if (fadeOrSlide !== 'none') {
                                if (settings.timer !== null) {
                                    jQuery(meerkatWrap).delay(settings.timer).animate(animationProperty, settings.animationSpeed, settings.easingOut,
                                        function () {
                                            jQuery(this).destroyMeerkat();
                                            if (settings.dontShowAgainAuto === true) {
                                                createCookie('meerkat', 'dontshow', settings.cookieExpires);
                                            }
                                        });
                                }
                                jQuery(settings.close).click(function () {
                                    jQuery(meerkatWrap).stop().animate(animationProperty, settings.animationSpeed, settings.easingOut, function () {
                                        jQuery(this).destroyMeerkat();
                                    });
                                    return false;
                                });
                                jQuery(settings.dontShowAgain).click(function () {
                                    jQuery(meerkatWrap).stop().animate(animationProperty, settings.animationSpeed, settings.easingOut, function () {
                                        jQuery(this).destroyMeerkat();
                                    });
                                    createCookie('meerkat', 'dontshow', settings.cookieExpires);
                                    return false;
                                });
                            } else if (fadeOrSlide === 'none' && settings.timer !== null) {
                                jQuery(meerkatWrap).delay(settings.timer).hide(0).queue(function () {
                                    jQuery(this).destroyMeerkat();
                                });
                            } else {
                                jQuery(settings.close).click(function () {
                                    jQuery(meerkatWrap).hide().queue(function () {
                                        jQuery(this).destroyMeerkat();
                                    });
                                    return false;
                                });
                                jQuery(settings.dontShowAgain).click(function () {
                                    jQuery(meerkatWrap).hide().queue(function () {
                                        jQuery(this).destroyMeerkat();
                                    });
                                    createCookie('meerkat', 'dontshow', settings.cookieExpires);
                                    return false;
                                });
                            }
                        }
                    }; settings.onMeerkatShow.call(this);


                jQuery('html, body').css({ 'margin': '0', 'height': '100%' });
                jQuery(element).wrap('<div id="meerkat-wrap"><div id="meerkat-container"></div></div>');
                jQuery('#meerkat-wrap').css({ 'position': 'fixed', 'z-index': '10000', 'width': settings.width, 'height': settings.height }).css(settings.position, '0');
                jQuery('#meerkat-container').css({ 'background': settings.background, 'height': settings.height });

                if (settings.position === 'left' || settings.position === 'right') {
                    jQuery('#meerkat-wrap').css('top', 0);
                }

                if (settings.opacity != null) {
                    jQuery('#meerkat-wrap').prepend('<div class="opacity-layer"></div>');
                    jQuery('#meerkat-container').css({ 'background': 'transparent', 'z-index': '2', 'position': 'relative' });
                    jQuery('.opacity-layer').css({
                        'position': 'absolute',
                        'top': '0',
                        'height': '100%',
                        'width': '100%',
                        'background': settings.background,
                        'opacity': settings.opacity
                    });

                }
                if (jQuery.browser.msie && jQuery.browser.version <= 6) {
                    jQuery('#meerkat-wrap').css({ 'position': 'absolute', 'bottom': '-1px', 'z-index': '0' });
                    if (jQuery('#ie6-content-container').length == 0) {
                        jQuery('body').children().
                            filter(function (index) {
                                return jQuery(this).attr('id') != 'meerkat-wrap';
                            }).
                            wrapAll('<div id="ie6-content-container"></div>');
                        jQuery('html, body').css({ 'height': '100%', 'width': '100%', 'overflow': 'hidden' });
                        jQuery('#ie6-content-container').css({ 'overflow': 'auto', 'width': '100%', 'height': '100%', 'position': 'absolute' });
                        var bgProperties = document.body.currentStyle.backgroundColor + ' ';
                        bgProperties += document.body.currentStyle.backgroundImage + ' ';
                        bgProperties += document.body.currentStyle.backgroundRepeat + ' ';
                        bgProperties += document.body.currentStyle.backgroundAttachment + ' ';
                        bgProperties += document.body.currentStyle.backgroundPositionX + ' ';
                        bgProperties += document.body.currentStyle.backgroundPositionY;
                        jQuery('body').css({ 'background': 'none' });
                        jQuery('#ie6-content-container').css({ 'background': bgProperties });
                    }
                    var ie6ContentContainer = document.getElementById('ie6-content-container');
                    if (ie6ContentContainer.clientHeight < ie6ContentContainer.scrollHeight && settings.position != 'left') {
                        jQuery('#meerkat-wrap').css({ 'right': '17px' });
                    }
                }

                switch (settings.animationIn) {
                    case 'slide':
                        animateMeerkat('show', 'slide');
                        break;
                    case 'fade':
                        animateMeerkat('show', 'fade');
                        break;
                    case 'none':
                        animateMeerkat('show', 'none');
                        break;
                    default:
                        alert('The animationIn option only accepts "slide", "fade", or "none"');
                }


                switch (settings.animationOut) {
                    case 'slide':
                        animateMeerkat('hide', 'slide');
                        break;

                    case 'fade':
                        animateMeerkat('hide', 'fade');
                        break;

                    case 'none':
                        if (settings.timer != null) {
                            jQuery('#meerkat-wrap').delay(settings.timer).hide(0).queue(function () {
                                jQuery(this).destroyMeerkat();
                            });
                        }
                        jQuery(settings.close).click(function () {
                            jQuery('#meerkat-wrap').hide().queue(function () {
                                jQuery(this).destroyMeerkat();
                            });
                        });
                        jQuery(settings.dontShowAgain).click(function () {
                            jQuery('#meerkat-wrap').hide().queue(function () {
                                jQuery(this).destroyMeerkat();
                            });
                            createCookie('meerkat', 'dontshow', settings.cookieExpires);
                        });
                        break;

                    default:
                        alert('The animationOut option only accepts "slide", "fade", or "none"');
                }

            } else {
                jQuery(element).hide();
            }
        });
    },
    destroyMeerkat: function destroyMeerkat() {
        jQuery('#meerkat-wrap').replaceWith(jQuery('#meerkat-container').contents().hide());
    }
});
'use strict'; var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };/* ! Picturefill - v2.3.1 - 2015-04-09
* http://scottjehl.github.io/picturefill
* Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT */
window.matchMedia || (window.matchMedia = function () {
    'use strict'; var a = window.styleMedia || window.media; if (!a) {
        var b = document.createElement('style'), c = document.getElementsByTagName('script')[0], d = null; b.type = 'text/css', b.id = 'matchmediajs-test', c.parentNode.insertBefore(b, c), d = 'getComputedStyle' in window && window.getComputedStyle(b, null) || b.currentStyle, a = {
            matchMedium: function matchMedium(a) {
                var c = '@media ' + a + '{ #matchmediajs-test { width: 1px; } }'; return b.styleSheet ? b.styleSheet.cssText = c : b.textContent = c, '1px' === d.width;
            }
        };
    } return function (b) {
        return { matches: a.matchMedium(b || 'all'), media: b || 'all' };
    };
}()), function (a, b, c) {
    'use strict'; function d(b) {
        'object' == (typeof module === 'undefined' ? 'undefined' : _typeof(module)) && 'object' == _typeof(module.exports) ? module.exports = b : 'function' == typeof define && define.amd && define('picturefill', function () {
            return b;
        }), 'object' == (typeof a === 'undefined' ? 'undefined' : _typeof(a)) && (a.picturefill = b);
    } function e(a) {
        var b = void 0, c = void 0, d = void 0, e = void 0, f = void 0, i = a || {}; b = i.elements || g.getAllElements(); for (var j = 0, k = b.length; k > j; j++) {
            if (c = b[j], d = c.parentNode, e = void 0, f = void 0, 'IMG' === c.nodeName.toUpperCase() && (c[g.ns] || (c[g.ns] = {}), i.reevaluate || !c[g.ns].evaluated)) {
                if (d && 'PICTURE' === d.nodeName.toUpperCase()) {
                    if (g.removeVideoShim(d), e = g.getMatch(c, d), e === !1) continue;
                } else e = void 0; (d && 'PICTURE' === d.nodeName.toUpperCase() || !g.sizesSupported && c.srcset && h.test(c.srcset)) && g.dodgeSrcset(c), e ? (f = g.processSourceSet(e), g.applyBestCandidate(f, c)) : (f = g.processSourceSet(c), (void 0 === c.srcset || c[g.ns].srcset) && g.applyBestCandidate(f, c)), c[g.ns].evaluated = !0;
            }
        }
    } function f() {
        function c() {
            clearTimeout(d), d = setTimeout(h, 60);
        } g.initTypeDetects(), e(); var d, f = setInterval(function () {
            return e(), /^loaded|^i|^c/.test(b.readyState) ? void clearInterval(f) : void 0;
        }, 250), h = function h() {
            e({ reevaluate: !0 });
        }; a.addEventListener ? a.addEventListener('resize', c, !1) : a.attachEvent && a.attachEvent('onresize', c);
    } if (a.HTMLPictureElement) return void d(function () { }); b.createElement('picture'); var g = a.picturefill || {}, h = /\s+\+?\d+(e\d+)?w/; g.ns = 'picturefill', function () {
        g.srcsetSupported = 'srcset' in c, g.sizesSupported = 'sizes' in c, g.curSrcSupported = 'currentSrc' in c;
    }(), g.trim = function (a) {
        return a.trim ? a.trim() : a.replace(/^\s+|\s+$/g, '');
    }, g.makeUrl = function () {
        var a = b.createElement('a'); return function (b) {
            return a.href = b, a.href;
        };
    }(), g.restrictsMixedContent = function () {
        return 'https:' === a.location.protocol;
    }, g.matchesMedia = function (b) {
        return a.matchMedia && a.matchMedia(b).matches;
    }, g.getDpr = function () {
        return a.devicePixelRatio || 1;
    }, g.getWidthFromLength = function (a) {
        var c = void 0; if (!a || a.indexOf('%') > -1 != !1 || !(parseFloat(a) > 0 || a.indexOf('calc(') > -1)) return !1; a = a.replace('vw', '%'), g.lengthEl || (g.lengthEl = b.createElement('div'), g.lengthEl.style.cssText = 'border:0;display:block;font-size:1em;left:0;margin:0;padding:0;position:absolute;visibility:hidden', g.lengthEl.className = 'helper-from-picturefill-js'), g.lengthEl.style.width = '0px'; try {
            g.lengthEl.style.width = a;
        } catch (d) { } return b.body.appendChild(g.lengthEl), c = g.lengthEl.offsetWidth, 0 >= c && (c = !1), b.body.removeChild(g.lengthEl), c;
    }, g.detectTypeSupport = function (b, c) {
        var d = new a.Image(); return d.onerror = function () {
            g.types[b] = !1, e();
        }, d.onload = function () {
            g.types[b] = 1 === d.width, e();
        }, d.src = c, 'pending';
    }, g.types = g.types || {}, g.initTypeDetects = function () {
        g.types['image/jpeg'] = !0, g.types['image/gif'] = !0, g.types['image/png'] = !0, g.types['image/svg+xml'] = b.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image', '1.1'), g.types['image/webp'] = g.detectTypeSupport('image/webp', 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=');
    }, g.verifyTypeSupport = function (a) {
        var b = a.getAttribute('type'); if (null === b || '' === b) return !0; var c = g.types[b]; return 'string' == typeof c && 'pending' !== c ? (g.types[b] = g.detectTypeSupport(b, c), 'pending') : 'function' == typeof c ? (c(), 'pending') : c;
    }, g.parseSize = function (a) {
        var b = /(\([^)]+\))?\s*(.+)/g.exec(a); return { media: b && b[1], length: b && b[2] };
    }, g.findWidthFromSourceSize = function (c) {
        for (var d, e = g.trim(c).split(/\s*,\s*/), f = 0, h = e.length; h > f; f++) {
            var i = e[f], j = g.parseSize(i), k = j.length, l = j.media; if (k && (!l || g.matchesMedia(l)) && (d = g.getWidthFromLength(k))) break;
        } return d || Math.max(a.innerWidth || 0, b.documentElement.clientWidth);
    }, g.parseSrcset = function (a) {
        for (var b = []; '' !== a;) {
            a = a.replace(/^\s+/g, ''); var c, d = a.search(/\s/g), e = null; if (-1 !== d) {
                c = a.slice(0, d); var _f = c.slice(-1); if ((',' === _f || '' === c) && (c = c.replace(/,+$/, ''), e = ''), a = a.slice(d + 1), null === e) {
                    var _g = a.indexOf(','); -1 !== _g ? (e = a.slice(0, _g), a = a.slice(_g + 1)) : (e = a, a = '');
                }
            } else c = a, a = ''; (c || e) && b.push({ url: c, descriptor: e });
        } return b;
    }, g.parseDescriptor = function (a, b) {
        var c = void 0, d = b || '100vw', e = a && a.replace(/(^\s+|\s+$)/g, ''), f = g.findWidthFromSourceSize(d); if (e) for (var _h = e.split(' '), i = _h.length - 1; i >= 0; i--) {
            var j = _h[i], k = j && j.slice(j.length - 1); if ('h' !== k && 'w' !== k || g.sizesSupported) {
                if ('x' === k) {
                    var l = j && parseFloat(j, 10); c = l && !isNaN(l) ? l : 1;
                }
            } else c = parseFloat(parseInt(j, 10) / f);
        } return c || 1;
    }, g.getCandidatesFromSourceSet = function (a, b) {
        for (var c = g.parseSrcset(a), d = [], e = 0, f = c.length; f > e; e++) {
            var _h2 = c[e]; d.push({ url: _h2.url, resolution: g.parseDescriptor(_h2.descriptor, b) });
        } return d;
    }, g.dodgeSrcset = function (a) {
        a.srcset && (a[g.ns].srcset = a.srcset, a.srcset = '', a.setAttribute('data-pfsrcset', a[g.ns].srcset));
    }, g.processSourceSet = function (a) {
        var b = a.getAttribute('srcset'), c = a.getAttribute('sizes'), d = []; return 'IMG' === a.nodeName.toUpperCase() && a[g.ns] && a[g.ns].srcset && (b = a[g.ns].srcset), b && (d = g.getCandidatesFromSourceSet(b, c)), d;
    }, g.backfaceVisibilityFix = function (a) {
        var b = a.style || {}, c = 'webkitBackfaceVisibility' in b, d = b.zoom; c && (b.zoom = '.999', c = a.offsetWidth, b.zoom = d);
    }, g.setIntrinsicSize = function () {
        var c = {}, d = function d(a, b, c) {
            b && a.setAttribute('width', parseInt(b / c, 10));
        }; return function (e, f) {
            var h = void 0; e[g.ns] && !a.pfStopIntrinsicSize && (void 0 === e[g.ns].dims && (e[g.ns].dims = e.getAttribute('width') || e.getAttribute('height')), e[g.ns].dims || (f.url in c ? d(e, c[f.url], f.resolution) : (h = b.createElement('img'), h.onload = function () {
                if (c[f.url] = h.width, !c[f.url]) try {
                    b.body.appendChild(h), c[f.url] = h.width || h.offsetWidth, b.body.removeChild(h);
                } catch (a) { } e.src === f.url && d(e, c[f.url], f.resolution), e = null, h.onload = null, h = null;
            }, h.src = f.url)));
        };
    }(), g.applyBestCandidate = function (a, b) {
        var c = void 0, d = void 0, e = void 0; a.sort(g.ascendingSort), d = a.length, e = a[d - 1]; for (var _f2 = 0; d > _f2; _f2++) {
            if (c = a[_f2], c.resolution >= g.getDpr()) {
                e = c; break;
            }
        } e && (e.url = g.makeUrl(e.url), b.src !== e.url && (g.restrictsMixedContent() && 'http:' === e.url.substr(0, 'http:'.length).toLowerCase() ? void 0 !== window.console && console.warn('Blocked mixed content image ' + e.url) : (b.src = e.url, g.curSrcSupported || (b.currentSrc = b.src), g.backfaceVisibilityFix(b))), g.setIntrinsicSize(b, e));
    }, g.ascendingSort = function (a, b) {
        return a.resolution - b.resolution;
    }, g.removeVideoShim = function (a) {
        var b = a.getElementsByTagName('video'); if (b.length) {
            for (var c = b[0], d = c.getElementsByTagName('source'); d.length;) { a.insertBefore(d[0], c); } c.parentNode.removeChild(c);
        }
    }, g.getAllElements = function () {
        for (var a = [], c = b.getElementsByTagName('img'), d = 0, e = c.length; e > d; d++) {
            var _f3 = c[d]; ('PICTURE' === _f3.parentNode.nodeName.toUpperCase() || null !== _f3.getAttribute('srcset') || _f3[g.ns] && null !== _f3[g.ns].srcset) && a.push(_f3);
        } return a;
    }, g.getMatch = function (a, b) {
        for (var c, d = b.childNodes, e = 0, f = d.length; f > e; e++) {
            var _h3 = d[e]; if (1 === _h3.nodeType) {
                if (_h3 === a) return c; if ('SOURCE' === _h3.nodeName.toUpperCase()) {
                    null !== _h3.getAttribute('src') && void 0 !== (typeof console === 'undefined' ? 'undefined' : _typeof(console)) && console.warn('The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.'); var i = _h3.getAttribute('media'); if (_h3.getAttribute('srcset') && (!i || g.matchesMedia(i))) {
                        var j = g.verifyTypeSupport(_h3); if (j === !0) {
                            c = _h3; break;
                        } if ('pending' === j) return !1;
                    }
                }
            }
        } return c;
    }, f(), e._ = g, d(e);
}(window, window.document, new window.Image());
/* ! http://mths.be/placeholder v2.0.8 by @mathias */
// !function(a,b,c){function d(a){var b={},d=/^jQuery\d+$/;return c.each(a.attributes,function(a,c){c.specified&&!d.test(c.name)&&(b[c.name]=c.value)}),b}function e(a,b){var d=this,e=c(d);if(d.value==e.attr("placeholder")&&e.hasClass("placeholder"))if(e.data("placeholder-password")){if(e=e.hide().next().show().attr("id",e.removeAttr("id").data("placeholder-id")),a===!0)return e[0].value=b;e.focus()}else d.value="",e.removeClass("placeholder"),d==g()&&d.select()}function f(){var a,b=this,f=c(b),g=this.id;if(""==b.value){if("password"==b.type){if(!f.data("placeholder-textinput")){try{a=f.clone().attr({type:"text"})}catch(h){a=c("<input>").attr(c.extend(d(this),{type:"text"}))}a.removeAttr("name").data({"placeholder-password":f,"placeholder-id":g}).bind("focus.placeholder",e),f.data({"placeholder-textinput":a,"placeholder-id":g}).before(a)}f=f.removeAttr("id").hide().prev().attr("id",g).show()}f.addClass("placeholder"),f[0].value=f.attr("placeholder")}else f.removeClass("placeholder")}function g(){try{return b.activeElement}catch(a){}}var h,i,j="[object OperaMini]"==Object.prototype.toString.call(a.operamini),k="placeholder"in b.createElement("input")&&!j,l="placeholder"in b.createElement("textarea")&&!j,m=c.fn,n=c.valHooks,o=c.propHooks;k&&l?(i=m.placeholder=function(){return this},i.input=i.textarea=!0):(i=m.placeholder=function(){var a=this;return a.filter((k?"textarea":":input")+"[placeholder]").not(".placeholder").bind({"focus.placeholder":e,"blur.placeholder":f}).data("placeholder-enabled",!0).trigger("blur.placeholder"),a},i.input=k,i.textarea=l,h={get:function(a){var b=c(a),d=b.data("placeholder-password");return d?d[0].value:b.data("placeholder-enabled")&&b.hasClass("placeholder")?"":a.value},set:function(a,b){var d=c(a),h=d.data("placeholder-password");return h?h[0].value=b:d.data("placeholder-enabled")?(""==b?(a.value=b,a!=g()&&f.call(a)):d.hasClass("placeholder")?e.call(a,!0,b)||(a.value=b):a.value=b,d):a.value=b}},k||(n.input=h,o.value=h),l||(n.textarea=h,o.value=h),c(function(){c(b).delegate("form","submit.placeholder",function(){var a=c(".placeholder",this).each(e);setTimeout(function(){a.each(f)},10)})}),c(a).bind("beforeunload.placeholder",function(){c(".placeholder").each(function(){this.value=""})}))}(this,document,jQuery);
"use strict";
"use strict"; var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f; } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e); }, l, l.exports, e, t, n, r); } return n[o].exports; } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++) { s(r[o]); } return s; })({
    1: [function (require, module, exports) {
        // Copyright (c) 2017 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        // ┌────────────────────────────────────────────────────────────┐ \\
        // │ Eve 0.5.4 - JavaScript Events Library                      │ \\
        // ├────────────────────────────────────────────────────────────┤ \\
        // │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
        // └────────────────────────────────────────────────────────────┘ \\

        (function (glob) {
            var version = "0.5.4",
                has = "hasOwnProperty",
                separator = /[\.\/]/,
                comaseparator = /\s*,\s*/,
                wildcard = "*",
                numsort = function numsort(a, b) {
                    return a - b;
                },
                current_event,
                stop,
                events = { n: {} },
                firstDefined = function firstDefined() {
                    for (var i = 0, ii = this.length; i < ii; i++) {
                        if (typeof this[i] != "undefined") {
                            return this[i];
                        }
                    }
                },
                lastDefined = function lastDefined() {
                    var i = this.length;
                    while (--i) {
                        if (typeof this[i] != "undefined") {
                            return this[i];
                        }
                    }
                },
                objtos = Object.prototype.toString,
                Str = String,
                isArray = Array.isArray || function (ar) {
                    return ar instanceof Array || objtos.call(ar) == "[object Array]";
                },
                /*\
                     * eve
                     [ method ]
                
                     * Fires event with given `name`, given scope and other parameters.
                
                     - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
                     - scope (object) context for the event handlers
                     - varargs (...) the rest of arguments will be sent to event handlers
                
                     = (object) array of returned values from the listeners. Array has two methods `.firstDefined()` and `.lastDefined()` to get first or last not `undefined` value.
                    \*/
                eve = function eve(name, scope) {
                    var oldstop = stop,
                        args = Array.prototype.slice.call(arguments, 2),
                        listeners = eve.listeners(name),
                        z = 0,
                        l,
                        indexed = [],
                        queue = {},
                        out = [],
                        ce = current_event;
                    out.firstDefined = firstDefined;
                    out.lastDefined = lastDefined;
                    current_event = name;
                    stop = 0;
                    for (var i = 0, ii = listeners.length; i < ii; i++) {
                        if ("zIndex" in listeners[i]) {
                            indexed.push(listeners[i].zIndex);
                            if (listeners[i].zIndex < 0) {
                                queue[listeners[i].zIndex] = listeners[i];
                            }
                        }
                    }
                    indexed.sort(numsort);
                    while (indexed[z] < 0) {
                        l = queue[indexed[z++]];
                        out.push(l.apply(scope, args));
                        if (stop) {
                            stop = oldstop;
                            return out;
                        }
                    }
                    for (i = 0; i < ii; i++) {
                        l = listeners[i];
                        if ("zIndex" in l) {
                            if (l.zIndex == indexed[z]) {
                                out.push(l.apply(scope, args));
                                if (stop) {
                                    break;
                                }
                                do {
                                    z++;
                                    l = queue[indexed[z]];
                                    l && out.push(l.apply(scope, args));
                                    if (stop) {
                                        break;
                                    }
                                } while (l);
                            } else {
                                queue[l.zIndex] = l;
                            }
                        } else {
                            out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        }
                    }
                    stop = oldstop;
                    current_event = ce;
                    return out;
                };
            // Undocumented. Debug only.
            eve._events = events;
            /*\
                 * eve.listeners
                 [ method ]
            
                 * Internal method which gives you array of all event handlers that will be triggered by the given `name`.
            
                 - name (string) name of the event, dot (`.`) or slash (`/`) separated
            
                 = (array) array of event handlers
                \*/
            eve.listeners = function (name) {
                var names = isArray(name) ? name : name.split(separator),
                    e = events,
                    item,
                    items,
                    k,
                    i,
                    ii,
                    j,
                    jj,
                    nes,
                    es = [e],
                    out = [];
                for (i = 0, ii = names.length; i < ii; i++) {
                    nes = [];
                    for (j = 0, jj = es.length; j < jj; j++) {
                        e = es[j].n;
                        items = [e[names[i]], e[wildcard]];
                        k = 2;
                        while (k--) {
                            item = items[k];
                            if (item) {
                                nes.push(item);
                                out = out.concat(item.f || []);
                            }
                        }
                    }
                    es = nes;
                }
                return out;
            };
            /*\
                 * eve.separator
                 [ method ]
            
                 * If for some reasons you don’t like default separators (`.` or `/`) you can specify yours
                 * here. Be aware that if you pass a string longer than one character it will be treated as
                 * a list of characters.
            
                 - separator (string) new separator. Empty string resets to default: `.` or `/`.
                \*/
            eve.separator = function (sep) {
                if (sep) {
                    sep = Str(sep).replace(/(?=[\.\^\]\[\-])/g, "\\");
                    sep = "[" + sep + "]";
                    separator = new RegExp(sep);
                } else {
                    separator = /[\.\/]/;
                }
            };
            /*\
                 * eve.on
                 [ method ]
                 **
                 * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
                 | eve.on("*.under.*", f);
                 | eve("mouse.under.floor"); // triggers f
                 * Use @eve to trigger the listener.
                 **
                 - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
                 - f (function) event handler function
                 **
                 - name (array) if you don’t want to use separators, you can use array of strings
                 - f (function) event handler function
                 **
                 = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment.
                 > Example:
                 | eve.on("mouse", eatIt)(2);
                 | eve.on("mouse", scream);
                 | eve.on("mouse", catchIt)(1);
                 * This will ensure that `catchIt` function will be called before `eatIt`.
                 *
                 * If you want to put your handler before non-indexed handlers, specify a negative value.
                 * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
                \*/
            eve.on = function (name, f) {
                if (typeof f != "function") {
                    return function () { };
                }
                var names = isArray(name) ? isArray(name[0]) ? name : [name] : Str(name).split(comaseparator);
                for (var i = 0, ii = names.length; i < ii; i++) {
                    (function (name) {
                        var names = isArray(name) ? name : Str(name).split(separator),
                            e = events,
                            exist;
                        for (var i = 0, ii = names.length; i < ii; i++) {
                            e = e.n;
                            e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = { n: {} });
                        }
                        e.f = e.f || [];
                        for (i = 0, ii = e.f.length; i < ii; i++) {
                            if (e.f[i] == f) {
                                exist = true;
                                break;
                            }
                        }
                        !exist && e.f.push(f);
                    })(names[i]);
                }
                return function (zIndex) {
                    if (+zIndex == +zIndex) {
                        f.zIndex = +zIndex;
                    }
                };
            };
            /*\
                 * eve.f
                 [ method ]
                 **
                 * Returns function that will fire given event with optional arguments.
                 * Arguments that will be passed to the result function will be also
                 * concated to the list of final arguments.
                 | el.onclick = eve.f("click", 1, 2);
                 | eve.on("click", function (a, b, c) {
                 |     console.log(a, b, c); // 1, 2, [event object]
                 | });
                 - event (string) event name
                 - varargs (…) and any other arguments
                 = (function) possible event handler function
                \*/
            eve.f = function (event) {
                var attrs = [].slice.call(arguments, 1);
                return function () {
                    eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
                };
            };
            /*\
                 * eve.stop
                 [ method ]
                 **
                 * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
                \*/
            eve.stop = function () {
                stop = 1;
            };
            /*\
                 * eve.nt
                 [ method ]
                 **
                 * Could be used inside event handler to figure out actual name of the event.
                 **
                 - subname (string) #optional subname of the event
                 **
                 = (string) name of the event, if `subname` is not specified
                 * or
                 = (boolean) `true`, if current event’s name contains `subname`
                \*/
            eve.nt = function (subname) {
                var cur = isArray(current_event) ? current_event.join(".") : current_event;
                if (subname) {
                    return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(cur);
                }
                return cur;
            };
            /*\
                 * eve.nts
                 [ method ]
                 **
                 * Could be used inside event handler to figure out actual name of the event.
                 **
                 **
                 = (array) names of the event
                \*/
            eve.nts = function () {
                return isArray(current_event) ? current_event : current_event.split(separator);
            };
            /*\
                 * eve.off
                 [ method ]
                 **
                 * Removes given function from the list of event listeners assigned to given name.
                 * If no arguments specified all the events will be cleared.
                 **
                 - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
                 - f (function) event handler function
                \*/
            /*\
                 * eve.unbind
                 [ method ]
                 **
                 * See @eve.off
                \*/
            eve.off = eve.unbind = function (name, f) {
                if (!name) {
                    eve._events = events = { n: {} };
                    return;
                }
                var names = isArray(name) ? isArray(name[0]) ? name : [name] : Str(name).split(comaseparator);
                if (names.length > 1) {
                    for (var i = 0, ii = names.length; i < ii; i++) {
                        eve.off(names[i], f);
                    }
                    return;
                }
                names = isArray(name) ? name : Str(name).split(separator);
                var e,
                    key,
                    splice,
                    i, ii, j, jj,
                    cur = [events],
                    inodes = [];
                for (i = 0, ii = names.length; i < ii; i++) {
                    for (j = 0; j < cur.length; j += splice.length - 2) {
                        splice = [j, 1];
                        e = cur[j].n;
                        if (names[i] != wildcard) {
                            if (e[names[i]]) {
                                splice.push(e[names[i]]);
                                inodes.unshift({
                                    n: e,
                                    name: names[i]
                                });

                            }
                        } else {
                            for (key in e) {
                                if (e[has](key)) {
                                    splice.push(e[key]);
                                    inodes.unshift({
                                        n: e,
                                        name: key
                                    });

                                }
                            }
                        }
                        cur.splice.apply(cur, splice);
                    }
                }
                for (i = 0, ii = cur.length; i < ii; i++) {
                    e = cur[i];
                    while (e.n) {
                        if (f) {
                            if (e.f) {
                                for (j = 0, jj = e.f.length; j < jj; j++) {
                                    if (e.f[j] == f) {
                                        e.f.splice(j, 1);
                                        break;
                                    }
                                }
                                !e.f.length && delete e.f;
                            }
                            for (key in e.n) {
                                if (e.n[has](key) && e.n[key].f) {
                                    var funcs = e.n[key].f;
                                    for (j = 0, jj = funcs.length; j < jj; j++) {
                                        if (funcs[j] == f) {
                                            funcs.splice(j, 1);
                                            break;
                                        }
                                    }
                                    !funcs.length && delete e.n[key].f;
                                }
                            }
                        } else {
                            delete e.f;
                            for (key in e.n) {
                                if (e.n[has](key) && e.n[key].f) {
                                    delete e.n[key].f;
                                }
                            }
                        }
                        e = e.n;
                    }
                }
                // prune inner nodes in path
                prune: for (i = 0, ii = inodes.length; i < ii; i++) {
                    e = inodes[i];
                    for (key in e.n[e.name].f) {
                        // not empty (has listeners)
                        continue prune;
                    }
                    for (key in e.n[e.name].n) {
                        // not empty (has children)
                        continue prune;
                    }
                    // is empty
                    delete e.n[e.name];
                }
            };
            /*\
                 * eve.once
                 [ method ]
                 **
                 * Binds given event handler with a given name to only run once then unbind itself.
                 | eve.once("login", f);
                 | eve("login"); // triggers f
                 | eve("login"); // no listeners
                 * Use @eve to trigger the listener.
                 **
                 - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
                 - f (function) event handler function
                 **
                 = (function) same return function as @eve.on
                \*/
            eve.once = function (name, f) {
                var f2 = function f2() {
                    eve.off(name, f2);
                    return f.apply(this, arguments);
                };
                return eve.on(name, f2);
            };
            /*\
                 * eve.version
                 [ property (string) ]
                 **
                 * Current version of the library.
                \*/
            eve.version = version;
            eve.toString = function () {
                return "You are running Eve " + version;
            };
            glob.eve = eve;
            typeof module != "undefined" && module.exports ? module.exports = eve : typeof define === "function" && define.amd ? define("eve", [], function () { return eve; }) : glob.eve = eve;
        })(typeof window != "undefined" ? window : this);

    }, {}], 2: [function (require, module, exports) {
        window.eve = require('eve');

        // Copyright (c) 2017 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        var mina = function (eve) {
            var animations = {},
                requestAnimFrame = window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (callback) {
                        setTimeout(callback, 16, new Date().getTime());
                        return true;
                    },
                requestID,
                isArray = Array.isArray || function (a) {
                    return a instanceof Array ||
                        Object.prototype.toString.call(a) == "[object Array]";
                },
                idgen = 0,
                idprefix = "M" + (+new Date()).toString(36),
                ID = function ID() {
                    return idprefix + (idgen++).toString(36);
                },
                diff = function diff(a, b, A, B) {
                    if (isArray(a)) {
                        res = [];
                        for (var i = 0, ii = a.length; i < ii; i++) {
                            res[i] = diff(a[i], b, A[i], B);
                        }
                        return res;
                    }
                    var dif = (A - a) / (B - b);
                    return function (bb) {
                        return a + dif * (bb - b);
                    };
                },
                timer = Date.now || function () {
                    return +new Date();
                },
                sta = function sta(val) {
                    var a = this;
                    if (val == null) {
                        return a.s;
                    }
                    var ds = a.s - val;
                    a.b += a.dur * ds;
                    a.B += a.dur * ds;
                    a.s = val;
                },
                speed = function speed(val) {
                    var a = this;
                    if (val == null) {
                        return a.spd;
                    }
                    a.spd = val;
                },
                duration = function duration(val) {
                    var a = this;
                    if (val == null) {
                        return a.dur;
                    }
                    a.s = a.s * val / a.dur;
                    a.dur = val;
                },
                stopit = function stopit() {
                    var a = this;
                    delete animations[a.id];
                    a.update();
                    eve("mina.stop." + a.id, a);
                },
                pause = function pause() {
                    var a = this;
                    if (a.pdif) {
                        return;
                    }
                    delete animations[a.id];
                    a.update();
                    a.pdif = a.get() - a.b;
                },
                resume = function resume() {
                    var a = this;
                    if (!a.pdif) {
                        return;
                    }
                    a.b = a.get() - a.pdif;
                    delete a.pdif;
                    animations[a.id] = a;
                    frame();
                },
                update = function update() {
                    var a = this,
                        res;
                    if (isArray(a.start)) {
                        res = [];
                        for (var j = 0, jj = a.start.length; j < jj; j++) {
                            res[j] = +a.start[j] +
                                (a.end[j] - a.start[j]) * a.easing(a.s);
                        }
                    } else {
                        res = +a.start + (a.end - a.start) * a.easing(a.s);
                    }
                    a.set(res);
                },
                frame = function frame(timeStamp) {
                    // Manual invokation?
                    if (!timeStamp) {
                        // Frame loop stopped?
                        if (!requestID) {
                            // Start frame loop...
                            requestID = requestAnimFrame(frame);
                        }
                        return;
                    }
                    var len = 0;
                    for (var i in animations) {
                        if (animations.hasOwnProperty(i)) {
                            var a = animations[i],
                                b = a.get(),
                                res;
                            len++;
                            a.s = (b - a.b) / (a.dur / a.spd);
                            if (a.s >= 1) {
                                delete animations[i];
                                a.s = 1;
                                len--;
                                (function (a) {
                                    setTimeout(function () {
                                        eve("mina.finish." + a.id, a);
                                    });
                                })(a);
                            }
                            a.update();
                        }
                    }
                    requestID = len ? requestAnimFrame(frame) : false;
                },
                /*\
                     * mina
                     [ method ]
                     **
                     * Generic animation of numbers
                     **
                     - a (number) start _slave_ number
                     - A (number) end _slave_ number
                     - b (number) start _master_ number (start time in general case)
                     - B (number) end _master_ number (end time in general case)
                     - get (function) getter of _master_ number (see @mina.time)
                     - set (function) setter of _slave_ number
                     - easing (function) #optional easing function, default is @mina.linear
                     = (object) animation descriptor
                     o {
                     o         id (string) animation id,
                     o         start (number) start _slave_ number,
                     o         end (number) end _slave_ number,
                     o         b (number) start _master_ number,
                     o         s (number) animation status (0..1),
                     o         dur (number) animation duration,
                     o         spd (number) animation speed,
                     o         get (function) getter of _master_ number (see @mina.time),
                     o         set (function) setter of _slave_ number,
                     o         easing (function) easing function, default is @mina.linear,
                     o         status (function) status getter/setter,
                     o         speed (function) speed getter/setter,
                     o         duration (function) duration getter/setter,
                     o         stop (function) animation stopper
                     o         pause (function) pauses the animation
                     o         resume (function) resumes the animation
                     o         update (function) calles setter with the right value of the animation
                     o }
                    \*/
                mina = function mina(a, A, b, B, get, set, easing) {
                    var anim = {
                        id: ID(),
                        start: a,
                        end: A,
                        b: b,
                        s: 0,
                        dur: B - b,
                        spd: 1,
                        get: get,
                        set: set,
                        easing: easing || mina.linear,
                        status: sta,
                        speed: speed,
                        duration: duration,
                        stop: stopit,
                        pause: pause,
                        resume: resume,
                        update: update
                    };

                    animations[anim.id] = anim;
                    var len = 0, i;
                    for (i in animations) {
                        if (animations.hasOwnProperty(i)) {
                            len++;
                            if (len == 2) {
                                break;
                            }
                        }
                    }
                    len == 1 && frame();
                    return anim;
                };
            /*\
                 * mina.time
                 [ method ]
                 **
                 * Returns the current time. Equivalent to:
                 | function () {
                 |     return (new Date).getTime();
                 | }
                \*/
            mina.time = timer;
            /*\
                 * mina.getById
                 [ method ]
                 **
                 * Returns an animation by its id
                 - id (string) animation's id
                 = (object) See @mina
                \*/
            mina.getById = function (id) {
                return animations[id] || null;
            };

            /*\
                 * mina.linear
                 [ method ]
                 **
                 * Default linear easing
                 - n (number) input 0..1
                 = (number) output 0..1
                \*/
            mina.linear = function (n) {
                return n;
            };
            /*\
                 * mina.easeout
                 [ method ]
                 **
                 * Easeout easing
                 - n (number) input 0..1
                 = (number) output 0..1
                \*/
            mina.easeout = function (n) {
                return Math.pow(n, 1.7);
            };
            /*\
                 * mina.easein
                 [ method ]
                 **
                 * Easein easing
                 - n (number) input 0..1
                 = (number) output 0..1
                \*/
            mina.easein = function (n) {
                return Math.pow(n, .48);
            };
            /*\
                 * mina.easeinout
                 [ method ]
                 **
                 * Easeinout easing
                 - n (number) input 0..1
                 = (number) output 0..1
                \*/
            mina.easeinout = function (n) {
                if (n == 1) {
                    return 1;
                }
                if (n == 0) {
                    return 0;
                }
                var q = .48 - n / 1.04,
                    Q = Math.sqrt(.1734 + q * q),
                    x = Q - q,
                    X = Math.pow(Math.abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                    y = -Q - q,
                    Y = Math.pow(Math.abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                    t = X + Y + .5;
                return (1 - t) * 3 * t * t + t * t * t;
            };
            /*\
                 * mina.backin
                 [ method ]
                 **
                 * Backin easing
                 - n (number) input 0..1
                 = (number) output 0..1
                \*/
            mina.backin = function (n) {
                if (n == 1) {
                    return 1;
                }
                var s = 1.70158;
                return n * n * ((s + 1) * n - s);
            };
            /*\
                 * mina.backout
                 [ method ]
                 **
                 * Backout easing
                 - n (number) input 0..1
                 = (number) output 0..1
                \*/
            mina.backout = function (n) {
                if (n == 0) {
                    return 0;
                }
                n = n - 1;
                var s = 1.70158;
                return n * n * ((s + 1) * n + s) + 1;
            };
            /*\
                 * mina.elastic
                 [ method ]
                 **
                 * Elastic easing
                 - n (number) input 0..1
                 = (number) output 0..1
                \*/
            mina.elastic = function (n) {
                if (n == !!n) {
                    return n;
                }
                return Math.pow(2, -10 * n) * Math.sin((n - .075) * (
                    2 * Math.PI) / .3) + 1;
            };
            /*\
                 * mina.bounce
                 [ method ]
                 **
                 * Bounce easing
                 - n (number) input 0..1
                 = (number) output 0..1
                \*/
            mina.bounce = function (n) {
                var s = 7.5625,
                    p = 2.75,
                    l;
                if (n < 1 / p) {
                    l = s * n * n;
                } else {
                    if (n < 2 / p) {
                        n -= 1.5 / p;
                        l = s * n * n + .75;
                    } else {
                        if (n < 2.5 / p) {
                            n -= 2.25 / p;
                            l = s * n * n + .9375;
                        } else {
                            n -= 2.625 / p;
                            l = s * n * n + .984375;
                        }
                    }
                }
                return l;
            };
            window.mina = mina;
            return mina;
        }(typeof eve == "undefined" ? function () { } : eve);

        // Copyright (c) 2013 - 2017 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.

        var Snap = function (root) {
            Snap.version = "0.5.1";
            /*\
             * Snap
             [ method ]
             **
             * Creates a drawing surface or wraps existing SVG element.
             **
             - width (number|string) width of surface
             - height (number|string) height of surface
             * or
             - DOM (SVGElement) element to be wrapped into Snap structure
             * or
             - array (array) array of elements (will return set of elements)
             * or
             - query (string) CSS query selector
             = (object) @Element
            \*/
            function Snap(w, h) {
                if (w) {
                    if (w.nodeType) {
                        return wrap(w);
                    }
                    if (is(w, "array") && Snap.set) {
                        return Snap.set.apply(Snap, w);
                    }
                    if (w instanceof Element) {
                        return w;
                    }
                    if (h == null) {
                        try {
                            w = glob.doc.querySelector(String(w));
                            return wrap(w);
                        } catch (e) {
                            return null;
                        }
                    }
                }
                w = w == null ? "100%" : w;
                h = h == null ? "100%" : h;
                return new Paper(w, h);
            }
            Snap.toString = function () {
                return "Snap v" + this.version;
            };
            Snap._ = {};
            var glob = {
                win: root.window,
                doc: root.window.document
            };

            Snap._.glob = glob;
            var has = "hasOwnProperty",
                Str = String,
                toFloat = parseFloat,
                toInt = parseInt,
                math = Math,
                mmax = math.max,
                mmin = math.min,
                abs = math.abs,
                pow = math.pow,
                PI = math.PI,
                round = math.round,
                E = "",
                S = " ",
                objectToString = Object.prototype.toString,
                ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
                colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\))\s*$/i,
                bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
                separator = Snap._.separator = /[,\s]+/,
                whitespace = /[\s]/g,
                commaSpaces = /[\s]*,[\s]*/,
                hsrg = { hs: 1, rg: 1 },
                pathCommand = /([a-z])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/ig,
                tCommand = /([rstm])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/ig,
                pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\s]*,?[\s]*/ig,
                idgen = 0,
                idprefix = "S" + (+new Date()).toString(36),
                ID = function ID(el) {
                    return (el && el.type ? el.type : E) + idprefix + (idgen++).toString(36);
                },
                xlink = "http://www.w3.org/1999/xlink",
                xmlns = "http://www.w3.org/2000/svg",
                hub = {},
                /*\
                     * Snap.url
                     [ method ]
                     **
                     * Wraps path into `"url('<path>')"`.
                     - value (string) path
                     = (string) wrapped path
                    \*/
                URL = Snap.url = function (url) {
                    return "url('#" + url + "')";
                };

            function $(el, attr) {
                if (attr) {
                    if (el == "#text") {
                        el = glob.doc.createTextNode(attr.text || attr["#text"] || "");
                    }
                    if (el == "#comment") {
                        el = glob.doc.createComment(attr.text || attr["#text"] || "");
                    }
                    if (typeof el == "string") {
                        el = $(el);
                    }
                    if (typeof attr == "string") {
                        if (el.nodeType == 1) {
                            if (attr.substring(0, 6) == "xlink:") {
                                return el.getAttributeNS(xlink, attr.substring(6));
                            }
                            if (attr.substring(0, 4) == "xml:") {
                                return el.getAttributeNS(xmlns, attr.substring(4));
                            }
                            return el.getAttribute(attr);
                        } else if (attr == "text") {
                            return el.nodeValue;
                        } else {
                            return null;
                        }
                    }
                    if (el.nodeType == 1) {
                        for (var key in attr) {
                            if (attr[has](key)) {
                                var val = Str(attr[key]);
                                if (val) {
                                    if (key.substring(0, 6) == "xlink:") {
                                        el.setAttributeNS(xlink, key.substring(6), val);
                                    } else if (key.substring(0, 4) == "xml:") {
                                        el.setAttributeNS(xmlns, key.substring(4), val);
                                    } else {
                                        el.setAttribute(key, val);
                                    }
                                } else {
                                    el.removeAttribute(key);
                                }
                            }
                        }
                    } else if ("text" in attr) {
                        el.nodeValue = attr.text;
                    }
                } else {
                    el = glob.doc.createElementNS(xmlns, el);
                }
                return el;
            }
            Snap._.$ = $;
            Snap._.id = ID;
            function getAttrs(el) {
                var attrs = el.attributes,
                    name,
                    out = {};
                for (var i = 0; i < attrs.length; i++) {
                    if (attrs[i].namespaceURI == xlink) {
                        name = "xlink:";
                    } else {
                        name = "";
                    }
                    name += attrs[i].name;
                    out[name] = attrs[i].textContent;
                }
                return out;
            }
            function is(o, type) {
                type = Str.prototype.toLowerCase.call(type);
                if (type == "finite") {
                    return isFinite(o);
                }
                if (type == "array" && (
                    o instanceof Array || Array.isArray && Array.isArray(o))) {
                    return true;
                }
                return type == "null" && o === null ||
                    type == (typeof o === "undefined" ? "undefined" : _typeof2(o)) && o !== null ||
                    type == "object" && o === Object(o) ||
                    objectToString.call(o).slice(8, -1).toLowerCase() == type;
            }
            /*\
             * Snap.format
             [ method ]
             **
             * Replaces construction of type `{<name>}` to the corresponding argument
             **
             - token (string) string to format
             - json (object) object which properties are used as a replacement
             = (string) formatted string
             > Usage
             | // this draws a rectangular shape equivalent to "M10,20h40v50h-40z"
             | paper.path(Snap.format("M{x},{y}h{dim.width}v{dim.height}h{dim['negative width']}z", {
             |     x: 10,
             |     y: 20,
             |     dim: {
             |         width: 40,
             |         height: 50,
             |         "negative width": -40
             |     }
             | }));
            \*/
            Snap.format = function () {
                var tokenRegex = /\{([^\}]+)\}/g,
                    objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,// matches .xxxxx or ["xxxxx"] to run over object properties
                    replacer = function replacer(all, key, obj) {
                        var res = obj;
                        key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
                            name = name || quotedName;
                            if (res) {
                                if (name in res) {
                                    res = res[name];
                                }
                                typeof res == "function" && isFunc && (res = res());
                            }
                        });
                        res = (res == null || res == obj ? all : res) + "";
                        return res;
                    };
                return function (str, obj) {
                    return Str(str).replace(tokenRegex, function (all, key) {
                        return replacer(all, key, obj);
                    });
                };
            }();
            function clone(obj) {
                if (typeof obj == "function" || Object(obj) !== obj) {
                    return obj;
                }
                var res = new obj.constructor();
                for (var key in obj) {
                    if (obj[has](key)) {
                        res[key] = clone(obj[key]);
                    }
                }
                return res;
            }
            Snap._.clone = clone;
            function repush(array, item) {
                for (var i = 0, ii = array.length; i < ii; i++) {
                    if (array[i] === item) {
                        return array.push(array.splice(i, 1)[0]);
                    }
                }
            }
            function cacher(f, scope, postprocessor) {
                function newf() {
                    var arg = Array.prototype.slice.call(arguments, 0),
                        args = arg.join("\u2400"),
                        cache = newf.cache = newf.cache || {},
                        count = newf.count = newf.count || [];
                    if (cache[has](args)) {
                        repush(count, args);
                        return postprocessor ? postprocessor(cache[args]) : cache[args];
                    }
                    count.length >= 1e3 && delete cache[count.shift()];
                    count.push(args);
                    cache[args] = f.apply(scope, arg);
                    return postprocessor ? postprocessor(cache[args]) : cache[args];
                }
                return newf;
            }
            Snap._.cacher = cacher;
            function angle(x1, y1, x2, y2, x3, y3) {
                if (x3 == null) {
                    var x = x1 - x2,
                        y = y1 - y2;
                    if (!x && !y) {
                        return 0;
                    }
                    return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
                } else {
                    return angle(x1, y1, x3, y3) - angle(x2, y2, x3, y3);
                }
            }
            function rad(deg) {
                return deg % 360 * PI / 180;
            }
            function deg(rad) {
                return rad * 180 / PI % 360;
            }
            function x_y() {
                return this.x + S + this.y;
            }
            function x_y_w_h() {
                return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
            }

            /*\
             * Snap.rad
             [ method ]
             **
             * Transform angle to radians
             - deg (number) angle in degrees
             = (number) angle in radians
            \*/
            Snap.rad = rad;
            /*\
             * Snap.deg
             [ method ]
             **
             * Transform angle to degrees
             - rad (number) angle in radians
             = (number) angle in degrees
            \*/
            Snap.deg = deg;
            /*\
             * Snap.sin
             [ method ]
             **
             * Equivalent to `Math.sin()` only works with degrees, not radians.
             - angle (number) angle in degrees
             = (number) sin
            \*/
            Snap.sin = function (angle) {
                return math.sin(Snap.rad(angle));
            };
            /*\
             * Snap.tan
             [ method ]
             **
             * Equivalent to `Math.tan()` only works with degrees, not radians.
             - angle (number) angle in degrees
             = (number) tan
            \*/
            Snap.tan = function (angle) {
                return math.tan(Snap.rad(angle));
            };
            /*\
             * Snap.cos
             [ method ]
             **
             * Equivalent to `Math.cos()` only works with degrees, not radians.
             - angle (number) angle in degrees
             = (number) cos
            \*/
            Snap.cos = function (angle) {
                return math.cos(Snap.rad(angle));
            };
            /*\
             * Snap.asin
             [ method ]
             **
             * Equivalent to `Math.asin()` only works with degrees, not radians.
             - num (number) value
             = (number) asin in degrees
            \*/
            Snap.asin = function (num) {
                return Snap.deg(math.asin(num));
            };
            /*\
             * Snap.acos
             [ method ]
             **
             * Equivalent to `Math.acos()` only works with degrees, not radians.
             - num (number) value
             = (number) acos in degrees
            \*/
            Snap.acos = function (num) {
                return Snap.deg(math.acos(num));
            };
            /*\
             * Snap.atan
             [ method ]
             **
             * Equivalent to `Math.atan()` only works with degrees, not radians.
             - num (number) value
             = (number) atan in degrees
            \*/
            Snap.atan = function (num) {
                return Snap.deg(math.atan(num));
            };
            /*\
             * Snap.atan2
             [ method ]
             **
             * Equivalent to `Math.atan2()` only works with degrees, not radians.
             - num (number) value
             = (number) atan2 in degrees
            \*/
            Snap.atan2 = function (num) {
                return Snap.deg(math.atan2(num));
            };
            /*\
             * Snap.angle
             [ method ]
             **
             * Returns an angle between two or three points
             - x1 (number) x coord of first point
             - y1 (number) y coord of first point
             - x2 (number) x coord of second point
             - y2 (number) y coord of second point
             - x3 (number) #optional x coord of third point
             - y3 (number) #optional y coord of third point
             = (number) angle in degrees
            \*/
            Snap.angle = angle;
            /*\
             * Snap.len
             [ method ]
             **
             * Returns distance between two points
             - x1 (number) x coord of first point
             - y1 (number) y coord of first point
             - x2 (number) x coord of second point
             - y2 (number) y coord of second point
             = (number) distance
            \*/
            Snap.len = function (x1, y1, x2, y2) {
                return Math.sqrt(Snap.len2(x1, y1, x2, y2));
            };
            /*\
             * Snap.len2
             [ method ]
             **
             * Returns squared distance between two points
             - x1 (number) x coord of first point
             - y1 (number) y coord of first point
             - x2 (number) x coord of second point
             - y2 (number) y coord of second point
             = (number) distance
            \*/
            Snap.len2 = function (x1, y1, x2, y2) {
                return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
            };
            /*\
             * Snap.closestPoint
             [ method ]
             **
             * Returns closest point to a given one on a given path.
             - path (Element) path element
             - x (number) x coord of a point
             - y (number) y coord of a point
             = (object) in format
             {
                x (number) x coord of the point on the path
                y (number) y coord of the point on the path
                length (number) length of the path to the point
                distance (number) distance from the given point to the path
             }
            \*/
            // Copied from http://bl.ocks.org/mbostock/8027637
            Snap.closestPoint = function (path, x, y) {
                function distance2(p) {
                    var dx = p.x - x,
                        dy = p.y - y;
                    return dx * dx + dy * dy;
                }
                var pathNode = path.node,
                    pathLength = pathNode.getTotalLength(),
                    precision = pathLength / pathNode.pathSegList.numberOfItems * .125,
                    best,
                    bestLength,
                    bestDistance = Infinity;

                // linear scan for coarse approximation
                for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
                    if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                        best = scan;
                        bestLength = scanLength;
                        bestDistance = scanDistance;
                    }
                }

                // binary search for precise estimate
                precision *= .5;
                while (precision > .5) {
                    var before,
                        after,
                        beforeLength,
                        afterLength,
                        beforeDistance,
                        afterDistance;
                    if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
                        best = before;
                        bestLength = beforeLength;
                        bestDistance = beforeDistance;
                    } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
                        best = after;
                        bestLength = afterLength;
                        bestDistance = afterDistance;
                    } else {
                        precision *= .5;
                    }
                }

                best = {
                    x: best.x,
                    y: best.y,
                    length: bestLength,
                    distance: Math.sqrt(bestDistance)
                };

                return best;
            };
            /*\
             * Snap.is
             [ method ]
             **
             * Handy replacement for the `typeof` operator
             - o (…) any object or primitive
             - type (string) name of the type, e.g., `string`, `function`, `number`, etc.
             = (boolean) `true` if given value is of given type
            \*/
            Snap.is = is;
            /*\
             * Snap.snapTo
             [ method ]
             **
             * Snaps given value to given grid
             - values (array|number) given array of values or step of the grid
             - value (number) value to adjust
             - tolerance (number) #optional maximum distance to the target value that would trigger the snap. Default is `10`.
             = (number) adjusted value
            \*/
            Snap.snapTo = function (values, value, tolerance) {
                tolerance = is(tolerance, "finite") ? tolerance : 10;
                if (is(values, "array")) {
                    var i = values.length;
                    while (i--) {
                        if (abs(values[i] - value) <= tolerance) {
                            return values[i];
                        }
                    }
                } else {
                    values = +values;
                    var rem = value % values;
                    if (rem < tolerance) {
                        return value - rem;
                    }
                    if (rem > values - tolerance) {
                        return value - rem + values;
                    }
                }
                return value;
            };
            // Colour
            /*\
             * Snap.getRGB
             [ method ]
             **
             * Parses color string as RGB object
             - color (string) color string in one of the following formats:
             # <ul>
             #     <li>Color name (<code>red</code>, <code>green</code>, <code>cornflowerblue</code>, etc)</li>
             #     <li>#••• — shortened HTML color: (<code>#000</code>, <code>#fc0</code>, etc.)</li>
             #     <li>#•••••• — full length HTML color: (<code>#000000</code>, <code>#bd2300</code>)</li>
             #     <li>rgb(•••, •••, •••) — red, green and blue channels values: (<code>rgb(200,&nbsp;100,&nbsp;0)</code>)</li>
             #     <li>rgba(•••, •••, •••, •••) — also with opacity</li>
             #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>)</li>
             #     <li>rgba(•••%, •••%, •••%, •••%) — also with opacity</li>
             #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>)</li>
             #     <li>hsba(•••, •••, •••, •••) — also with opacity</li>
             #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
             #     <li>hsba(•••%, •••%, •••%, •••%) — also with opacity</li>
             #     <li>hsl(•••, •••, •••) — hue, saturation and luminosity values: (<code>hsb(0.5,&nbsp;0.25,&nbsp;0.5)</code>)</li>
             #     <li>hsla(•••, •••, •••, •••) — also with opacity</li>
             #     <li>hsl(•••%, •••%, •••%) — same as above, but in %</li>
             #     <li>hsla(•••%, •••%, •••%, •••%) — also with opacity</li>
             # </ul>
             * Note that `%` can be used any time: `rgb(20%, 255, 50%)`.
             = (object) RGB object in the following format:
             o {
             o     r (number) red,
             o     g (number) green,
             o     b (number) blue,
             o     hex (string) color in HTML/CSS format: #••••••,
             o     error (boolean) true if string can't be parsed
             o }
            \*/
            Snap.getRGB = cacher(function (colour) {
                if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
                    return { r: -1, g: -1, b: -1, hex: "none", error: 1, toString: rgbtoString };
                }
                if (colour == "none") {
                    return { r: -1, g: -1, b: -1, hex: "none", toString: rgbtoString };
                }
                !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = _toHex(colour));
                if (!colour) {
                    return { r: -1, g: -1, b: -1, hex: "none", error: 1, toString: rgbtoString };
                }
                var res,
                    red,
                    green,
                    blue,
                    opacity,
                    t,
                    values,
                    rgb = colour.match(colourRegExp);
                if (rgb) {
                    if (rgb[2]) {
                        blue = toInt(rgb[2].substring(5), 16);
                        green = toInt(rgb[2].substring(3, 5), 16);
                        red = toInt(rgb[2].substring(1, 3), 16);
                    }
                    if (rgb[3]) {
                        blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                        green = toInt((t = rgb[3].charAt(2)) + t, 16);
                        red = toInt((t = rgb[3].charAt(1)) + t, 16);
                    }
                    if (rgb[4]) {
                        values = rgb[4].split(commaSpaces);
                        red = toFloat(values[0]);
                        values[0].slice(-1) == "%" && (red *= 2.55);
                        green = toFloat(values[1]);
                        values[1].slice(-1) == "%" && (green *= 2.55);
                        blue = toFloat(values[2]);
                        values[2].slice(-1) == "%" && (blue *= 2.55);
                        rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                        values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                    }
                    if (rgb[5]) {
                        values = rgb[5].split(commaSpaces);
                        red = toFloat(values[0]);
                        values[0].slice(-1) == "%" && (red /= 100);
                        green = toFloat(values[1]);
                        values[1].slice(-1) == "%" && (green /= 100);
                        blue = toFloat(values[2]);
                        values[2].slice(-1) == "%" && (blue /= 100);
                        (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                        rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                        values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                        return Snap.hsb2rgb(red, green, blue, opacity);
                    }
                    if (rgb[6]) {
                        values = rgb[6].split(commaSpaces);
                        red = toFloat(values[0]);
                        values[0].slice(-1) == "%" && (red /= 100);
                        green = toFloat(values[1]);
                        values[1].slice(-1) == "%" && (green /= 100);
                        blue = toFloat(values[2]);
                        values[2].slice(-1) == "%" && (blue /= 100);
                        (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                        rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                        values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                        return Snap.hsl2rgb(red, green, blue, opacity);
                    }
                    red = mmin(math.round(red), 255);
                    green = mmin(math.round(green), 255);
                    blue = mmin(math.round(blue), 255);
                    opacity = mmin(mmax(opacity, 0), 1);
                    rgb = { r: red, g: green, b: blue, toString: rgbtoString };
                    rgb.hex = "#" + (16777216 | blue | green << 8 | red << 16).toString(16).slice(1);
                    rgb.opacity = is(opacity, "finite") ? opacity : 1;
                    return rgb;
                }
                return { r: -1, g: -1, b: -1, hex: "none", error: 1, toString: rgbtoString };
            }, Snap);
            /*\
             * Snap.hsb
             [ method ]
             **
             * Converts HSB values to a hex representation of the color
             - h (number) hue
             - s (number) saturation
             - b (number) value or brightness
             = (string) hex representation of the color
            \*/
            Snap.hsb = cacher(function (h, s, b) {
                return Snap.hsb2rgb(h, s, b).hex;
            });
            /*\
             * Snap.hsl
             [ method ]
             **
             * Converts HSL values to a hex representation of the color
             - h (number) hue
             - s (number) saturation
             - l (number) luminosity
             = (string) hex representation of the color
            \*/
            Snap.hsl = cacher(function (h, s, l) {
                return Snap.hsl2rgb(h, s, l).hex;
            });
            /*\
             * Snap.rgb
             [ method ]
             **
             * Converts RGB values to a hex representation of the color
             - r (number) red
             - g (number) green
             - b (number) blue
             = (string) hex representation of the color
            \*/
            Snap.rgb = cacher(function (r, g, b, o) {
                if (is(o, "finite")) {
                    var round = math.round;
                    return "rgba(" + [round(r), round(g), round(b), +o.toFixed(2)] + ")";
                }
                return "#" + (16777216 | b | g << 8 | r << 16).toString(16).slice(1);
            });
            var _toHex = function toHex(color) {
                var i = glob.doc.getElementsByTagName("head")[0] || glob.doc.getElementsByTagName("svg")[0],
                    red = "rgb(255, 0, 0)";
                _toHex = cacher(function (color) {
                    if (color.toLowerCase() == "red") {
                        return red;
                    }
                    i.style.color = red;
                    i.style.color = color;
                    var out = glob.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
                    return out == red ? null : out;
                });
                return _toHex(color);
            },
                hsbtoString = function hsbtoString() {
                    return "hsb(" + [this.h, this.s, this.b] + ")";
                },
                hsltoString = function hsltoString() {
                    return "hsl(" + [this.h, this.s, this.l] + ")";
                },
                rgbtoString = function rgbtoString() {
                    return this.opacity == 1 || this.opacity == null ?
                        this.hex :
                        "rgba(" + [this.r, this.g, this.b, this.opacity] + ")";
                },
                prepareRGB = function prepareRGB(r, g, b) {
                    if (g == null && is(r, "object") && "r" in r && "g" in r && "b" in r) {
                        b = r.b;
                        g = r.g;
                        r = r.r;
                    }
                    if (g == null && is(r, string)) {
                        var clr = Snap.getRGB(r);
                        r = clr.r;
                        g = clr.g;
                        b = clr.b;
                    }
                    if (r > 1 || g > 1 || b > 1) {
                        r /= 255;
                        g /= 255;
                        b /= 255;
                    }

                    return [r, g, b];
                },
                packageRGB = function packageRGB(r, g, b, o) {
                    r = math.round(r * 255);
                    g = math.round(g * 255);
                    b = math.round(b * 255);
                    var rgb = {
                        r: r,
                        g: g,
                        b: b,
                        opacity: is(o, "finite") ? o : 1,
                        hex: Snap.rgb(r, g, b),
                        toString: rgbtoString
                    };

                    is(o, "finite") && (rgb.opacity = o);
                    return rgb;
                };
            /*\
             * Snap.color
             [ method ]
             **
             * Parses the color string and returns an object featuring the color's component values
             - clr (string) color string in one of the supported formats (see @Snap.getRGB)
             = (object) Combined RGB/HSB object in the following format:
             o {
             o     r (number) red,
             o     g (number) green,
             o     b (number) blue,
             o     hex (string) color in HTML/CSS format: #••••••,
             o     error (boolean) `true` if string can't be parsed,
             o     h (number) hue,
             o     s (number) saturation,
             o     v (number) value (brightness),
             o     l (number) lightness
             o }
            \*/
            Snap.color = function (clr) {
                var rgb;
                if (is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
                    rgb = Snap.hsb2rgb(clr);
                    clr.r = rgb.r;
                    clr.g = rgb.g;
                    clr.b = rgb.b;
                    clr.opacity = 1;
                    clr.hex = rgb.hex;
                } else if (is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
                    rgb = Snap.hsl2rgb(clr);
                    clr.r = rgb.r;
                    clr.g = rgb.g;
                    clr.b = rgb.b;
                    clr.opacity = 1;
                    clr.hex = rgb.hex;
                } else {
                    if (is(clr, "string")) {
                        clr = Snap.getRGB(clr);
                    }
                    if (is(clr, "object") && "r" in clr && "g" in clr && "b" in clr && !("error" in clr)) {
                        rgb = Snap.rgb2hsl(clr);
                        clr.h = rgb.h;
                        clr.s = rgb.s;
                        clr.l = rgb.l;
                        rgb = Snap.rgb2hsb(clr);
                        clr.v = rgb.b;
                    } else {
                        clr = { hex: "none" };
                        clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
                        clr.error = 1;
                    }
                }
                clr.toString = rgbtoString;
                return clr;
            };
            /*\
             * Snap.hsb2rgb
             [ method ]
             **
             * Converts HSB values to an RGB object
             - h (number) hue
             - s (number) saturation
             - v (number) value or brightness
             = (object) RGB object in the following format:
             o {
             o     r (number) red,
             o     g (number) green,
             o     b (number) blue,
             o     hex (string) color in HTML/CSS format: #••••••
             o }
            \*/
            Snap.hsb2rgb = function (h, s, v, o) {
                if (is(h, "object") && "h" in h && "s" in h && "b" in h) {
                    v = h.b;
                    s = h.s;
                    o = h.o;
                    h = h.h;
                }
                h *= 360;
                var R, G, B, X, C;
                h = h % 360 / 60;
                C = v * s;
                X = C * (1 - abs(h % 2 - 1));
                R = G = B = v - C;

                h = ~~h;
                R += [C, X, 0, 0, X, C][h];
                G += [X, C, C, X, 0, 0][h];
                B += [0, 0, X, C, C, X][h];
                return packageRGB(R, G, B, o);
            };
            /*\
             * Snap.hsl2rgb
             [ method ]
             **
             * Converts HSL values to an RGB object
             - h (number) hue
             - s (number) saturation
             - l (number) luminosity
             = (object) RGB object in the following format:
             o {
             o     r (number) red,
             o     g (number) green,
             o     b (number) blue,
             o     hex (string) color in HTML/CSS format: #••••••
             o }
            \*/
            Snap.hsl2rgb = function (h, s, l, o) {
                if (is(h, "object") && "h" in h && "s" in h && "l" in h) {
                    l = h.l;
                    s = h.s;
                    h = h.h;
                }
                if (h > 1 || s > 1 || l > 1) {
                    h /= 360;
                    s /= 100;
                    l /= 100;
                }
                h *= 360;
                var R, G, B, X, C;
                h = h % 360 / 60;
                C = 2 * s * (l < .5 ? l : 1 - l);
                X = C * (1 - abs(h % 2 - 1));
                R = G = B = l - C / 2;

                h = ~~h;
                R += [C, X, 0, 0, X, C][h];
                G += [X, C, C, X, 0, 0][h];
                B += [0, 0, X, C, C, X][h];
                return packageRGB(R, G, B, o);
            };
            /*\
             * Snap.rgb2hsb
             [ method ]
             **
             * Converts RGB values to an HSB object
             - r (number) red
             - g (number) green
             - b (number) blue
             = (object) HSB object in the following format:
             o {
             o     h (number) hue,
             o     s (number) saturation,
             o     b (number) brightness
             o }
            \*/
            Snap.rgb2hsb = function (r, g, b) {
                b = prepareRGB(r, g, b);
                r = b[0];
                g = b[1];
                b = b[2];

                var H, S, V, C;
                V = mmax(r, g, b);
                C = V - mmin(r, g, b);
                H = C == 0 ? null :
                    V == r ? (g - b) / C :
                        V == g ? (b - r) / C + 2 :
                            (r - g) / C + 4;
                H = (H + 360) % 6 * 60 / 360;
                S = C == 0 ? 0 : C / V;
                return { h: H, s: S, b: V, toString: hsbtoString };
            };
            /*\
             * Snap.rgb2hsl
             [ method ]
             **
             * Converts RGB values to an HSL object
             - r (number) red
             - g (number) green
             - b (number) blue
             = (object) HSL object in the following format:
             o {
             o     h (number) hue,
             o     s (number) saturation,
             o     l (number) luminosity
             o }
            \*/
            Snap.rgb2hsl = function (r, g, b) {
                b = prepareRGB(r, g, b);
                r = b[0];
                g = b[1];
                b = b[2];

                var H, S, L, M, m, C;
                M = mmax(r, g, b);
                m = mmin(r, g, b);
                C = M - m;
                H = C == 0 ? null :
                    M == r ? (g - b) / C :
                        M == g ? (b - r) / C + 2 :
                            (r - g) / C + 4;
                H = (H + 360) % 6 * 60 / 360;
                L = (M + m) / 2;
                S = C == 0 ? 0 :
                    L < .5 ? C / (2 * L) :
                        C / (2 - 2 * L);
                return { h: H, s: S, l: L, toString: hsltoString };
            };

            // Transformations
            /*\
             * Snap.parsePathString
             [ method ]
             **
             * Utility method
             **
             * Parses given path string into an array of arrays of path segments
             - pathString (string|array) path string or array of segments (in the last case it is returned straight away)
             = (array) array of segments
            \*/
            Snap.parsePathString = function (pathString) {
                if (!pathString) {
                    return null;
                }
                var pth = Snap.path(pathString);
                if (pth.arr) {
                    return Snap.path.clone(pth.arr);
                }

                var paramCounts = { a: 7, c: 6, o: 2, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, u: 3, z: 0 },
                    data = [];
                if (is(pathString, "array") && is(pathString[0], "array")) {// rough assumption
                    data = Snap.path.clone(pathString);
                }
                if (!data.length) {
                    Str(pathString).replace(pathCommand, function (a, b, c) {
                        var params = [],
                            name = b.toLowerCase();
                        c.replace(pathValues, function (a, b) {
                            b && params.push(+b);
                        });
                        if (name == "m" && params.length > 2) {
                            data.push([b].concat(params.splice(0, 2)));
                            name = "l";
                            b = b == "m" ? "l" : "L";
                        }
                        if (name == "o" && params.length == 1) {
                            data.push([b, params[0]]);
                        }
                        if (name == "r") {
                            data.push([b].concat(params));
                        } else while (params.length >= paramCounts[name]) {
                            data.push([b].concat(params.splice(0, paramCounts[name])));
                            if (!paramCounts[name]) {
                                break;
                            }
                        }
                    });
                }
                data.toString = Snap.path.toString;
                pth.arr = Snap.path.clone(data);
                return data;
            };
            /*\
             * Snap.parseTransformString
             [ method ]
             **
             * Utility method
             **
             * Parses given transform string into an array of transformations
             - TString (string|array) transform string or array of transformations (in the last case it is returned straight away)
             = (array) array of transformations
            \*/
            var parseTransformString = Snap.parseTransformString = function (TString) {
                if (!TString) {
                    return null;
                }
                var paramCounts = { r: 3, s: 4, t: 2, m: 6 },
                    data = [];
                if (is(TString, "array") && is(TString[0], "array")) {// rough assumption
                    data = Snap.path.clone(TString);
                }
                if (!data.length) {
                    Str(TString).replace(tCommand, function (a, b, c) {
                        var params = [],
                            name = b.toLowerCase();
                        c.replace(pathValues, function (a, b) {
                            b && params.push(+b);
                        });
                        data.push([b].concat(params));
                    });
                }
                data.toString = Snap.path.toString;
                return data;
            };
            function svgTransform2string(tstr) {
                var res = [];
                tstr = tstr.replace(/(?:^|\s)(\w+)\(([^)]+)\)/g, function (all, name, params) {
                    params = params.split(/\s*,\s*|\s+/);
                    if (name == "rotate" && params.length == 1) {
                        params.push(0, 0);
                    }
                    if (name == "scale") {
                        if (params.length > 2) {
                            params = params.slice(0, 2);
                        } else if (params.length == 2) {
                            params.push(0, 0);
                        }
                        if (params.length == 1) {
                            params.push(params[0], 0, 0);
                        }
                    }
                    if (name == "skewX") {
                        res.push(["m", 1, 0, math.tan(rad(params[0])), 1, 0, 0]);
                    } else if (name == "skewY") {
                        res.push(["m", 1, math.tan(rad(params[0])), 0, 1, 0, 0]);
                    } else {
                        res.push([name.charAt(0)].concat(params));
                    }
                    return all;
                });
                return res;
            }
            Snap._.svgTransform2string = svgTransform2string;
            Snap._.rgTransform = /^[a-z][\s]*-?\.?\d/i;
            function transform2matrix(tstr, bbox) {
                var tdata = parseTransformString(tstr),
                    m = new Snap.Matrix();
                if (tdata) {
                    for (var i = 0, ii = tdata.length; i < ii; i++) {
                        var t = tdata[i],
                            tlen = t.length,
                            command = Str(t[0]).toLowerCase(),
                            absolute = t[0] != command,
                            inver = absolute ? m.invert() : 0,
                            x1,
                            y1,
                            x2,
                            y2,
                            bb;
                        if (command == "t" && tlen == 2) {
                            m.translate(t[1], 0);
                        } else if (command == "t" && tlen == 3) {
                            if (absolute) {
                                x1 = inver.x(0, 0);
                                y1 = inver.y(0, 0);
                                x2 = inver.x(t[1], t[2]);
                                y2 = inver.y(t[1], t[2]);
                                m.translate(x2 - x1, y2 - y1);
                            } else {
                                m.translate(t[1], t[2]);
                            }
                        } else if (command == "r") {
                            if (tlen == 2) {
                                bb = bb || bbox;
                                m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            } else if (tlen == 4) {
                                if (absolute) {
                                    x2 = inver.x(t[2], t[3]);
                                    y2 = inver.y(t[2], t[3]);
                                    m.rotate(t[1], x2, y2);
                                } else {
                                    m.rotate(t[1], t[2], t[3]);
                                }
                            }
                        } else if (command == "s") {
                            if (tlen == 2 || tlen == 3) {
                                bb = bb || bbox;
                                m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            } else if (tlen == 4) {
                                if (absolute) {
                                    x2 = inver.x(t[2], t[3]);
                                    y2 = inver.y(t[2], t[3]);
                                    m.scale(t[1], t[1], x2, y2);
                                } else {
                                    m.scale(t[1], t[1], t[2], t[3]);
                                }
                            } else if (tlen == 5) {
                                if (absolute) {
                                    x2 = inver.x(t[3], t[4]);
                                    y2 = inver.y(t[3], t[4]);
                                    m.scale(t[1], t[2], x2, y2);
                                } else {
                                    m.scale(t[1], t[2], t[3], t[4]);
                                }
                            }
                        } else if (command == "m" && tlen == 7) {
                            m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
                        }
                    }
                }
                return m;
            }
            Snap._.transform2matrix = transform2matrix;
            Snap._unit2px = unit2px;
            var contains = glob.doc.contains || glob.doc.compareDocumentPosition ?
                function (a, b) {
                    var adown = a.nodeType == 9 ? a.documentElement : a,
                        bup = b && b.parentNode;
                    return a == bup || !!(bup && bup.nodeType == 1 && (
                        adown.contains ?
                            adown.contains(bup) :
                            a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));

                } :
                function (a, b) {
                    if (b) {
                        while (b) {
                            b = b.parentNode;
                            if (b == a) {
                                return true;
                            }
                        }
                    }
                    return false;
                };
            function getSomeDefs(el) {
                var p = el.node.ownerSVGElement && wrap(el.node.ownerSVGElement) ||
                    el.node.parentNode && wrap(el.node.parentNode) ||
                    Snap.select("svg") ||
                    Snap(0, 0),
                    pdefs = p.select("defs"),
                    defs = pdefs == null ? false : pdefs.node;
                if (!defs) {
                    defs = make("defs", p.node).node;
                }
                return defs;
            }
            function getSomeSVG(el) {
                return el.node.ownerSVGElement && wrap(el.node.ownerSVGElement) || Snap.select("svg");
            }
            Snap._.getSomeDefs = getSomeDefs;
            Snap._.getSomeSVG = getSomeSVG;
            function unit2px(el, name, value) {
                var svg = getSomeSVG(el).node,
                    out = {},
                    mgr = svg.querySelector(".svg---mgr");
                if (!mgr) {
                    mgr = $("rect");
                    $(mgr, { x: -9e9, y: -9e9, width: 10, height: 10, "class": "svg---mgr", fill: "none" });
                    svg.appendChild(mgr);
                }
                function getW(val) {
                    if (val == null) {
                        return E;
                    }
                    if (val == +val) {
                        return val;
                    }
                    $(mgr, { width: val });
                    try {
                        return mgr.getBBox().width;
                    } catch (e) {
                        return 0;
                    }
                }
                function getH(val) {
                    if (val == null) {
                        return E;
                    }
                    if (val == +val) {
                        return val;
                    }
                    $(mgr, { height: val });
                    try {
                        return mgr.getBBox().height;
                    } catch (e) {
                        return 0;
                    }
                }
                function set(nam, f) {
                    if (name == null) {
                        out[nam] = f(el.attr(nam) || 0);
                    } else if (nam == name) {
                        out = f(value == null ? el.attr(nam) || 0 : value);
                    }
                }
                switch (el.type) {
                    case "rect":
                        set("rx", getW);
                        set("ry", getH);
                    case "image":
                        set("width", getW);
                        set("height", getH);
                    case "text":
                        set("x", getW);
                        set("y", getH);
                        break;
                    case "circle":
                        set("cx", getW);
                        set("cy", getH);
                        set("r", getW);
                        break;
                    case "ellipse":
                        set("cx", getW);
                        set("cy", getH);
                        set("rx", getW);
                        set("ry", getH);
                        break;
                    case "line":
                        set("x1", getW);
                        set("x2", getW);
                        set("y1", getH);
                        set("y2", getH);
                        break;
                    case "marker":
                        set("refX", getW);
                        set("markerWidth", getW);
                        set("refY", getH);
                        set("markerHeight", getH);
                        break;
                    case "radialGradient":
                        set("fx", getW);
                        set("fy", getH);
                        break;
                    case "tspan":
                        set("dx", getW);
                        set("dy", getH);
                        break;
                    default:
                        set(name, getW);
                }

                svg.removeChild(mgr);
                return out;
            }
            /*\
             * Snap.select
             [ method ]
             **
             * Wraps a DOM element specified by CSS selector as @Element
             - query (string) CSS selector of the element
             = (Element) the current element
            \*/
            Snap.select = function (query) {
                query = Str(query).replace(/([^\\]):/g, "$1\\:");
                return wrap(glob.doc.querySelector(query));
            };
            /*\
             * Snap.selectAll
             [ method ]
             **
             * Wraps DOM elements specified by CSS selector as set or array of @Element
             - query (string) CSS selector of the element
             = (Element) the current element
            \*/
            Snap.selectAll = function (query) {
                var nodelist = glob.doc.querySelectorAll(query),
                    set = (Snap.set || Array)();
                for (var i = 0; i < nodelist.length; i++) {
                    set.push(wrap(nodelist[i]));
                }
                return set;
            };

            function add2group(list) {
                if (!is(list, "array")) {
                    list = Array.prototype.slice.call(arguments, 0);
                }
                var i = 0,
                    j = 0,
                    node = this.node;
                while (this[i]) { delete this[i++]; }
                for (i = 0; i < list.length; i++) {
                    if (list[i].type == "set") {
                        list[i].forEach(function (el) {
                            node.appendChild(el.node);
                        });
                    } else {
                        node.appendChild(list[i].node);
                    }
                }
                var children = node.childNodes;
                for (i = 0; i < children.length; i++) {
                    this[j++] = wrap(children[i]);
                }
                return this;
            }
            // Hub garbage collector every 10s
            setInterval(function () {
                for (var key in hub) {
                    if (hub[has](key)) {
                        var el = hub[key],
                            node = el.node;
                        if (el.type != "svg" && !node.ownerSVGElement || el.type == "svg" && (!node.parentNode || "ownerSVGElement" in node.parentNode && !node.ownerSVGElement)) {
                            delete hub[key];
                        }
                    }
                }
            }, 1e4);
            function Element(el) {
                if (el.snap in hub) {
                    return hub[el.snap];
                }
                var svg;
                try {
                    svg = el.ownerSVGElement;
                } catch (e) { }
                /*\
                     * Element.node
                     [ property (object) ]
                     **
                     * Gives you a reference to the DOM object, so you can assign event handlers or just mess around.
                     > Usage
                     | // draw a circle at coordinate 10,10 with radius of 10
                     | var c = paper.circle(10, 10, 10);
                     | c.node.onclick = function () {
                     |     c.attr("fill", "red");
                     | };
                    \*/
                this.node = el;
                if (svg) {
                    this.paper = new Paper(svg);
                }
                /*\
                     * Element.type
                     [ property (string) ]
                     **
                     * SVG tag name of the given element.
                    \*/
                this.type = el.tagName || el.nodeName;
                var id = this.id = ID(this);
                this.anims = {};
                this._ = {
                    transform: []
                };

                el.snap = id;
                hub[id] = this;
                if (this.type == "g") {
                    this.add = add2group;
                }
                if (this.type in { g: 1, mask: 1, pattern: 1, symbol: 1 }) {
                    for (var method in Paper.prototype) {
                        if (Paper.prototype[has](method)) {
                            this[method] = Paper.prototype[method];
                        }
                    }
                }
            }
            /*\
                 * Element.attr
                 [ method ]
                 **
                 * Gets or sets given attributes of the element.
                 **
                 - params (object) contains key-value pairs of attributes you want to set
                 * or
                 - param (string) name of the attribute
                 = (Element) the current element
                 * or
                 = (string) value of attribute
                 > Usage
                 | el.attr({
                 |     fill: "#fc0",
                 |     stroke: "#000",
                 |     strokeWidth: 2, // CamelCase...
                 |     "fill-opacity": 0.5, // or dash-separated names
                 |     width: "*=2" // prefixed values
                 | });
                 | console.log(el.attr("fill")); // #fc0
                 * Prefixed values in format `"+=10"` supported. All four operations
                 * (`+`, `-`, `*` and `/`) could be used. Optionally you can use units for `+`
                 * and `-`: `"+=2em"`.
                \*/
            Element.prototype.attr = function (params, value) {
                var el = this,
                    node = el.node;
                if (!params) {
                    if (node.nodeType != 1) {
                        return {
                            text: node.nodeValue
                        };

                    }
                    var attr = node.attributes,
                        out = {};
                    for (var i = 0, ii = attr.length; i < ii; i++) {
                        out[attr[i].nodeName] = attr[i].nodeValue;
                    }
                    return out;
                }
                if (is(params, "string")) {
                    if (arguments.length > 1) {
                        var json = {};
                        json[params] = value;
                        params = json;
                    } else {
                        return eve("snap.util.getattr." + params, el).firstDefined();
                    }
                }
                for (var att in params) {
                    if (params[has](att)) {
                        eve("snap.util.attr." + att, el, params[att]);
                    }
                }
                return el;
            };
            /*\
             * Snap.parse
             [ method ]
             **
             * Parses SVG fragment and converts it into a @Fragment
             **
             - svg (string) SVG string
             = (Fragment) the @Fragment
            \*/
            Snap.parse = function (svg) {
                var f = glob.doc.createDocumentFragment(),
                    full = true,
                    div = glob.doc.createElement("div");
                svg = Str(svg);
                if (!svg.match(/^\s*<\s*svg(?:\s|>)/)) {
                    svg = "<svg>" + svg + "</svg>";
                    full = false;
                }
                div.innerHTML = svg;
                svg = div.getElementsByTagName("svg")[0];
                if (svg) {
                    if (full) {
                        f = svg;
                    } else {
                        while (svg.firstChild) {
                            f.appendChild(svg.firstChild);
                        }
                    }
                }
                return new Fragment(f);
            };
            function Fragment(frag) {
                this.node = frag;
            }
            /*\
             * Snap.fragment
             [ method ]
             **
             * Creates a DOM fragment from a given list of elements or strings
             **
             - varargs (…) SVG string
             = (Fragment) the @Fragment
            \*/
            Snap.fragment = function () {
                var args = Array.prototype.slice.call(arguments, 0),
                    f = glob.doc.createDocumentFragment();
                for (var i = 0, ii = args.length; i < ii; i++) {
                    var item = args[i];
                    if (item.node && item.node.nodeType) {
                        f.appendChild(item.node);
                    }
                    if (item.nodeType) {
                        f.appendChild(item);
                    }
                    if (typeof item == "string") {
                        f.appendChild(Snap.parse(item).node);
                    }
                }
                return new Fragment(f);
            };

            function make(name, parent) {
                var res = $(name);
                parent.appendChild(res);
                var el = wrap(res);
                return el;
            }
            function Paper(w, h) {
                var res,
                    desc,
                    defs,
                    proto = Paper.prototype;
                if (w && w.tagName && w.tagName.toLowerCase() == "svg") {
                    if (w.snap in hub) {
                        return hub[w.snap];
                    }
                    var doc = w.ownerDocument;
                    res = new Element(w);
                    desc = w.getElementsByTagName("desc")[0];
                    defs = w.getElementsByTagName("defs")[0];
                    if (!desc) {
                        desc = $("desc");
                        desc.appendChild(doc.createTextNode("Created with Snap"));
                        res.node.appendChild(desc);
                    }
                    if (!defs) {
                        defs = $("defs");
                        res.node.appendChild(defs);
                    }
                    res.defs = defs;
                    for (var key in proto) {
                        if (proto[has](key)) {
                            res[key] = proto[key];
                        }
                    }
                    res.paper = res.root = res;
                } else {
                    res = make("svg", glob.doc.body);
                    $(res.node, {
                        height: h,
                        version: 1.1,
                        width: w,
                        xmlns: xmlns
                    });

                }
                return res;
            }
            function wrap(dom) {
                if (!dom) {
                    return dom;
                }
                if (dom instanceof Element || dom instanceof Fragment) {
                    return dom;
                }
                if (dom.tagName && dom.tagName.toLowerCase() == "svg") {
                    return new Paper(dom);
                }
                if (dom.tagName && dom.tagName.toLowerCase() == "object" && dom.type == "image/svg+xml") {
                    return new Paper(dom.contentDocument.getElementsByTagName("svg")[0]);
                }
                return new Element(dom);
            }

            Snap._.make = make;
            Snap._.wrap = wrap;
            /*\
             * Paper.el
             [ method ]
             **
             * Creates an element on paper with a given name and no attributes
             **
             - name (string) tag name
             - attr (object) attributes
             = (Element) the current element
             > Usage
             | var c = paper.circle(10, 10, 10); // is the same as...
             | var c = paper.el("circle").attr({
             |     cx: 10,
             |     cy: 10,
             |     r: 10
             | });
             | // and the same as
             | var c = paper.el("circle", {
             |     cx: 10,
             |     cy: 10,
             |     r: 10
             | });
            \*/
            Paper.prototype.el = function (name, attr) {
                var el = make(name, this.node);
                attr && el.attr(attr);
                return el;
            };
            /*\
             * Element.children
             [ method ]
             **
             * Returns array of all the children of the element.
             = (array) array of Elements
            \*/
            Element.prototype.children = function () {
                var out = [],
                    ch = this.node.childNodes;
                for (var i = 0, ii = ch.length; i < ii; i++) {
                    out[i] = Snap(ch[i]);
                }
                return out;
            };
            function jsonFiller(root, o) {
                for (var i = 0, ii = root.length; i < ii; i++) {
                    var item = {
                        type: root[i].type,
                        attr: root[i].attr()
                    },

                        children = root[i].children();
                    o.push(item);
                    if (children.length) {
                        jsonFiller(children, item.childNodes = []);
                    }
                }
            }
            /*\
             * Element.toJSON
             [ method ]
             **
             * Returns object representation of the given element and all its children.
             = (object) in format
             o {
             o     type (string) this.type,
             o     attr (object) attributes map,
             o     childNodes (array) optional array of children in the same format
             o }
            \*/
            Element.prototype.toJSON = function () {
                var out = [];
                jsonFiller([this], out);
                return out[0];
            };
            // default
            eve.on("snap.util.getattr", function () {
                var att = eve.nt();
                att = att.substring(att.lastIndexOf(".") + 1);
                var css = att.replace(/[A-Z]/g, function (letter) {
                    return "-" + letter.toLowerCase();
                });
                if (cssAttr[has](css)) {
                    return this.node.ownerDocument.defaultView.getComputedStyle(this.node, null).getPropertyValue(css);
                } else {
                    return $(this.node, att);
                }
            });
            var cssAttr = {
                "alignment-baseline": 0,
                "baseline-shift": 0,
                "clip": 0,
                "clip-path": 0,
                "clip-rule": 0,
                "color": 0,
                "color-interpolation": 0,
                "color-interpolation-filters": 0,
                "color-profile": 0,
                "color-rendering": 0,
                "cursor": 0,
                "direction": 0,
                "display": 0,
                "dominant-baseline": 0,
                "enable-background": 0,
                "fill": 0,
                "fill-opacity": 0,
                "fill-rule": 0,
                "filter": 0,
                "flood-color": 0,
                "flood-opacity": 0,
                "font": 0,
                "font-family": 0,
                "font-size": 0,
                "font-size-adjust": 0,
                "font-stretch": 0,
                "font-style": 0,
                "font-variant": 0,
                "font-weight": 0,
                "glyph-orientation-horizontal": 0,
                "glyph-orientation-vertical": 0,
                "image-rendering": 0,
                "kerning": 0,
                "letter-spacing": 0,
                "lighting-color": 0,
                "marker": 0,
                "marker-end": 0,
                "marker-mid": 0,
                "marker-start": 0,
                "mask": 0,
                "opacity": 0,
                "overflow": 0,
                "pointer-events": 0,
                "shape-rendering": 0,
                "stop-color": 0,
                "stop-opacity": 0,
                "stroke": 0,
                "stroke-dasharray": 0,
                "stroke-dashoffset": 0,
                "stroke-linecap": 0,
                "stroke-linejoin": 0,
                "stroke-miterlimit": 0,
                "stroke-opacity": 0,
                "stroke-width": 0,
                "text-anchor": 0,
                "text-decoration": 0,
                "text-rendering": 0,
                "unicode-bidi": 0,
                "visibility": 0,
                "word-spacing": 0,
                "writing-mode": 0
            };


            eve.on("snap.util.attr", function (value) {
                var att = eve.nt(),
                    attr = {};
                att = att.substring(att.lastIndexOf(".") + 1);
                attr[att] = value;
                var style = att.replace(/-(\w)/gi, function (all, letter) {
                    return letter.toUpperCase();
                }),
                    css = att.replace(/[A-Z]/g, function (letter) {
                        return "-" + letter.toLowerCase();
                    });
                if (cssAttr[has](css)) {
                    this.node.style[style] = value == null ? E : value;
                } else {
                    $(this.node, attr);
                }
            });
            (function (proto) { })(Paper.prototype);

            // simple ajax
            /*\
             * Snap.ajax
             [ method ]
             **
             * Simple implementation of Ajax
             **
             - url (string) URL
             - postData (object|string) data for post request
             - callback (function) callback
             - scope (object) #optional scope of callback
             * or
             - url (string) URL
             - callback (function) callback
             - scope (object) #optional scope of callback
             = (XMLHttpRequest) the XMLHttpRequest object, just in case
            \*/
            Snap.ajax = function (url, postData, callback, scope) {
                var req = new XMLHttpRequest(),
                    id = ID();
                if (req) {
                    if (is(postData, "function")) {
                        scope = callback;
                        callback = postData;
                        postData = null;
                    } else if (is(postData, "object")) {
                        var pd = [];
                        for (var key in postData) {
                            if (postData.hasOwnProperty(key)) {
                                pd.push(encodeURIComponent(key) + "=" + encodeURIComponent(postData[key]));
                            }
                        }
                        postData = pd.join("&");
                    }
                    req.open(postData ? "POST" : "GET", url, true);
                    if (postData) {
                        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    }
                    if (callback) {
                        eve.once("snap.ajax." + id + ".0", callback);
                        eve.once("snap.ajax." + id + ".200", callback);
                        eve.once("snap.ajax." + id + ".304", callback);
                    }
                    req.onreadystatechange = function () {
                        if (req.readyState != 4) return;
                        eve("snap.ajax." + id + "." + req.status, scope, req);
                    };
                    if (req.readyState == 4) {
                        return req;
                    }
                    req.send(postData);
                    return req;
                }
            };
            /*\
             * Snap.load
             [ method ]
             **
             * Loads external SVG file as a @Fragment (see @Snap.ajax for more advanced AJAX)
             **
             - url (string) URL
             - callback (function) callback
             - scope (object) #optional scope of callback
            \*/
            Snap.load = function (url, callback, scope) {
                Snap.ajax(url, function (req) {
                    var f = Snap.parse(req.responseText);
                    scope ? callback.call(scope, f) : callback(f);
                });
            };
            var getOffset = function getOffset(elem) {
                var box = elem.getBoundingClientRect(),
                    doc = elem.ownerDocument,
                    body = doc.body,
                    docElem = doc.documentElement,
                    clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
                    top = box.top + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop) - clientTop,
                    left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
                return {
                    y: top,
                    x: left
                };

            };
            /*\
             * Snap.getElementByPoint
             [ method ]
             **
             * Returns you topmost element under given point.
             **
             = (object) Snap element object
             - x (number) x coordinate from the top left corner of the window
             - y (number) y coordinate from the top left corner of the window
             > Usage
             | Snap.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
            \*/
            Snap.getElementByPoint = function (x, y) {
                var paper = this,
                    svg = paper.canvas,
                    target = glob.doc.elementFromPoint(x, y);
                if (glob.win.opera && target.tagName == "svg") {
                    var so = getOffset(target),
                        sr = target.createSVGRect();
                    sr.x = x - so.x;
                    sr.y = y - so.y;
                    sr.width = sr.height = 1;
                    var hits = target.getIntersectionList(sr, null);
                    if (hits.length) {
                        target = hits[hits.length - 1];
                    }
                }
                if (!target) {
                    return null;
                }
                return wrap(target);
            };
            /*\
             * Snap.plugin
             [ method ]
             **
             * Let you write plugins. You pass in a function with five arguments, like this:
             | Snap.plugin(function (Snap, Element, Paper, global, Fragment) {
             |     Snap.newmethod = function () {};
             |     Element.prototype.newmethod = function () {};
             |     Paper.prototype.newmethod = function () {};
             | });
             * Inside the function you have access to all main objects (and their
             * prototypes). This allow you to extend anything you want.
             **
             - f (function) your plugin body
            \*/
            Snap.plugin = function (f) {
                f(Snap, Element, Paper, glob, Fragment);
            };
            glob.win.Snap = Snap;
            return Snap;
        }(window || this);

        // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
            var elproto = Element.prototype,
                is = Snap.is,
                Str = String,
                unit2px = Snap._unit2px,
                $ = Snap._.$,
                make = Snap._.make,
                getSomeDefs = Snap._.getSomeDefs,
                has = "hasOwnProperty",
                wrap = Snap._.wrap;
            /*\
                 * Element.getBBox
                 [ method ]
                 **
                 * Returns the bounding box descriptor for the given element
                 **
                 = (object) bounding box descriptor:
                 o {
                 o     cx: (number) x of the center,
                 o     cy: (number) x of the center,
                 o     h: (number) height,
                 o     height: (number) height,
                 o     path: (string) path command for the box,
                 o     r0: (number) radius of a circle that fully encloses the box,
                 o     r1: (number) radius of the smallest circle that can be enclosed,
                 o     r2: (number) radius of the largest circle that can be enclosed,
                 o     vb: (string) box as a viewbox command,
                 o     w: (number) width,
                 o     width: (number) width,
                 o     x2: (number) x of the right side,
                 o     x: (number) x of the left side,
                 o     y2: (number) y of the bottom edge,
                 o     y: (number) y of the top edge
                 o }
                \*/
            elproto.getBBox = function (isWithoutTransform) {
                if (this.type == "tspan") {
                    return Snap._.box(this.node.getClientRects().item(0));
                }
                if (!Snap.Matrix || !Snap.path) {
                    return this.node.getBBox();
                }
                var el = this,
                    m = new Snap.Matrix();
                if (el.removed) {
                    return Snap._.box();
                }
                while (el.type == "use") {
                    if (!isWithoutTransform) {
                        m = m.add(el.transform().localMatrix.translate(el.attr("x") || 0, el.attr("y") || 0));
                    }
                    if (el.original) {
                        el = el.original;
                    } else {
                        var href = el.attr("xlink:href");
                        el = el.original = el.node.ownerDocument.getElementById(href.substring(href.indexOf("#") + 1));
                    }
                }
                var _ = el._,
                    pathfinder = Snap.path.get[el.type] || Snap.path.get.deflt;
                try {
                    if (isWithoutTransform) {
                        _.bboxwt = pathfinder ? Snap.path.getBBox(el.realPath = pathfinder(el)) : Snap._.box(el.node.getBBox());
                        return Snap._.box(_.bboxwt);
                    } else {
                        el.realPath = pathfinder(el);
                        el.matrix = el.transform().localMatrix;
                        _.bbox = Snap.path.getBBox(Snap.path.map(el.realPath, m.add(el.matrix)));
                        return Snap._.box(_.bbox);
                    }
                } catch (e) {
                    // Firefox doesn’t give you bbox of hidden element
                    return Snap._.box();
                }
            };
            var propString = function propString() {
                return this.string;
            };
            function extractTransform(el, tstr) {
                if (tstr == null) {
                    var doReturn = true;
                    if (el.type == "linearGradient" || el.type == "radialGradient") {
                        tstr = el.node.getAttribute("gradientTransform");
                    } else if (el.type == "pattern") {
                        tstr = el.node.getAttribute("patternTransform");
                    } else {
                        tstr = el.node.getAttribute("transform");
                    }
                    if (!tstr) {
                        return new Snap.Matrix();
                    }
                    tstr = Snap._.svgTransform2string(tstr);
                } else {
                    if (!Snap._.rgTransform.test(tstr)) {
                        tstr = Snap._.svgTransform2string(tstr);
                    } else {
                        tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || "");
                    }
                    if (is(tstr, "array")) {
                        tstr = Snap.path ? Snap.path.toString.call(tstr) : Str(tstr);
                    }
                    el._.transform = tstr;
                }
                var m = Snap._.transform2matrix(tstr, el.getBBox(1));
                if (doReturn) {
                    return m;
                } else {
                    el.matrix = m;
                }
            }
            /*\
                 * Element.transform
                 [ method ]
                 **
                 * Gets or sets transformation of the element
                 **
                 - tstr (string) transform string in Snap or SVG format
                 = (Element) the current element
                 * or
                 = (object) transformation descriptor:
                 o {
                 o     string (string) transform string,
                 o     globalMatrix (Matrix) matrix of all transformations applied to element or its parents,
                 o     localMatrix (Matrix) matrix of transformations applied only to the element,
                 o     diffMatrix (Matrix) matrix of difference between global and local transformations,
                 o     global (string) global transformation as string,
                 o     local (string) local transformation as string,
                 o     toString (function) returns `string` property
                 o }
                \*/
            elproto.transform = function (tstr) {
                var _ = this._;
                if (tstr == null) {
                    var papa = this,
                        global = new Snap.Matrix(this.node.getCTM()),
                        local = extractTransform(this),
                        ms = [local],
                        m = new Snap.Matrix(),
                        i,
                        localString = local.toTransformString(),
                        string = Str(local) == Str(this.matrix) ?
                            Str(_.transform) : localString;
                    while (papa.type != "svg" && (papa = papa.parent())) {
                        ms.push(extractTransform(papa));
                    }
                    i = ms.length;
                    while (i--) {
                        m.add(ms[i]);
                    }
                    return {
                        string: string,
                        globalMatrix: global,
                        totalMatrix: m,
                        localMatrix: local,
                        diffMatrix: global.clone().add(local.invert()),
                        global: global.toTransformString(),
                        total: m.toTransformString(),
                        local: localString,
                        toString: propString
                    };

                }
                if (tstr instanceof Snap.Matrix) {
                    this.matrix = tstr;
                    this._.transform = tstr.toTransformString();
                } else {
                    extractTransform(this, tstr);
                }

                if (this.node) {
                    if (this.type == "linearGradient" || this.type == "radialGradient") {
                        $(this.node, { gradientTransform: this.matrix });
                    } else if (this.type == "pattern") {
                        $(this.node, { patternTransform: this.matrix });
                    } else {
                        $(this.node, { transform: this.matrix });
                    }
                }

                return this;
            };
            /*\
                 * Element.parent
                 [ method ]
                 **
                 * Returns the element's parent
                 **
                 = (Element) the parent element
                \*/
            elproto.parent = function () {
                return wrap(this.node.parentNode);
            };
            /*\
                 * Element.append
                 [ method ]
                 **
                 * Appends the given element to current one
                 **
                 - el (Element|Set) element to append
                 = (Element) the parent element
                \*/
            /*\
                 * Element.add
                 [ method ]
                 **
                 * See @Element.append
                \*/
            elproto.append = elproto.add = function (el) {
                if (el) {
                    if (el.type == "set") {
                        var it = this;
                        el.forEach(function (el) {
                            it.add(el);
                        });
                        return this;
                    }
                    el = wrap(el);
                    this.node.appendChild(el.node);
                    el.paper = this.paper;
                }
                return this;
            };
            /*\
                 * Element.appendTo
                 [ method ]
                 **
                 * Appends the current element to the given one
                 **
                 - el (Element) parent element to append to
                 = (Element) the child element
                \*/
            elproto.appendTo = function (el) {
                if (el) {
                    el = wrap(el);
                    el.append(this);
                }
                return this;
            };
            /*\
                 * Element.prepend
                 [ method ]
                 **
                 * Prepends the given element to the current one
                 **
                 - el (Element) element to prepend
                 = (Element) the parent element
                \*/
            elproto.prepend = function (el) {
                if (el) {
                    if (el.type == "set") {
                        var it = this,
                            first;
                        el.forEach(function (el) {
                            if (first) {
                                first.after(el);
                            } else {
                                it.prepend(el);
                            }
                            first = el;
                        });
                        return this;
                    }
                    el = wrap(el);
                    var parent = el.parent();
                    this.node.insertBefore(el.node, this.node.firstChild);
                    this.add && this.add();
                    el.paper = this.paper;
                    this.parent() && this.parent().add();
                    parent && parent.add();
                }
                return this;
            };
            /*\
                 * Element.prependTo
                 [ method ]
                 **
                 * Prepends the current element to the given one
                 **
                 - el (Element) parent element to prepend to
                 = (Element) the child element
                \*/
            elproto.prependTo = function (el) {
                el = wrap(el);
                el.prepend(this);
                return this;
            };
            /*\
                 * Element.before
                 [ method ]
                 **
                 * Inserts given element before the current one
                 **
                 - el (Element) element to insert
                 = (Element) the parent element
                \*/
            elproto.before = function (el) {
                if (el.type == "set") {
                    var it = this;
                    el.forEach(function (el) {
                        var parent = el.parent();
                        it.node.parentNode.insertBefore(el.node, it.node);
                        parent && parent.add();
                    });
                    this.parent().add();
                    return this;
                }
                el = wrap(el);
                var parent = el.parent();
                this.node.parentNode.insertBefore(el.node, this.node);
                this.parent() && this.parent().add();
                parent && parent.add();
                el.paper = this.paper;
                return this;
            };
            /*\
                 * Element.after
                 [ method ]
                 **
                 * Inserts given element after the current one
                 **
                 - el (Element) element to insert
                 = (Element) the parent element
                \*/
            elproto.after = function (el) {
                el = wrap(el);
                var parent = el.parent();
                if (this.node.nextSibling) {
                    this.node.parentNode.insertBefore(el.node, this.node.nextSibling);
                } else {
                    this.node.parentNode.appendChild(el.node);
                }
                this.parent() && this.parent().add();
                parent && parent.add();
                el.paper = this.paper;
                return this;
            };
            /*\
                 * Element.insertBefore
                 [ method ]
                 **
                 * Inserts the element after the given one
                 **
                 - el (Element) element next to whom insert to
                 = (Element) the parent element
                \*/
            elproto.insertBefore = function (el) {
                el = wrap(el);
                var parent = this.parent();
                el.node.parentNode.insertBefore(this.node, el.node);
                this.paper = el.paper;
                parent && parent.add();
                el.parent() && el.parent().add();
                return this;
            };
            /*\
                 * Element.insertAfter
                 [ method ]
                 **
                 * Inserts the element after the given one
                 **
                 - el (Element) element next to whom insert to
                 = (Element) the parent element
                \*/
            elproto.insertAfter = function (el) {
                el = wrap(el);
                var parent = this.parent();
                el.node.parentNode.insertBefore(this.node, el.node.nextSibling);
                this.paper = el.paper;
                parent && parent.add();
                el.parent() && el.parent().add();
                return this;
            };
            /*\
                 * Element.remove
                 [ method ]
                 **
                 * Removes element from the DOM
                 = (Element) the detached element
                \*/
            elproto.remove = function () {
                var parent = this.parent();
                this.node.parentNode && this.node.parentNode.removeChild(this.node);
                delete this.paper;
                this.removed = true;
                parent && parent.add();
                return this;
            };
            /*\
                 * Element.select
                 [ method ]
                 **
                 * Gathers the nested @Element matching the given set of CSS selectors
                 **
                 - query (string) CSS selector
                 = (Element) result of query selection
                \*/
            elproto.select = function (query) {
                return wrap(this.node.querySelector(query));
            };
            /*\
                 * Element.selectAll
                 [ method ]
                 **
                 * Gathers nested @Element objects matching the given set of CSS selectors
                 **
                 - query (string) CSS selector
                 = (Set|array) result of query selection
                \*/
            elproto.selectAll = function (query) {
                var nodelist = this.node.querySelectorAll(query),
                    set = (Snap.set || Array)();
                for (var i = 0; i < nodelist.length; i++) {
                    set.push(wrap(nodelist[i]));
                }
                return set;
            };
            /*\
                 * Element.asPX
                 [ method ]
                 **
                 * Returns given attribute of the element as a `px` value (not %, em, etc.)
                 **
                 - attr (string) attribute name
                 - value (string) #optional attribute value
                 = (Element) result of query selection
                \*/
            elproto.asPX = function (attr, value) {
                if (value == null) {
                    value = this.attr(attr);
                }
                return +unit2px(this, attr, value);
            };
            // SIERRA Element.use(): I suggest adding a note about how to access the original element the returned <use> instantiates. It's a part of SVG with which ordinary web developers may be least familiar.
            /*\
                 * Element.use
                 [ method ]
                 **
                 * Creates a `<use>` element linked to the current element
                 **
                 = (Element) the `<use>` element
                \*/
            elproto.use = function () {
                var use,
                    id = this.node.id;
                if (!id) {
                    id = this.id;
                    $(this.node, {
                        id: id
                    });

                }
                if (this.type == "linearGradient" || this.type == "radialGradient" ||
                    this.type == "pattern") {
                    use = make(this.type, this.node.parentNode);
                } else {
                    use = make("use", this.node.parentNode);
                }
                $(use.node, {
                    "xlink:href": "#" + id
                });

                use.original = this;
                return use;
            };
            function fixids(el) {
                var els = el.selectAll("*"),
                    it,
                    url = /^\s*url\(("|'|)(.*)\1\)\s*$/,
                    ids = [],
                    uses = {};
                function urltest(it, name) {
                    var val = $(it.node, name);
                    val = val && val.match(url);
                    val = val && val[2];
                    if (val && val.charAt() == "#") {
                        val = val.substring(1);
                    } else {
                        return;
                    }
                    if (val) {
                        uses[val] = (uses[val] || []).concat(function (id) {
                            var attr = {};
                            attr[name] = Snap.url(id);
                            $(it.node, attr);
                        });
                    }
                }
                function linktest(it) {
                    var val = $(it.node, "xlink:href");
                    if (val && val.charAt() == "#") {
                        val = val.substring(1);
                    } else {
                        return;
                    }
                    if (val) {
                        uses[val] = (uses[val] || []).concat(function (id) {
                            it.attr("xlink:href", "#" + id);
                        });
                    }
                }
                for (var i = 0, ii = els.length; i < ii; i++) {
                    it = els[i];
                    urltest(it, "fill");
                    urltest(it, "stroke");
                    urltest(it, "filter");
                    urltest(it, "mask");
                    urltest(it, "clip-path");
                    linktest(it);
                    var oldid = $(it.node, "id");
                    if (oldid) {
                        $(it.node, { id: it.id });
                        ids.push({
                            old: oldid,
                            id: it.id
                        });

                    }
                }
                for (i = 0, ii = ids.length; i < ii; i++) {
                    var fs = uses[ids[i].old];
                    if (fs) {
                        for (var j = 0, jj = fs.length; j < jj; j++) {
                            fs[j](ids[i].id);
                        }
                    }
                }
            }
            /*\
                 * Element.clone
                 [ method ]
                 **
                 * Creates a clone of the element and inserts it after the element
                 **
                 = (Element) the clone
                \*/
            elproto.clone = function () {
                var clone = wrap(this.node.cloneNode(true));
                if ($(clone.node, "id")) {
                    $(clone.node, { id: clone.id });
                }
                fixids(clone);
                clone.insertAfter(this);
                return clone;
            };
            /*\
                 * Element.toDefs
                 [ method ]
                 **
                 * Moves element to the shared `<defs>` area
                 **
                 = (Element) the element
                \*/
            elproto.toDefs = function () {
                var defs = getSomeDefs(this);
                defs.appendChild(this.node);
                return this;
            };
            /*\
                 * Element.toPattern
                 [ method ]
                 **
                 * Creates a `<pattern>` element from the current element
                 **
                 * To create a pattern you have to specify the pattern rect:
                 - x (string|number)
                 - y (string|number)
                 - width (string|number)
                 - height (string|number)
                 = (Element) the `<pattern>` element
                 * You can use pattern later on as an argument for `fill` attribute:
                 | var p = paper.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
                 |         fill: "none",
                 |         stroke: "#bada55",
                 |         strokeWidth: 5
                 |     }).pattern(0, 0, 10, 10),
                 |     c = paper.circle(200, 200, 100);
                 | c.attr({
                 |     fill: p
                 | });
                \*/
            elproto.pattern = elproto.toPattern = function (x, y, width, height) {
                var p = make("pattern", getSomeDefs(this));
                if (x == null) {
                    x = this.getBBox();
                }
                if (is(x, "object") && "x" in x) {
                    y = x.y;
                    width = x.width;
                    height = x.height;
                    x = x.x;
                }
                $(p.node, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    patternUnits: "userSpaceOnUse",
                    id: p.id,
                    viewBox: [x, y, width, height].join(" ")
                });

                p.node.appendChild(this.node);
                return p;
            };
            // SIERRA Element.marker(): clarify what a reference point is. E.g., helps you offset the object from its edge such as when centering it over a path.
            // SIERRA Element.marker(): I suggest the method should accept default reference point values.  Perhaps centered with (refX = width/2) and (refY = height/2)? Also, couldn't it assume the element's current _width_ and _height_? And please specify what _x_ and _y_ mean: offsets? If so, from where?  Couldn't they also be assigned default values?
            /*\
                 * Element.marker
                 [ method ]
                 **
                 * Creates a `<marker>` element from the current element
                 **
                 * To create a marker you have to specify the bounding rect and reference point:
                 - x (number)
                 - y (number)
                 - width (number)
                 - height (number)
                 - refX (number)
                 - refY (number)
                 = (Element) the `<marker>` element
                 * You can specify the marker later as an argument for `marker-start`, `marker-end`, `marker-mid`, and `marker` attributes. The `marker` attribute places the marker at every point along the path, and `marker-mid` places them at every point except the start and end.
                \*/
            // TODO add usage for markers
            elproto.marker = function (x, y, width, height, refX, refY) {
                var p = make("marker", getSomeDefs(this));
                if (x == null) {
                    x = this.getBBox();
                }
                if (is(x, "object") && "x" in x) {
                    y = x.y;
                    width = x.width;
                    height = x.height;
                    refX = x.refX || x.cx;
                    refY = x.refY || x.cy;
                    x = x.x;
                }
                $(p.node, {
                    viewBox: [x, y, width, height].join(" "),
                    markerWidth: width,
                    markerHeight: height,
                    orient: "auto",
                    refX: refX || 0,
                    refY: refY || 0,
                    id: p.id
                });

                p.node.appendChild(this.node);
                return p;
            };
            var eldata = {};
            /*\
                 * Element.data
                 [ method ]
                 **
                 * Adds or retrieves given value associated with given key. (Don’t confuse
                 * with `data-` attributes)
                 *
                 * See also @Element.removeData
                 - key (string) key to store data
                 - value (any) #optional value to store
                 = (object) @Element
                 * or, if value is not specified:
                 = (any) value
                 > Usage
                 | for (var i = 0, i < 5, i++) {
                 |     paper.circle(10 + 15 * i, 10, 10)
                 |          .attr({fill: "#000"})
                 |          .data("i", i)
                 |          .click(function () {
                 |             alert(this.data("i"));
                 |          });
                 | }
                \*/
            elproto.data = function (key, value) {
                var data = eldata[this.id] = eldata[this.id] || {};
                if (arguments.length == 0) {
                    eve("snap.data.get." + this.id, this, data, null);
                    return data;
                }
                if (arguments.length == 1) {
                    if (Snap.is(key, "object")) {
                        for (var i in key) {
                            if (key[has](i)) {
                                this.data(i, key[i]);
                            }
                        }
                        return this;
                    }
                    eve("snap.data.get." + this.id, this, data[key], key);
                    return data[key];
                }
                data[key] = value;
                eve("snap.data.set." + this.id, this, value, key);
                return this;
            };
            /*\
                 * Element.removeData
                 [ method ]
                 **
                 * Removes value associated with an element by given key.
                 * If key is not provided, removes all the data of the element.
                 - key (string) #optional key
                 = (object) @Element
                \*/
            elproto.removeData = function (key) {
                if (key == null) {
                    eldata[this.id] = {};
                } else {
                    eldata[this.id] && delete eldata[this.id][key];
                }
                return this;
            };
            /*\
                 * Element.outerSVG
                 [ method ]
                 **
                 * Returns SVG code for the element, equivalent to HTML's `outerHTML`.
                 *
                 * See also @Element.innerSVG
                 = (string) SVG code for the element
                \*/
            /*\
                 * Element.toString
                 [ method ]
                 **
                 * See @Element.outerSVG
                \*/
            elproto.outerSVG = elproto.toString = toString(1);
            /*\
                 * Element.innerSVG
                 [ method ]
                 **
                 * Returns SVG code for the element's contents, equivalent to HTML's `innerHTML`
                 = (string) SVG code for the element
                \*/
            elproto.innerSVG = toString();
            function toString(type) {
                return function () {
                    var res = type ? "<" + this.type : "",
                        attr = this.node.attributes,
                        chld = this.node.childNodes;
                    if (type) {
                        for (var i = 0, ii = attr.length; i < ii; i++) {
                            res += " " + attr[i].name + '="' +
                                attr[i].value.replace(/"/g, '\\"') + '"';
                        }
                    }
                    if (chld.length) {
                        type && (res += ">");
                        for (i = 0, ii = chld.length; i < ii; i++) {
                            if (chld[i].nodeType == 3) {
                                res += chld[i].nodeValue;
                            } else if (chld[i].nodeType == 1) {
                                res += wrap(chld[i]).toString();
                            }
                        }
                        type && (res += "</" + this.type + ">");
                    } else {
                        type && (res += "/>");
                    }
                    return res;
                };
            }
            elproto.toDataURL = function () {
                if (window && window.btoa) {
                    var bb = this.getBBox(),
                        svg = Snap.format('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{width}" height="{height}" viewBox="{x} {y} {width} {height}">{contents}</svg>', {
                            x: +bb.x.toFixed(3),
                            y: +bb.y.toFixed(3),
                            width: +bb.width.toFixed(3),
                            height: +bb.height.toFixed(3),
                            contents: this.outerSVG()
                        });

                    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
                }
            };
            /*\
                 * Fragment.select
                 [ method ]
                 **
                 * See @Element.select
                \*/
            Fragment.prototype.select = elproto.select;
            /*\
                 * Fragment.selectAll
                 [ method ]
                 **
                 * See @Element.selectAll
                \*/
            Fragment.prototype.selectAll = elproto.selectAll;
        });

        // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
            var objectToString = Object.prototype.toString,
                Str = String,
                math = Math,
                E = "";
            function Matrix(a, b, c, d, e, f) {
                if (b == null && objectToString.call(a) == "[object SVGMatrix]") {
                    this.a = a.a;
                    this.b = a.b;
                    this.c = a.c;
                    this.d = a.d;
                    this.e = a.e;
                    this.f = a.f;
                    return;
                }
                if (a != null) {
                    this.a = +a;
                    this.b = +b;
                    this.c = +c;
                    this.d = +d;
                    this.e = +e;
                    this.f = +f;
                } else {
                    this.a = 1;
                    this.b = 0;
                    this.c = 0;
                    this.d = 1;
                    this.e = 0;
                    this.f = 0;
                }
            }
            (function (matrixproto) {
                /*\
                         * Matrix.add
                         [ method ]
                         **
                         * Adds the given matrix to existing one
                         - a (number)
                         - b (number)
                         - c (number)
                         - d (number)
                         - e (number)
                         - f (number)
                         * or
                         - matrix (object) @Matrix
                        \*/
                matrixproto.add = function (a, b, c, d, e, f) {
                    if (a && a instanceof Matrix) {
                        return this.add(a.a, a.b, a.c, a.d, a.e, a.f);
                    }
                    var aNew = a * this.a + b * this.c,
                        bNew = a * this.b + b * this.d;
                    this.e += e * this.a + f * this.c;
                    this.f += e * this.b + f * this.d;
                    this.c = c * this.a + d * this.c;
                    this.d = c * this.b + d * this.d;

                    this.a = aNew;
                    this.b = bNew;
                    return this;
                };
                /*\
                         * Matrix.multLeft
                         [ method ]
                         **
                         * Multiplies a passed affine transform to the left: M * this.
                         - a (number)
                         - b (number)
                         - c (number)
                         - d (number)
                         - e (number)
                         - f (number)
                         * or
                         - matrix (object) @Matrix
                        \*/
                Matrix.prototype.multLeft = function (a, b, c, d, e, f) {
                    if (a && a instanceof Matrix) {
                        return this.multLeft(a.a, a.b, a.c, a.d, a.e, a.f);
                    }
                    var aNew = a * this.a + c * this.b,
                        cNew = a * this.c + c * this.d,
                        eNew = a * this.e + c * this.f + e;
                    this.b = b * this.a + d * this.b;
                    this.d = b * this.c + d * this.d;
                    this.f = b * this.e + d * this.f + f;

                    this.a = aNew;
                    this.c = cNew;
                    this.e = eNew;
                    return this;
                };
                /*\
                         * Matrix.invert
                         [ method ]
                         **
                         * Returns an inverted version of the matrix
                         = (object) @Matrix
                        \*/
                matrixproto.invert = function () {
                    var me = this,
                        x = me.a * me.d - me.b * me.c;
                    return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
                };
                /*\
                         * Matrix.clone
                         [ method ]
                         **
                         * Returns a copy of the matrix
                         = (object) @Matrix
                        \*/
                matrixproto.clone = function () {
                    return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
                };
                /*\
                         * Matrix.translate
                         [ method ]
                         **
                         * Translate the matrix
                         - x (number) horizontal offset distance
                         - y (number) vertical offset distance
                        \*/
                matrixproto.translate = function (x, y) {
                    this.e += x * this.a + y * this.c;
                    this.f += x * this.b + y * this.d;
                    return this;
                };
                /*\
                         * Matrix.scale
                         [ method ]
                         **
                         * Scales the matrix
                         - x (number) amount to be scaled, with `1` resulting in no change
                         - y (number) #optional amount to scale along the vertical axis. (Otherwise `x` applies to both axes.)
                         - cx (number) #optional horizontal origin point from which to scale
                         - cy (number) #optional vertical origin point from which to scale
                         * Default cx, cy is the middle point of the element.
                        \*/
                matrixproto.scale = function (x, y, cx, cy) {
                    y == null && (y = x);
                    (cx || cy) && this.translate(cx, cy);
                    this.a *= x;
                    this.b *= x;
                    this.c *= y;
                    this.d *= y;
                    (cx || cy) && this.translate(-cx, -cy);
                    return this;
                };
                /*\
                         * Matrix.rotate
                         [ method ]
                         **
                         * Rotates the matrix
                         - a (number) angle of rotation, in degrees
                         - x (number) horizontal origin point from which to rotate
                         - y (number) vertical origin point from which to rotate
                        \*/
                matrixproto.rotate = function (a, x, y) {
                    a = Snap.rad(a);
                    x = x || 0;
                    y = y || 0;
                    var cos = +math.cos(a).toFixed(9),
                        sin = +math.sin(a).toFixed(9);
                    this.add(cos, sin, -sin, cos, x, y);
                    return this.add(1, 0, 0, 1, -x, -y);
                };
                /*\
                         * Matrix.skewX
                         [ method ]
                         **
                         * Skews the matrix along the x-axis
                         - x (number) Angle to skew along the x-axis (in degrees).
                        \*/
                matrixproto.skewX = function (x) {
                    return this.skew(x, 0);
                };
                /*\
                         * Matrix.skewY
                         [ method ]
                         **
                         * Skews the matrix along the y-axis
                         - y (number) Angle to skew along the y-axis (in degrees).
                        \*/
                matrixproto.skewY = function (y) {
                    return this.skew(0, y);
                };
                /*\
                         * Matrix.skew
                         [ method ]
                         **
                         * Skews the matrix
                         - y (number) Angle to skew along the y-axis (in degrees).
                         - x (number) Angle to skew along the x-axis (in degrees).
                        \*/
                matrixproto.skew = function (x, y) {
                    x = x || 0;
                    y = y || 0;
                    x = Snap.rad(x);
                    y = Snap.rad(y);
                    var c = math.tan(x).toFixed(9);
                    var b = math.tan(y).toFixed(9);
                    return this.add(1, b, c, 1, 0, 0);
                };
                /*\
                         * Matrix.x
                         [ method ]
                         **
                         * Returns x coordinate for given point after transformation described by the matrix. See also @Matrix.y
                         - x (number)
                         - y (number)
                         = (number) x
                        \*/
                matrixproto.x = function (x, y) {
                    return x * this.a + y * this.c + this.e;
                };
                /*\
                         * Matrix.y
                         [ method ]
                         **
                         * Returns y coordinate for given point after transformation described by the matrix. See also @Matrix.x
                         - x (number)
                         - y (number)
                         = (number) y
                        \*/
                matrixproto.y = function (x, y) {
                    return x * this.b + y * this.d + this.f;
                };
                matrixproto.get = function (i) {
                    return +this[Str.fromCharCode(97 + i)].toFixed(4);
                };
                matrixproto.toString = function () {
                    return "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")";
                };
                matrixproto.offset = function () {
                    return [this.e.toFixed(4), this.f.toFixed(4)];
                };
                function norm(a) {
                    return a[0] * a[0] + a[1] * a[1];
                }
                function normalize(a) {
                    var mag = math.sqrt(norm(a));
                    a[0] && (a[0] /= mag);
                    a[1] && (a[1] /= mag);
                }
                /*\
                         * Matrix.determinant
                         [ method ]
                         **
                         * Finds determinant of the given matrix.
                         = (number) determinant
                        \*/
                matrixproto.determinant = function () {
                    return this.a * this.d - this.b * this.c;
                };
                /*\
                         * Matrix.split
                         [ method ]
                         **
                         * Splits matrix into primitive transformations
                         = (object) in format:
                         o dx (number) translation by x
                         o dy (number) translation by y
                         o scalex (number) scale by x
                         o scaley (number) scale by y
                         o shear (number) shear
                         o rotate (number) rotation in deg
                         o isSimple (boolean) could it be represented via simple transformations
                        \*/
                matrixproto.split = function () {
                    var out = {};
                    // translation
                    out.dx = this.e;
                    out.dy = this.f;

                    // scale and shear
                    var row = [[this.a, this.b], [this.c, this.d]];
                    out.scalex = math.sqrt(norm(row[0]));
                    normalize(row[0]);

                    out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
                    row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

                    out.scaley = math.sqrt(norm(row[1]));
                    normalize(row[1]);
                    out.shear /= out.scaley;

                    if (this.determinant() < 0) {
                        out.scalex = -out.scalex;
                    }

                    // rotation
                    var sin = row[0][1],
                        cos = row[1][1];
                    if (cos < 0) {
                        out.rotate = Snap.deg(math.acos(cos));
                        if (sin < 0) {
                            out.rotate = 360 - out.rotate;
                        }
                    } else {
                        out.rotate = Snap.deg(math.asin(sin));
                    }

                    out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
                    out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
                    out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
                    return out;
                };
                /*\
                         * Matrix.toTransformString
                         [ method ]
                         **
                         * Returns transform string that represents given matrix
                         = (string) transform string
                        \*/
                matrixproto.toTransformString = function (shorter) {
                    var s = shorter || this.split();
                    if (!+s.shear.toFixed(9)) {
                        s.scalex = +s.scalex.toFixed(4);
                        s.scaley = +s.scaley.toFixed(4);
                        s.rotate = +s.rotate.toFixed(4);
                        return (s.dx || s.dy ? "t" + [+s.dx.toFixed(4), +s.dy.toFixed(4)] : E) + (
                            s.rotate ? "r" + [+s.rotate.toFixed(4), 0, 0] : E) + (
                                s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E);
                    } else {
                        return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
                    }
                };
            })(Matrix.prototype);
            /*\
                 * Snap.Matrix
                 [ method ]
                 **
                 * Matrix constructor, extend on your own risk.
                 * To create matrices use @Snap.matrix.
                \*/
            Snap.Matrix = Matrix;
            /*\
                 * Snap.matrix
                 [ method ]
                 **
                 * Utility method
                 **
                 * Returns a matrix based on the given parameters
                 - a (number)
                 - b (number)
                 - c (number)
                 - d (number)
                 - e (number)
                 - f (number)
                 * or
                 - svgMatrix (SVGMatrix)
                 = (object) @Matrix
                \*/
            Snap.matrix = function (a, b, c, d, e, f) {
                return new Matrix(a, b, c, d, e, f);
            };
        });

        // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
            var has = "hasOwnProperty",
                make = Snap._.make,
                wrap = Snap._.wrap,
                is = Snap.is,
                getSomeDefs = Snap._.getSomeDefs,
                reURLValue = /^url\((['"]?)([^)]+)\1\)$/,
                $ = Snap._.$,
                URL = Snap.url,
                Str = String,
                separator = Snap._.separator,
                E = "";
            /*\
                 * Snap.deurl
                 [ method ]
                 **
                 * Unwraps path from `"url(<path>)"`.
                 - value (string) url path
                 = (string) unwrapped path
                \*/
            Snap.deurl = function (value) {
                var res = String(value).match(reURLValue);
                return res ? res[2] : value;
            };
            // Attributes event handlers
            eve.on("snap.util.attr.mask", function (value) {
                if (value instanceof Element || value instanceof Fragment) {
                    eve.stop();
                    if (value instanceof Fragment && value.node.childNodes.length == 1) {
                        value = value.node.firstChild;
                        getSomeDefs(this).appendChild(value);
                        value = wrap(value);
                    }
                    if (value.type == "mask") {
                        var mask = value;
                    } else {
                        mask = make("mask", getSomeDefs(this));
                        mask.node.appendChild(value.node);
                    }
                    !mask.node.id && $(mask.node, {
                        id: mask.id
                    });

                    $(this.node, {
                        mask: URL(mask.id)
                    });

                }
            });
            (function (clipIt) {
                eve.on("snap.util.attr.clip", clipIt);
                eve.on("snap.util.attr.clip-path", clipIt);
                eve.on("snap.util.attr.clipPath", clipIt);
            })(function (value) {
                if (value instanceof Element || value instanceof Fragment) {
                    eve.stop();
                    var clip,
                        node = value.node;
                    while (node) {
                        if (node.nodeName === "clipPath") {
                            clip = new Element(node);
                            break;
                        }
                        if (node.nodeName === "svg") {
                            clip = undefined;
                            break;
                        }
                        node = node.parentNode;
                    }
                    if (!clip) {
                        clip = make("clipPath", getSomeDefs(this));
                        clip.node.appendChild(value.node);
                        !clip.node.id && $(clip.node, {
                            id: clip.id
                        });

                    }
                    $(this.node, {
                        "clip-path": URL(clip.node.id || clip.id)
                    });

                }
            });
            function fillStroke(name) {
                return function (value) {
                    eve.stop();
                    if (value instanceof Fragment && value.node.childNodes.length == 1 && (
                        value.node.firstChild.tagName == "radialGradient" ||
                        value.node.firstChild.tagName == "linearGradient" ||
                        value.node.firstChild.tagName == "pattern")) {
                        value = value.node.firstChild;
                        getSomeDefs(this).appendChild(value);
                        value = wrap(value);
                    }
                    if (value instanceof Element) {
                        if (value.type == "radialGradient" || value.type == "linearGradient" ||
                            value.type == "pattern") {
                            if (!value.node.id) {
                                $(value.node, {
                                    id: value.id
                                });

                            }
                            var fill = URL(value.node.id);
                        } else {
                            fill = value.attr(name);
                        }
                    } else {
                        fill = Snap.color(value);
                        if (fill.error) {
                            var grad = Snap(getSomeDefs(this).ownerSVGElement).gradient(value);
                            if (grad) {
                                if (!grad.node.id) {
                                    $(grad.node, {
                                        id: grad.id
                                    });

                                }
                                fill = URL(grad.node.id);
                            } else {
                                fill = value;
                            }
                        } else {
                            fill = Str(fill);
                        }
                    }
                    var attrs = {};
                    attrs[name] = fill;
                    $(this.node, attrs);
                    this.node.style[name] = E;
                };
            }
            eve.on("snap.util.attr.fill", fillStroke("fill"));
            eve.on("snap.util.attr.stroke", fillStroke("stroke"));
            var gradrg = /^([lr])(?:\(([^)]*)\))?(.*)$/i;
            eve.on("snap.util.grad.parse", function parseGrad(string) {
                string = Str(string);
                var tokens = string.match(gradrg);
                if (!tokens) {
                    return null;
                }
                var type = tokens[1],
                    params = tokens[2],
                    stops = tokens[3];
                params = params.split(/\s*,\s*/).map(function (el) {
                    return +el == el ? +el : el;
                });
                if (params.length == 1 && params[0] == 0) {
                    params = [];
                }
                stops = stops.split("-");
                stops = stops.map(function (el) {
                    el = el.split(":");
                    var out = {
                        color: el[0]
                    };

                    if (el[1]) {
                        out.offset = parseFloat(el[1]);
                    }
                    return out;
                });
                var len = stops.length,
                    start = 0,
                    j = 0;
                function seed(i, end) {
                    var step = (end - start) / (i - j);
                    for (var k = j; k < i; k++) {
                        stops[k].offset = +(+start + step * (k - j)).toFixed(2);
                    }
                    j = i;
                    start = end;
                }
                len--;
                for (var i = 0; i < len; i++) {
                    if ("offset" in stops[i]) {
                        seed(i, stops[i].offset);
                    }
                }
                stops[len].offset = stops[len].offset || 100;
                seed(len, stops[len].offset);
                return {
                    type: type,
                    params: params,
                    stops: stops
                };

            });

            eve.on("snap.util.attr.d", function (value) {
                eve.stop();
                if (is(value, "array") && is(value[0], "array")) {
                    value = Snap.path.toString.call(value);
                }
                value = Str(value);
                if (value.match(/[ruo]/i)) {
                    value = Snap.path.toAbsolute(value);
                }
                $(this.node, { d: value });
            })(-1);
            eve.on("snap.util.attr.#text", function (value) {
                eve.stop();
                value = Str(value);
                var txt = glob.doc.createTextNode(value);
                while (this.node.firstChild) {
                    this.node.removeChild(this.node.firstChild);
                }
                this.node.appendChild(txt);
            })(-1);
            eve.on("snap.util.attr.path", function (value) {
                eve.stop();
                this.attr({ d: value });
            })(-1);
            eve.on("snap.util.attr.class", function (value) {
                eve.stop();
                this.node.className.baseVal = value;
            })(-1);
            eve.on("snap.util.attr.viewBox", function (value) {
                var vb;
                if (is(value, "object") && "x" in value) {
                    vb = [value.x, value.y, value.width, value.height].join(" ");
                } else if (is(value, "array")) {
                    vb = value.join(" ");
                } else {
                    vb = value;
                }
                $(this.node, {
                    viewBox: vb
                });

                eve.stop();
            })(-1);
            eve.on("snap.util.attr.transform", function (value) {
                this.transform(value);
                eve.stop();
            })(-1);
            eve.on("snap.util.attr.r", function (value) {
                if (this.type == "rect") {
                    eve.stop();
                    $(this.node, {
                        rx: value,
                        ry: value
                    });

                }
            })(-1);
            eve.on("snap.util.attr.textpath", function (value) {
                eve.stop();
                if (this.type == "text") {
                    var id, tp, node;
                    if (!value && this.textPath) {
                        tp = this.textPath;
                        while (tp.node.firstChild) {
                            this.node.appendChild(tp.node.firstChild);
                        }
                        tp.remove();
                        delete this.textPath;
                        return;
                    }
                    if (is(value, "string")) {
                        var defs = getSomeDefs(this),
                            path = wrap(defs.parentNode).path(value);
                        defs.appendChild(path.node);
                        id = path.id;
                        path.attr({ id: id });
                    } else {
                        value = wrap(value);
                        if (value instanceof Element) {
                            id = value.attr("id");
                            if (!id) {
                                id = value.id;
                                value.attr({ id: id });
                            }
                        }
                    }
                    if (id) {
                        tp = this.textPath;
                        node = this.node;
                        if (tp) {
                            tp.attr({ "xlink:href": "#" + id });
                        } else {
                            tp = $("textPath", {
                                "xlink:href": "#" + id
                            });

                            while (node.firstChild) {
                                tp.appendChild(node.firstChild);
                            }
                            node.appendChild(tp);
                            this.textPath = wrap(tp);
                        }
                    }
                }
            })(-1);
            eve.on("snap.util.attr.text", function (value) {
                if (this.type == "text") {
                    var i = 0,
                        node = this.node,
                        tuner = function tuner(chunk) {
                            var out = $("tspan");
                            if (is(chunk, "array")) {
                                for (var i = 0; i < chunk.length; i++) {
                                    out.appendChild(tuner(chunk[i]));
                                }
                            } else {
                                out.appendChild(glob.doc.createTextNode(chunk));
                            }
                            out.normalize && out.normalize();
                            return out;
                        };
                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                    var tuned = tuner(value);
                    while (tuned.firstChild) {
                        node.appendChild(tuned.firstChild);
                    }
                }
                eve.stop();
            })(-1);
            function setFontSize(value) {
                eve.stop();
                if (value == +value) {
                    value += "px";
                }
                this.node.style.fontSize = value;
            }
            eve.on("snap.util.attr.fontSize", setFontSize)(-1);
            eve.on("snap.util.attr.font-size", setFontSize)(-1);


            eve.on("snap.util.getattr.transform", function () {
                eve.stop();
                return this.transform();
            })(-1);
            eve.on("snap.util.getattr.textpath", function () {
                eve.stop();
                return this.textPath;
            })(-1);
            // Markers
            (function () {
                function getter(end) {
                    return function () {
                        eve.stop();
                        var style = glob.doc.defaultView.getComputedStyle(this.node, null).getPropertyValue("marker-" + end);
                        if (style == "none") {
                            return style;
                        } else {
                            return Snap(glob.doc.getElementById(style.match(reURLValue)[1]));
                        }
                    };
                }
                function setter(end) {
                    return function (value) {
                        eve.stop();
                        var name = "marker" + end.charAt(0).toUpperCase() + end.substring(1);
                        if (value == "" || !value) {
                            this.node.style[name] = "none";
                            return;
                        }
                        if (value.type == "marker") {
                            var id = value.node.id;
                            if (!id) {
                                $(value.node, { id: value.id });
                            }
                            this.node.style[name] = URL(id);
                            return;
                        }
                    };
                }
                eve.on("snap.util.getattr.marker-end", getter("end"))(-1);
                eve.on("snap.util.getattr.markerEnd", getter("end"))(-1);
                eve.on("snap.util.getattr.marker-start", getter("start"))(-1);
                eve.on("snap.util.getattr.markerStart", getter("start"))(-1);
                eve.on("snap.util.getattr.marker-mid", getter("mid"))(-1);
                eve.on("snap.util.getattr.markerMid", getter("mid"))(-1);
                eve.on("snap.util.attr.marker-end", setter("end"))(-1);
                eve.on("snap.util.attr.markerEnd", setter("end"))(-1);
                eve.on("snap.util.attr.marker-start", setter("start"))(-1);
                eve.on("snap.util.attr.markerStart", setter("start"))(-1);
                eve.on("snap.util.attr.marker-mid", setter("mid"))(-1);
                eve.on("snap.util.attr.markerMid", setter("mid"))(-1);
            })();
            eve.on("snap.util.getattr.r", function () {
                if (this.type == "rect" && $(this.node, "rx") == $(this.node, "ry")) {
                    eve.stop();
                    return $(this.node, "rx");
                }
            })(-1);
            function textExtract(node) {
                var out = [];
                var children = node.childNodes;
                for (var i = 0, ii = children.length; i < ii; i++) {
                    var chi = children[i];
                    if (chi.nodeType == 3) {
                        out.push(chi.nodeValue);
                    }
                    if (chi.tagName == "tspan") {
                        if (chi.childNodes.length == 1 && chi.firstChild.nodeType == 3) {
                            out.push(chi.firstChild.nodeValue);
                        } else {
                            out.push(textExtract(chi));
                        }
                    }
                }
                return out;
            }
            eve.on("snap.util.getattr.text", function () {
                if (this.type == "text" || this.type == "tspan") {
                    eve.stop();
                    var out = textExtract(this.node);
                    return out.length == 1 ? out[0] : out;
                }
            })(-1);
            eve.on("snap.util.getattr.#text", function () {
                return this.node.textContent;
            })(-1);
            eve.on("snap.util.getattr.fill", function (internal) {
                if (internal) {
                    return;
                }
                eve.stop();
                var value = eve("snap.util.getattr.fill", this, true).firstDefined();
                return Snap(Snap.deurl(value)) || value;
            })(-1);
            eve.on("snap.util.getattr.stroke", function (internal) {
                if (internal) {
                    return;
                }
                eve.stop();
                var value = eve("snap.util.getattr.stroke", this, true).firstDefined();
                return Snap(Snap.deurl(value)) || value;
            })(-1);
            eve.on("snap.util.getattr.viewBox", function () {
                eve.stop();
                var vb = $(this.node, "viewBox");
                if (vb) {
                    vb = vb.split(separator);
                    return Snap._.box(+vb[0], +vb[1], +vb[2], +vb[3]);
                } else {
                    return;
                }
            })(-1);
            eve.on("snap.util.getattr.points", function () {
                var p = $(this.node, "points");
                eve.stop();
                if (p) {
                    return p.split(separator);
                } else {
                    return;
                }
            })(-1);
            eve.on("snap.util.getattr.path", function () {
                var p = $(this.node, "d");
                eve.stop();
                return p;
            })(-1);
            eve.on("snap.util.getattr.class", function () {
                return this.node.className.baseVal;
            })(-1);
            function getFontSize() {
                eve.stop();
                return this.node.style.fontSize;
            }
            eve.on("snap.util.getattr.fontSize", getFontSize)(-1);
            eve.on("snap.util.getattr.font-size", getFontSize)(-1);
        });

        // Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
            var rgNotSpace = /\S+/g,
                rgBadSpace = /[\t\r\n\f]/g,
                rgTrim = /(^\s+|\s+$)/g,
                Str = String,
                elproto = Element.prototype;
            /*\
                 * Element.addClass
                 [ method ]
                 **
                 * Adds given class name or list of class names to the element.
                 - value (string) class name or space separated list of class names
                 **
                 = (Element) original element.
                \*/
            elproto.addClass = function (value) {
                var classes = Str(value || "").match(rgNotSpace) || [],
                    elem = this.node,
                    className = elem.className.baseVal,
                    curClasses = className.match(rgNotSpace) || [],
                    j,
                    pos,
                    clazz,
                    finalValue;

                if (classes.length) {
                    j = 0;
                    while (clazz = classes[j++]) {
                        pos = curClasses.indexOf(clazz);
                        if (!~pos) {
                            curClasses.push(clazz);
                        }
                    }

                    finalValue = curClasses.join(" ");
                    if (className != finalValue) {
                        elem.className.baseVal = finalValue;
                    }
                }
                return this;
            };
            /*\
                 * Element.removeClass
                 [ method ]
                 **
                 * Removes given class name or list of class names from the element.
                 - value (string) class name or space separated list of class names
                 **
                 = (Element) original element.
                \*/
            elproto.removeClass = function (value) {
                var classes = Str(value || "").match(rgNotSpace) || [],
                    elem = this.node,
                    className = elem.className.baseVal,
                    curClasses = className.match(rgNotSpace) || [],
                    j,
                    pos,
                    clazz,
                    finalValue;
                if (curClasses.length) {
                    j = 0;
                    while (clazz = classes[j++]) {
                        pos = curClasses.indexOf(clazz);
                        if (~pos) {
                            curClasses.splice(pos, 1);
                        }
                    }

                    finalValue = curClasses.join(" ");
                    if (className != finalValue) {
                        elem.className.baseVal = finalValue;
                    }
                }
                return this;
            };
            /*\
                 * Element.hasClass
                 [ method ]
                 **
                 * Checks if the element has a given class name in the list of class names applied to it.
                 - value (string) class name
                 **
                 = (boolean) `true` if the element has given class
                \*/
            elproto.hasClass = function (value) {
                var elem = this.node,
                    className = elem.className.baseVal,
                    curClasses = className.match(rgNotSpace) || [];
                return !!~curClasses.indexOf(value);
            };
            /*\
                 * Element.toggleClass
                 [ method ]
                 **
                 * Add or remove one or more classes from the element, depending on either
                 * the class’s presence or the value of the `flag` argument.
                 - value (string) class name or space separated list of class names
                 - flag (boolean) value to determine whether the class should be added or removed
                 **
                 = (Element) original element.
                \*/
            elproto.toggleClass = function (value, flag) {
                if (flag != null) {
                    if (flag) {
                        return this.addClass(value);
                    } else {
                        return this.removeClass(value);
                    }
                }
                var classes = (value || "").match(rgNotSpace) || [],
                    elem = this.node,
                    className = elem.className.baseVal,
                    curClasses = className.match(rgNotSpace) || [],
                    j,
                    pos,
                    clazz,
                    finalValue;
                j = 0;
                while (clazz = classes[j++]) {
                    pos = curClasses.indexOf(clazz);
                    if (~pos) {
                        curClasses.splice(pos, 1);
                    } else {
                        curClasses.push(clazz);
                    }
                }

                finalValue = curClasses.join(" ");
                if (className != finalValue) {
                    elem.className.baseVal = finalValue;
                }
                return this;
            };
        });

        // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
            var operators = {
                "+": function _(x, y) {
                    return x + y;
                },
                "-": function _(x, y) {
                    return x - y;
                },
                "/": function _(x, y) {
                    return x / y;
                },
                "*": function _(x, y) {
                    return x * y;
                }
            },

                Str = String,
                reUnit = /[a-z]+$/i,
                reAddon = /^\s*([+\-\/*])\s*=\s*([\d.eE+\-]+)\s*([^\d\s]+)?\s*$/;
            function getNumber(val) {
                return val;
            }
            function getUnit(unit) {
                return function (val) {
                    return +val.toFixed(3) + unit;
                };
            }
            eve.on("snap.util.attr", function (val) {
                var plus = Str(val).match(reAddon);
                if (plus) {
                    var evnt = eve.nt(),
                        name = evnt.substring(evnt.lastIndexOf(".") + 1),
                        a = this.attr(name),
                        atr = {};
                    eve.stop();
                    var unit = plus[3] || "",
                        aUnit = a.match(reUnit),
                        op = operators[plus[1]];
                    if (aUnit && aUnit == unit) {
                        val = op(parseFloat(a), +plus[2]);
                    } else {
                        a = this.asPX(name);
                        val = op(this.asPX(name), this.asPX(name, plus[2] + unit));
                    }
                    if (isNaN(a) || isNaN(val)) {
                        return;
                    }
                    atr[name] = val;
                    this.attr(atr);
                }
            })(-10);
            eve.on("snap.util.equal", function (name, b) {
                var A, B, a = Str(this.attr(name) || ""),
                    el = this,
                    bplus = Str(b).match(reAddon);
                if (bplus) {
                    eve.stop();
                    var unit = bplus[3] || "",
                        aUnit = a.match(reUnit),
                        op = operators[bplus[1]];
                    if (aUnit && aUnit == unit) {
                        return {
                            from: parseFloat(a),
                            to: op(parseFloat(a), +bplus[2]),
                            f: getUnit(aUnit)
                        };

                    } else {
                        a = this.asPX(name);
                        return {
                            from: a,
                            to: op(a, this.asPX(name, bplus[2] + unit)),
                            f: getNumber
                        };

                    }
                }
            })(-10);
        });

        // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
            var proto = Paper.prototype,
                is = Snap.is;
            /*\
                 * Paper.rect
                 [ method ]
                 *
                 * Draws a rectangle
                 **
                 - x (number) x coordinate of the top left corner
                 - y (number) y coordinate of the top left corner
                 - width (number) width
                 - height (number) height
                 - rx (number) #optional horizontal radius for rounded corners, default is 0
                 - ry (number) #optional vertical radius for rounded corners, default is rx or 0
                 = (object) the `rect` element
                 **
                 > Usage
                 | // regular rectangle
                 | var c = paper.rect(10, 10, 50, 50);
                 | // rectangle with rounded corners
                 | var c = paper.rect(40, 40, 50, 50, 10);
                \*/
            proto.rect = function (x, y, w, h, rx, ry) {
                var attr;
                if (ry == null) {
                    ry = rx;
                }
                if (is(x, "object") && x == "[object Object]") {
                    attr = x;
                } else if (x != null) {
                    attr = {
                        x: x,
                        y: y,
                        width: w,
                        height: h
                    };

                    if (rx != null) {
                        attr.rx = rx;
                        attr.ry = ry;
                    }
                }
                return this.el("rect", attr);
            };
            /*\
                 * Paper.circle
                 [ method ]
                 **
                 * Draws a circle
                 **
                 - x (number) x coordinate of the centre
                 - y (number) y coordinate of the centre
                 - r (number) radius
                 = (object) the `circle` element
                 **
                 > Usage
                 | var c = paper.circle(50, 50, 40);
                \*/
            proto.circle = function (cx, cy, r) {
                var attr;
                if (is(cx, "object") && cx == "[object Object]") {
                    attr = cx;
                } else if (cx != null) {
                    attr = {
                        cx: cx,
                        cy: cy,
                        r: r
                    };

                }
                return this.el("circle", attr);
            };

            var preload = function () {
                function onerror() {
                    this.parentNode.removeChild(this);
                }
                return function (src, f) {
                    var img = glob.doc.createElement("img"),
                        body = glob.doc.body;
                    img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
                    img.onload = function () {
                        f.call(img);
                        img.onload = img.onerror = null;
                        body.removeChild(img);
                    };
                    img.onerror = onerror;
                    body.appendChild(img);
                    img.src = src;
                };
            }();

            /*\
                 * Paper.image
                 [ method ]
                 **
                 * Places an image on the surface
                 **
                 - src (string) URI of the source image
                 - x (number) x offset position
                 - y (number) y offset position
                 - width (number) width of the image
                 - height (number) height of the image
                 = (object) the `image` element
                 * or
                 = (object) Snap element object with type `image`
                 **
                 > Usage
                 | var c = paper.image("apple.png", 10, 10, 80, 80);
                \*/
            proto.image = function (src, x, y, width, height) {
                var el = this.el("image");
                if (is(src, "object") && "src" in src) {
                    el.attr(src);
                } else if (src != null) {
                    var set = {
                        "xlink:href": src,
                        preserveAspectRatio: "none"
                    };

                    if (x != null && y != null) {
                        set.x = x;
                        set.y = y;
                    }
                    if (width != null && height != null) {
                        set.width = width;
                        set.height = height;
                    } else {
                        preload(src, function () {
                            Snap._.$(el.node, {
                                width: this.offsetWidth,
                                height: this.offsetHeight
                            });

                        });
                    }
                    Snap._.$(el.node, set);
                }
                return el;
            };
            /*\
                 * Paper.ellipse
                 [ method ]
                 **
                 * Draws an ellipse
                 **
                 - x (number) x coordinate of the centre
                 - y (number) y coordinate of the centre
                 - rx (number) horizontal radius
                 - ry (number) vertical radius
                 = (object) the `ellipse` element
                 **
                 > Usage
                 | var c = paper.ellipse(50, 50, 40, 20);
                \*/
            proto.ellipse = function (cx, cy, rx, ry) {
                var attr;
                if (is(cx, "object") && cx == "[object Object]") {
                    attr = cx;
                } else if (cx != null) {
                    attr = {
                        cx: cx,
                        cy: cy,
                        rx: rx,
                        ry: ry
                    };

                }
                return this.el("ellipse", attr);
            };
            // SIERRA Paper.path(): Unclear from the link what a Catmull-Rom curveto is, and why it would make life any easier.
            /*\
                 * Paper.path
                 [ method ]
                 **
                 * Creates a `<path>` element using the given string as the path's definition
                 - pathString (string) #optional path string in SVG format
                 * Path string consists of one-letter commands, followed by comma seprarated arguments in numerical form. Example:
                 | "M10,20L30,40"
                 * This example features two commands: `M`, with arguments `(10, 20)` and `L` with arguments `(30, 40)`. Uppercase letter commands express coordinates in absolute terms, while lowercase commands express them in relative terms from the most recently declared coordinates.
                 *
                 # <p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a> or <a href="https://developer.mozilla.org/en/SVG/Tutorial/Paths">article about path strings at MDN</a>.</p>
                 # <table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody>
                 # <tr><td>M</td><td>moveto</td><td>(x y)+</td></tr>
                 # <tr><td>Z</td><td>closepath</td><td>(none)</td></tr>
                 # <tr><td>L</td><td>lineto</td><td>(x y)+</td></tr>
                 # <tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr>
                 # <tr><td>V</td><td>vertical lineto</td><td>y+</td></tr>
                 # <tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr>
                 # <tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr>
                 # <tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr>
                 # <tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr>
                 # <tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr>
                 # <tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull–Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table>
                 * * _Catmull-Rom curveto_ is a not standard SVG command and added to make life easier.
                 * Note: there is a special case when a path consists of only three commands: `M10,10R…z`. In this case the path connects back to its starting point.
                 > Usage
                 | var c = paper.path("M10 10L90 90");
                 | // draw a diagonal line:
                 | // move to 10,10, line to 90,90
                \*/
            proto.path = function (d) {
                var attr;
                if (is(d, "object") && !is(d, "array")) {
                    attr = d;
                } else if (d) {
                    attr = { d: d };
                }
                return this.el("path", attr);
            };
            /*\
                 * Paper.g
                 [ method ]
                 **
                 * Creates a group element
                 **
                 - varargs (…) #optional elements to nest within the group
                 = (object) the `g` element
                 **
                 > Usage
                 | var c1 = paper.circle(),
                 |     c2 = paper.rect(),
                 |     g = paper.g(c2, c1); // note that the order of elements is different
                 * or
                 | var c1 = paper.circle(),
                 |     c2 = paper.rect(),
                 |     g = paper.g();
                 | g.add(c2, c1);
                \*/
            /*\
                 * Paper.group
                 [ method ]
                 **
                 * See @Paper.g
                \*/
            proto.group = proto.g = function (first) {
                var attr,
                    el = this.el("g");
                if (arguments.length == 1 && first && !first.type) {
                    el.attr(first);
                } else if (arguments.length) {
                    el.add(Array.prototype.slice.call(arguments, 0));
                }
                return el;
            };
            /*\
                 * Paper.svg
                 [ method ]
                 **
                 * Creates a nested SVG element.
                 - x (number) @optional X of the element
                 - y (number) @optional Y of the element
                 - width (number) @optional width of the element
                 - height (number) @optional height of the element
                 - vbx (number) @optional viewbox X
                 - vby (number) @optional viewbox Y
                 - vbw (number) @optional viewbox width
                 - vbh (number) @optional viewbox height
                 **
                 = (object) the `svg` element
                 **
                \*/
            proto.svg = function (x, y, width, height, vbx, vby, vbw, vbh) {
                var attrs = {};
                if (is(x, "object") && y == null) {
                    attrs = x;
                } else {
                    if (x != null) {
                        attrs.x = x;
                    }
                    if (y != null) {
                        attrs.y = y;
                    }
                    if (width != null) {
                        attrs.width = width;
                    }
                    if (height != null) {
                        attrs.height = height;
                    }
                    if (vbx != null && vby != null && vbw != null && vbh != null) {
                        attrs.viewBox = [vbx, vby, vbw, vbh];
                    }
                }
                return this.el("svg", attrs);
            };
            /*\
                 * Paper.mask
                 [ method ]
                 **
                 * Equivalent in behaviour to @Paper.g, except it’s a mask.
                 **
                 = (object) the `mask` element
                 **
                \*/
            proto.mask = function (first) {
                var attr,
                    el = this.el("mask");
                if (arguments.length == 1 && first && !first.type) {
                    el.attr(first);
                } else if (arguments.length) {
                    el.add(Array.prototype.slice.call(arguments, 0));
                }
                return el;
            };
            /*\
                 * Paper.ptrn
                 [ method ]
                 **
                 * Equivalent in behaviour to @Paper.g, except it’s a pattern.
                 - x (number) @optional X of the element
                 - y (number) @optional Y of the element
                 - width (number) @optional width of the element
                 - height (number) @optional height of the element
                 - vbx (number) @optional viewbox X
                 - vby (number) @optional viewbox Y
                 - vbw (number) @optional viewbox width
                 - vbh (number) @optional viewbox height
                 **
                 = (object) the `pattern` element
                 **
                \*/
            proto.ptrn = function (x, y, width, height, vx, vy, vw, vh) {
                if (is(x, "object")) {
                    var attr = x;
                } else {
                    attr = { patternUnits: "userSpaceOnUse" };
                    if (x) {
                        attr.x = x;
                    }
                    if (y) {
                        attr.y = y;
                    }
                    if (width != null) {
                        attr.width = width;
                    }
                    if (height != null) {
                        attr.height = height;
                    }
                    if (vx != null && vy != null && vw != null && vh != null) {
                        attr.viewBox = [vx, vy, vw, vh];
                    } else {
                        attr.viewBox = [x || 0, y || 0, width || 0, height || 0];
                    }
                }
                return this.el("pattern", attr);
            };
            /*\
                 * Paper.use
                 [ method ]
                 **
                 * Creates a <use> element.
                 - id (string) @optional id of element to link
                 * or
                 - id (Element) @optional element to link
                 **
                 = (object) the `use` element
                 **
                \*/
            proto.use = function (id) {
                if (id != null) {
                    if (id instanceof Element) {
                        if (!id.attr("id")) {
                            id.attr({ id: Snap._.id(id) });
                        }
                        id = id.attr("id");
                    }
                    if (String(id).charAt() == "#") {
                        id = id.substring(1);
                    }
                    return this.el("use", { "xlink:href": "#" + id });
                } else {
                    return Element.prototype.use.call(this);
                }
            };
            /*\
                 * Paper.symbol
                 [ method ]
                 **
                 * Creates a <symbol> element.
                 - vbx (number) @optional viewbox X
                 - vby (number) @optional viewbox Y
                 - vbw (number) @optional viewbox width
                 - vbh (number) @optional viewbox height
                 = (object) the `symbol` element
                 **
                \*/
            proto.symbol = function (vx, vy, vw, vh) {
                var attr = {};
                if (vx != null && vy != null && vw != null && vh != null) {
                    attr.viewBox = [vx, vy, vw, vh];
                }

                return this.el("symbol", attr);
            };
            /*\
                 * Paper.text
                 [ method ]
                 **
                 * Draws a text string
                 **
                 - x (number) x coordinate position
                 - y (number) y coordinate position
                 - text (string|array) The text string to draw or array of strings to nest within separate `<tspan>` elements
                 = (object) the `text` element
                 **
                 > Usage
                 | var t1 = paper.text(50, 50, "Snap");
                 | var t2 = paper.text(50, 50, ["S","n","a","p"]);
                 | // Text path usage
                 | t1.attr({textpath: "M10,10L100,100"});
                 | // or
                 | var pth = paper.path("M10,10L100,100");
                 | t1.attr({textpath: pth});
                \*/
            proto.text = function (x, y, text) {
                var attr = {};
                if (is(x, "object")) {
                    attr = x;
                } else if (x != null) {
                    attr = {
                        x: x,
                        y: y,
                        text: text || ""
                    };

                }
                return this.el("text", attr);
            };
            /*\
                 * Paper.line
                 [ method ]
                 **
                 * Draws a line
                 **
                 - x1 (number) x coordinate position of the start
                 - y1 (number) y coordinate position of the start
                 - x2 (number) x coordinate position of the end
                 - y2 (number) y coordinate position of the end
                 = (object) the `line` element
                 **
                 > Usage
                 | var t1 = paper.line(50, 50, 100, 100);
                \*/
            proto.line = function (x1, y1, x2, y2) {
                var attr = {};
                if (is(x1, "object")) {
                    attr = x1;
                } else if (x1 != null) {
                    attr = {
                        x1: x1,
                        x2: x2,
                        y1: y1,
                        y2: y2
                    };

                }
                return this.el("line", attr);
            };
            /*\
                 * Paper.polyline
                 [ method ]
                 **
                 * Draws a polyline
                 **
                 - points (array) array of points
                 * or
                 - varargs (…) points
                 = (object) the `polyline` element
                 **
                 > Usage
                 | var p1 = paper.polyline([10, 10, 100, 100]);
                 | var p2 = paper.polyline(10, 10, 100, 100);
                \*/
            proto.polyline = function (points) {
                if (arguments.length > 1) {
                    points = Array.prototype.slice.call(arguments, 0);
                }
                var attr = {};
                if (is(points, "object") && !is(points, "array")) {
                    attr = points;
                } else if (points != null) {
                    attr = { points: points };
                }
                return this.el("polyline", attr);
            };
            /*\
                 * Paper.polygon
                 [ method ]
                 **
                 * Draws a polygon. See @Paper.polyline
                \*/
            proto.polygon = function (points) {
                if (arguments.length > 1) {
                    points = Array.prototype.slice.call(arguments, 0);
                }
                var attr = {};
                if (is(points, "object") && !is(points, "array")) {
                    attr = points;
                } else if (points != null) {
                    attr = { points: points };
                }
                return this.el("polygon", attr);
            };
            // gradients
            (function () {
                var $ = Snap._.$;
                // gradients' helpers
                /*\
                         * Element.stops
                         [ method ]
                         **
                         * Only for gradients!
                         * Returns array of gradient stops elements.
                         = (array) the stops array.
                        \*/
                function Gstops() {
                    return this.selectAll("stop");
                }
                /*\
                         * Element.addStop
                         [ method ]
                         **
                         * Only for gradients!
                         * Adds another stop to the gradient.
                         - color (string) stops color
                         - offset (number) stops offset 0..100
                         = (object) gradient element
                        \*/
                function GaddStop(color, offset) {
                    var stop = $("stop"),
                        attr = {
                            offset: +offset + "%"
                        };

                    color = Snap.color(color);
                    attr["stop-color"] = color.hex;
                    if (color.opacity < 1) {
                        attr["stop-opacity"] = color.opacity;
                    }
                    $(stop, attr);
                    var stops = this.stops(),
                        inserted;
                    for (var i = 0; i < stops.length; i++) {
                        var stopOffset = parseFloat(stops[i].attr("offset"));
                        if (stopOffset > offset) {
                            this.node.insertBefore(stop, stops[i].node);
                            inserted = true;
                            break;
                        }
                    }
                    if (!inserted) {
                        this.node.appendChild(stop);
                    }
                    return this;
                }
                function GgetBBox() {
                    if (this.type == "linearGradient") {
                        var x1 = $(this.node, "x1") || 0,
                            x2 = $(this.node, "x2") || 1,
                            y1 = $(this.node, "y1") || 0,
                            y2 = $(this.node, "y2") || 0;
                        return Snap._.box(x1, y1, math.abs(x2 - x1), math.abs(y2 - y1));
                    } else {
                        var cx = this.node.cx || .5,
                            cy = this.node.cy || .5,
                            r = this.node.r || 0;
                        return Snap._.box(cx - r, cy - r, r * 2, r * 2);
                    }
                }
                /*\
                         * Element.setStops
                         [ method ]
                         **
                         * Only for gradients!
                         * Updates stops of the gradient based on passed gradient descriptor. See @Ppaer.gradient
                         - str (string) gradient descriptor part after `()`.
                         = (object) gradient element
                         | var g = paper.gradient("l(0, 0, 1, 1)#000-#f00-#fff");
                         | g.setStops("#fff-#000-#f00-#fc0");
                        \*/
                function GsetStops(str) {
                    var grad = str,
                        stops = this.stops();
                    if (typeof str == "string") {
                        grad = eve("snap.util.grad.parse", null, "l(0,0,0,1)" + str).firstDefined().stops;
                    }
                    if (!Snap.is(grad, "array")) {
                        return;
                    }
                    for (var i = 0; i < stops.length; i++) {
                        if (grad[i]) {
                            var color = Snap.color(grad[i].color),
                                attr = { "offset": grad[i].offset + "%" };
                            attr["stop-color"] = color.hex;
                            if (color.opacity < 1) {
                                attr["stop-opacity"] = color.opacity;
                            }
                            stops[i].attr(attr);
                        } else {
                            stops[i].remove();
                        }
                    }
                    for (i = stops.length; i < grad.length; i++) {
                        this.addStop(grad[i].color, grad[i].offset);
                    }
                    return this;
                }
                function gradient(defs, str) {
                    var grad = eve("snap.util.grad.parse", null, str).firstDefined(),
                        el;
                    if (!grad) {
                        return null;
                    }
                    grad.params.unshift(defs);
                    if (grad.type.toLowerCase() == "l") {
                        el = gradientLinear.apply(0, grad.params);
                    } else {
                        el = gradientRadial.apply(0, grad.params);
                    }
                    if (grad.type != grad.type.toLowerCase()) {
                        $(el.node, {
                            gradientUnits: "userSpaceOnUse"
                        });

                    }
                    var stops = grad.stops,
                        len = stops.length;
                    for (var i = 0; i < len; i++) {
                        var stop = stops[i];
                        el.addStop(stop.color, stop.offset);
                    }
                    return el;
                }
                function gradientLinear(defs, x1, y1, x2, y2) {
                    var el = Snap._.make("linearGradient", defs);
                    el.stops = Gstops;
                    el.addStop = GaddStop;
                    el.getBBox = GgetBBox;
                    el.setStops = GsetStops;
                    if (x1 != null) {
                        $(el.node, {
                            x1: x1,
                            y1: y1,
                            x2: x2,
                            y2: y2
                        });

                    }
                    return el;
                }
                function gradientRadial(defs, cx, cy, r, fx, fy) {
                    var el = Snap._.make("radialGradient", defs);
                    el.stops = Gstops;
                    el.addStop = GaddStop;
                    el.getBBox = GgetBBox;
                    if (cx != null) {
                        $(el.node, {
                            cx: cx,
                            cy: cy,
                            r: r
                        });

                    }
                    if (fx != null && fy != null) {
                        $(el.node, {
                            fx: fx,
                            fy: fy
                        });

                    }
                    return el;
                }
                /*\
                         * Paper.gradient
                         [ method ]
                         **
                         * Creates a gradient element
                         **
                         - gradient (string) gradient descriptor
                         > Gradient Descriptor
                         * The gradient descriptor is an expression formatted as
                         * follows: `<type>(<coords>)<colors>`.  The `<type>` can be
                         * either linear or radial.  The uppercase `L` or `R` letters
                         * indicate absolute coordinates offset from the SVG surface.
                         * Lowercase `l` or `r` letters indicate coordinates
                         * calculated relative to the element to which the gradient is
                         * applied.  Coordinates specify a linear gradient vector as
                         * `x1`, `y1`, `x2`, `y2`, or a radial gradient as `cx`, `cy`,
                         * `r` and optional `fx`, `fy` specifying a focal point away
                         * from the center of the circle. Specify `<colors>` as a list
                         * of dash-separated CSS color values.  Each color may be
                         * followed by a custom offset value, separated with a colon
                         * character.
                         > Examples
                         * Linear gradient, relative from top-left corner to bottom-right
                         * corner, from black through red to white:
                         | var g = paper.gradient("l(0, 0, 1, 1)#000-#f00-#fff");
                         * Linear gradient, absolute from (0, 0) to (100, 100), from black
                         * through red at 25% to white:
                         | var g = paper.gradient("L(0, 0, 100, 100)#000-#f00:25-#fff");
                         * Radial gradient, relative from the center of the element with radius
                         * half the width, from black to white:
                         | var g = paper.gradient("r(0.5, 0.5, 0.5)#000-#fff");
                         * To apply the gradient:
                         | paper.circle(50, 50, 40).attr({
                         |     fill: g
                         | });
                         = (object) the `gradient` element
                        \*/
                proto.gradient = function (str) {
                    return gradient(this.defs, str);
                };
                proto.gradientLinear = function (x1, y1, x2, y2) {
                    return gradientLinear(this.defs, x1, y1, x2, y2);
                };
                proto.gradientRadial = function (cx, cy, r, fx, fy) {
                    return gradientRadial(this.defs, cx, cy, r, fx, fy);
                };
                /*\
                         * Paper.toString
                         [ method ]
                         **
                         * Returns SVG code for the @Paper
                         = (string) SVG code for the @Paper
                        \*/
                proto.toString = function () {
                    var doc = this.node.ownerDocument,
                        f = doc.createDocumentFragment(),
                        d = doc.createElement("div"),
                        svg = this.node.cloneNode(true),
                        res;
                    f.appendChild(d);
                    d.appendChild(svg);
                    Snap._.$(svg, { xmlns: "http://www.w3.org/2000/svg" });
                    res = d.innerHTML;
                    f.removeChild(f.firstChild);
                    return res;
                };
                /*\
                         * Paper.toDataURL
                         [ method ]
                         **
                         * Returns SVG code for the @Paper as Data URI string.
                         = (string) Data URI string
                        \*/
                proto.toDataURL = function () {
                    if (window && window.btoa) {
                        return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(this)));
                    }
                };
                /*\
                         * Paper.clear
                         [ method ]
                         **
                         * Removes all child nodes of the paper, except <defs>.
                        \*/
                proto.clear = function () {
                    var node = this.node.firstChild,
                        next;
                    while (node) {
                        next = node.nextSibling;
                        if (node.tagName != "defs") {
                            node.parentNode.removeChild(node);
                        } else {
                            proto.clear.call({ node: node });
                        }
                        node = next;
                    }
                };
            })();
        });

        // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob) {
            var elproto = Element.prototype,
                is = Snap.is,
                clone = Snap._.clone,
                has = "hasOwnProperty",
                p2s = /,?([a-z]),?/gi,
                toFloat = parseFloat,
                math = Math,
                PI = math.PI,
                mmin = math.min,
                mmax = math.max,
                pow = math.pow,
                abs = math.abs;
            function paths(ps) {
                var p = paths.ps = paths.ps || {};
                if (p[ps]) {
                    p[ps].sleep = 100;
                } else {
                    p[ps] = {
                        sleep: 100
                    };

                }
                setTimeout(function () {
                    for (var key in p) {
                        if (p[has](key) && key != ps) {
                            p[key].sleep--;
                            !p[key].sleep && delete p[key];
                        }
                    }
                });
                return p[ps];
            }
            function box(x, y, width, height) {
                if (x == null) {
                    x = y = width = height = 0;
                }
                if (y == null) {
                    y = x.y;
                    width = x.width;
                    height = x.height;
                    x = x.x;
                }
                return {
                    x: x,
                    y: y,
                    width: width,
                    w: width,
                    height: height,
                    h: height,
                    x2: x + width,
                    y2: y + height,
                    cx: x + width / 2,
                    cy: y + height / 2,
                    r1: math.min(width, height) / 2,
                    r2: math.max(width, height) / 2,
                    r0: math.sqrt(width * width + height * height) / 2,
                    path: rectPath(x, y, width, height),
                    vb: [x, y, width, height].join(" ")
                };

            }
            function toString() {
                return this.join(",").replace(p2s, "$1");
            }
            function pathClone(pathArray) {
                var res = clone(pathArray);
                res.toString = toString;
                return res;
            }
            function getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
                if (length == null) {
                    return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
                } else {
                    return findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y,
                        getTotLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
                }
            }
            function getLengthFactory(istotal, subpath) {
                function O(val) {
                    return +(+val).toFixed(3);
                }
                return Snap._.cacher(function (path, length, onlystart) {
                    if (path instanceof Element) {
                        path = path.attr("d");
                    }
                    path = path2curve(path);
                    var x, y, p, l, sp = "", subpaths = {}, point,
                        len = 0;
                    for (var i = 0, ii = path.length; i < ii; i++) {
                        p = path[i];
                        if (p[0] == "M") {
                            x = +p[1];
                            y = +p[2];
                        } else {
                            l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                            if (len + l > length) {
                                if (subpath && !subpaths.start) {
                                    point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                                    sp += [
                                        "C" + O(point.start.x),
                                        O(point.start.y),
                                        O(point.m.x),
                                        O(point.m.y),
                                        O(point.x),
                                        O(point.y)];

                                    if (onlystart) { return sp; }
                                    subpaths.start = sp;
                                    sp = [
                                        "M" + O(point.x),
                                        O(point.y) + "C" + O(point.n.x),
                                        O(point.n.y),
                                        O(point.end.x),
                                        O(point.end.y),
                                        O(p[5]),
                                        O(p[6])].
                                        join();
                                    len += l;
                                    x = +p[5];
                                    y = +p[6];
                                    continue;
                                }
                                if (!istotal && !subpath) {
                                    point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                                    return point;
                                }
                            }
                            len += l;
                            x = +p[5];
                            y = +p[6];
                        }
                        sp += p.shift() + p;
                    }
                    subpaths.end = sp;
                    point = istotal ? len : subpath ? subpaths : findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
                    return point;
                }, null, Snap._.clone);
            }
            var getTotalLength = getLengthFactory(1),
                getPointAtLength = getLengthFactory(),
                getSubpathsAtLength = getLengthFactory(0, 1);
            function findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
                var t1 = 1 - t,
                    t13 = pow(t1, 3),
                    t12 = pow(t1, 2),
                    t2 = t * t,
                    t3 = t2 * t,
                    x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
                    y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
                    mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
                    my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
                    nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
                    ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
                    ax = t1 * p1x + t * c1x,
                    ay = t1 * p1y + t * c1y,
                    cx = t1 * c2x + t * p2x,
                    cy = t1 * c2y + t * p2y,
                    alpha = 90 - math.atan2(mx - nx, my - ny) * 180 / PI;
                // (mx > nx || my < ny) && (alpha += 180);
                return {
                    x: x,
                    y: y,
                    m: { x: mx, y: my },
                    n: { x: nx, y: ny },
                    start: { x: ax, y: ay },
                    end: { x: cx, y: cy },
                    alpha: alpha
                };

            }
            function bezierBBox(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
                if (!Snap.is(p1x, "array")) {
                    p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
                }
                var bbox = curveDim.apply(null, p1x);
                return box(
                    bbox.min.x,
                    bbox.min.y,
                    bbox.max.x - bbox.min.x,
                    bbox.max.y - bbox.min.y);

            }
            function isPointInsideBBox(bbox, x, y) {
                return x >= bbox.x &&
                    x <= bbox.x + bbox.width &&
                    y >= bbox.y &&
                    y <= bbox.y + bbox.height;
            }
            function isBBoxIntersect(bbox1, bbox2) {
                bbox1 = box(bbox1);
                bbox2 = box(bbox2);
                return isPointInsideBBox(bbox2, bbox1.x, bbox1.y) ||
                    isPointInsideBBox(bbox2, bbox1.x2, bbox1.y) ||
                    isPointInsideBBox(bbox2, bbox1.x, bbox1.y2) ||
                    isPointInsideBBox(bbox2, bbox1.x2, bbox1.y2) ||
                    isPointInsideBBox(bbox1, bbox2.x, bbox2.y) ||
                    isPointInsideBBox(bbox1, bbox2.x2, bbox2.y) ||
                    isPointInsideBBox(bbox1, bbox2.x, bbox2.y2) ||
                    isPointInsideBBox(bbox1, bbox2.x2, bbox2.y2) ||
                    (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x ||
                        bbox2.x < bbox1.x2 && bbox2.x > bbox1.x) && (
                        bbox1.y < bbox2.y2 && bbox1.y > bbox2.y ||
                        bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
            }
            function base3(t, p1, p2, p3, p4) {
                var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
                    t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
                return t * t2 - 3 * p1 + 3 * p2;
            }
            function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
                if (z == null) {
                    z = 1;
                }
                z = z > 1 ? 1 : z < 0 ? 0 : z;
                var z2 = z / 2,
                    n = 12,
                    Tvalues = [-.1252, .1252, -.3678, .3678, -.5873, .5873, -.7699, .7699, -.9041, .9041, -.9816, .9816],
                    Cvalues = [0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069, 0.1069, 0.0472, 0.0472],
                    sum = 0;
                for (var i = 0; i < n; i++) {
                    var ct = z2 * Tvalues[i] + z2,
                        xbase = base3(ct, x1, x2, x3, x4),
                        ybase = base3(ct, y1, y2, y3, y4),
                        comb = xbase * xbase + ybase * ybase;
                    sum += Cvalues[i] * math.sqrt(comb);
                }
                return z2 * sum;
            }
            function getTotLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
                if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
                    return;
                }
                var t = 1,
                    step = t / 2,
                    t2 = t - step,
                    l,
                    e = .01;
                l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
                while (abs(l - ll) > e) {
                    step /= 2;
                    t2 += (l < ll ? 1 : -1) * step;
                    l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
                }
                return t2;
            }
            function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
                if (
                    mmax(x1, x2) < mmin(x3, x4) ||
                    mmin(x1, x2) > mmax(x3, x4) ||
                    mmax(y1, y2) < mmin(y3, y4) ||
                    mmin(y1, y2) > mmax(y3, y4)) {
                    return;
                }
                var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
                    ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
                    denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

                if (!denominator) {
                    return;
                }
                var px = nx / denominator,
                    py = ny / denominator,
                    px2 = +px.toFixed(2),
                    py2 = +py.toFixed(2);
                if (
                    px2 < +mmin(x1, x2).toFixed(2) ||
                    px2 > +mmax(x1, x2).toFixed(2) ||
                    px2 < +mmin(x3, x4).toFixed(2) ||
                    px2 > +mmax(x3, x4).toFixed(2) ||
                    py2 < +mmin(y1, y2).toFixed(2) ||
                    py2 > +mmax(y1, y2).toFixed(2) ||
                    py2 < +mmin(y3, y4).toFixed(2) ||
                    py2 > +mmax(y3, y4).toFixed(2)) {
                    return;
                }
                return { x: px, y: py };
            }
            function inter(bez1, bez2) {
                return interHelper(bez1, bez2);
            }
            function interCount(bez1, bez2) {
                return interHelper(bez1, bez2, 1);
            }
            function interHelper(bez1, bez2, justCount) {
                var bbox1 = bezierBBox(bez1),
                    bbox2 = bezierBBox(bez2);
                if (!isBBoxIntersect(bbox1, bbox2)) {
                    return justCount ? 0 : [];
                }
                var l1 = bezlen.apply(0, bez1),
                    l2 = bezlen.apply(0, bez2),
                    n1 = ~~(l1 / 8),
                    n2 = ~~(l2 / 8),
                    dots1 = [],
                    dots2 = [],
                    xy = {},
                    res = justCount ? 0 : [];
                for (var i = 0; i < n1 + 1; i++) {
                    var p = findDotsAtSegment.apply(0, bez1.concat(i / n1));
                    dots1.push({ x: p.x, y: p.y, t: i / n1 });
                }
                for (i = 0; i < n2 + 1; i++) {
                    p = findDotsAtSegment.apply(0, bez2.concat(i / n2));
                    dots2.push({ x: p.x, y: p.y, t: i / n2 });
                }
                for (i = 0; i < n1; i++) {
                    for (var j = 0; j < n2; j++) {
                        var di = dots1[i],
                            di1 = dots1[i + 1],
                            dj = dots2[j],
                            dj1 = dots2[j + 1],
                            ci = abs(di1.x - di.x) < .001 ? "y" : "x",
                            cj = abs(dj1.x - dj.x) < .001 ? "y" : "x",
                            is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
                        if (is) {
                            if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                                continue;
                            }
                            xy[is.x.toFixed(4)] = is.y.toFixed(4);
                            var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                                t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                            if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                                if (justCount) {
                                    res++;
                                } else {
                                    res.push({
                                        x: is.x,
                                        y: is.y,
                                        t1: t1,
                                        t2: t2
                                    });

                                }
                            }
                        }
                    }
                }
                return res;
            }
            function pathIntersection(path1, path2) {
                return interPathHelper(path1, path2);
            }
            function pathIntersectionNumber(path1, path2) {
                return interPathHelper(path1, path2, 1);
            }
            function interPathHelper(path1, path2, justCount) {
                path1 = path2curve(path1);
                path2 = path2curve(path2);
                var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2,
                    res = justCount ? 0 : [];
                for (var i = 0, ii = path1.length; i < ii; i++) {
                    var pi = path1[i];
                    if (pi[0] == "M") {
                        x1 = x1m = pi[1];
                        y1 = y1m = pi[2];
                    } else {
                        if (pi[0] == "C") {
                            bez1 = [x1, y1].concat(pi.slice(1));
                            x1 = bez1[6];
                            y1 = bez1[7];
                        } else {
                            bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
                            x1 = x1m;
                            y1 = y1m;
                        }
                        for (var j = 0, jj = path2.length; j < jj; j++) {
                            var pj = path2[j];
                            if (pj[0] == "M") {
                                x2 = x2m = pj[1];
                                y2 = y2m = pj[2];
                            } else {
                                if (pj[0] == "C") {
                                    bez2 = [x2, y2].concat(pj.slice(1));
                                    x2 = bez2[6];
                                    y2 = bez2[7];
                                } else {
                                    bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                                    x2 = x2m;
                                    y2 = y2m;
                                }
                                var intr = interHelper(bez1, bez2, justCount);
                                if (justCount) {
                                    res += intr;
                                } else {
                                    for (var k = 0, kk = intr.length; k < kk; k++) {
                                        intr[k].segment1 = i;
                                        intr[k].segment2 = j;
                                        intr[k].bez1 = bez1;
                                        intr[k].bez2 = bez2;
                                    }
                                    res = res.concat(intr);
                                }
                            }
                        }
                    }
                }
                return res;
            }
            function isPointInsidePath(path, x, y) {
                var bbox = pathBBox(path);
                return isPointInsideBBox(bbox, x, y) &&
                    interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
            }
            function pathBBox(path) {
                var pth = paths(path);
                if (pth.bbox) {
                    return clone(pth.bbox);
                }
                if (!path) {
                    return box();
                }
                path = path2curve(path);
                var x = 0,
                    y = 0,
                    X = [],
                    Y = [],
                    p;
                for (var i = 0, ii = path.length; i < ii; i++) {
                    p = path[i];
                    if (p[0] == "M") {
                        x = p[1];
                        y = p[2];
                        X.push(x);
                        Y.push(y);
                    } else {
                        var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                        X = X.concat(dim.min.x, dim.max.x);
                        Y = Y.concat(dim.min.y, dim.max.y);
                        x = p[5];
                        y = p[6];
                    }
                }
                var xmin = mmin.apply(0, X),
                    ymin = mmin.apply(0, Y),
                    xmax = mmax.apply(0, X),
                    ymax = mmax.apply(0, Y),
                    bb = box(xmin, ymin, xmax - xmin, ymax - ymin);
                pth.bbox = clone(bb);
                return bb;
            }
            function rectPath(x, y, w, h, r) {
                if (r) {
                    return [
                        ["M", +x + +r, y],
                        ["l", w - r * 2, 0],
                        ["a", r, r, 0, 0, 1, r, r],
                        ["l", 0, h - r * 2],
                        ["a", r, r, 0, 0, 1, -r, r],
                        ["l", r * 2 - w, 0],
                        ["a", r, r, 0, 0, 1, -r, -r],
                        ["l", 0, r * 2 - h],
                        ["a", r, r, 0, 0, 1, r, -r],
                        ["z"]];

                }
                var res = [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
                res.toString = toString;
                return res;
            }
            function ellipsePath(x, y, rx, ry, a) {
                if (a == null && ry == null) {
                    ry = rx;
                }
                x = +x;
                y = +y;
                rx = +rx;
                ry = +ry;
                if (a != null) {
                    var rad = Math.PI / 180,
                        x1 = x + rx * Math.cos(-ry * rad),
                        x2 = x + rx * Math.cos(-a * rad),
                        y1 = y + rx * Math.sin(-ry * rad),
                        y2 = y + rx * Math.sin(-a * rad),
                        res = [["M", x1, y1], ["A", rx, rx, 0, +(a - ry > 180), 0, x2, y2]];
                } else {
                    res = [
                        ["M", x, y],
                        ["m", 0, -ry],
                        ["a", rx, ry, 0, 1, 1, 0, 2 * ry],
                        ["a", rx, ry, 0, 1, 1, 0, -2 * ry],
                        ["z"]];

                }
                res.toString = toString;
                return res;
            }
            var unit2px = Snap._unit2px,
                getPath = {
                    path: function path(el) {
                        return el.attr("path");
                    },
                    circle: function circle(el) {
                        var attr = unit2px(el);
                        return ellipsePath(attr.cx, attr.cy, attr.r);
                    },
                    ellipse: function ellipse(el) {
                        var attr = unit2px(el);
                        return ellipsePath(attr.cx || 0, attr.cy || 0, attr.rx, attr.ry);
                    },
                    rect: function rect(el) {
                        var attr = unit2px(el);
                        return rectPath(attr.x || 0, attr.y || 0, attr.width, attr.height, attr.rx, attr.ry);
                    },
                    image: function image(el) {
                        var attr = unit2px(el);
                        return rectPath(attr.x || 0, attr.y || 0, attr.width, attr.height);
                    },
                    line: function line(el) {
                        return "M" + [el.attr("x1") || 0, el.attr("y1") || 0, el.attr("x2"), el.attr("y2")];
                    },
                    polyline: function polyline(el) {
                        return "M" + el.attr("points");
                    },
                    polygon: function polygon(el) {
                        return "M" + el.attr("points") + "z";
                    },
                    deflt: function deflt(el) {
                        var bbox = el.node.getBBox();
                        return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
                    }
                };

            function pathToRelative(pathArray) {
                var pth = paths(pathArray),
                    lowerCase = String.prototype.toLowerCase;
                if (pth.rel) {
                    return pathClone(pth.rel);
                }
                if (!Snap.is(pathArray, "array") || !Snap.is(pathArray && pathArray[0], "array")) {
                    pathArray = Snap.parsePathString(pathArray);
                }
                var res = [],
                    x = 0,
                    y = 0,
                    mx = 0,
                    my = 0,
                    start = 0;
                if (pathArray[0][0] == "M") {
                    x = pathArray[0][1];
                    y = pathArray[0][2];
                    mx = x;
                    my = y;
                    start++;
                    res.push(["M", x, y]);
                }
                for (var i = start, ii = pathArray.length; i < ii; i++) {
                    var r = res[i] = [],
                        pa = pathArray[i];
                    if (pa[0] != lowerCase.call(pa[0])) {
                        r[0] = lowerCase.call(pa[0]);
                        switch (r[0]) {
                            case "a":
                                r[1] = pa[1];
                                r[2] = pa[2];
                                r[3] = pa[3];
                                r[4] = pa[4];
                                r[5] = pa[5];
                                r[6] = +(pa[6] - x).toFixed(3);
                                r[7] = +(pa[7] - y).toFixed(3);
                                break;
                            case "v":
                                r[1] = +(pa[1] - y).toFixed(3);
                                break;
                            case "m":
                                mx = pa[1];
                                my = pa[2];
                            default:
                                for (var j = 1, jj = pa.length; j < jj; j++) {
                                    r[j] = +(pa[j] - (j % 2 ? x : y)).toFixed(3);
                                }
                        }

                    } else {
                        r = res[i] = [];
                        if (pa[0] == "m") {
                            mx = pa[1] + x;
                            my = pa[2] + y;
                        }
                        for (var k = 0, kk = pa.length; k < kk; k++) {
                            res[i][k] = pa[k];
                        }
                    }
                    var len = res[i].length;
                    switch (res[i][0]) {
                        case "z":
                            x = mx;
                            y = my;
                            break;
                        case "h":
                            x += +res[i][len - 1];
                            break;
                        case "v":
                            y += +res[i][len - 1];
                            break;
                        default:
                            x += +res[i][len - 2];
                            y += +res[i][len - 1];
                    }

                }
                res.toString = toString;
                pth.rel = pathClone(res);
                return res;
            }
            function pathToAbsolute(pathArray) {
                var pth = paths(pathArray);
                if (pth.abs) {
                    return pathClone(pth.abs);
                }
                if (!is(pathArray, "array") || !is(pathArray && pathArray[0], "array")) {// rough assumption
                    pathArray = Snap.parsePathString(pathArray);
                }
                if (!pathArray || !pathArray.length) {
                    return [["M", 0, 0]];
                }
                var res = [],
                    x = 0,
                    y = 0,
                    mx = 0,
                    my = 0,
                    start = 0,
                    pa0;
                if (pathArray[0][0] == "M") {
                    x = +pathArray[0][1];
                    y = +pathArray[0][2];
                    mx = x;
                    my = y;
                    start++;
                    res[0] = ["M", x, y];
                }
                var crz = pathArray.length == 3 &&
                    pathArray[0][0] == "M" &&
                    pathArray[1][0].toUpperCase() == "R" &&
                    pathArray[2][0].toUpperCase() == "Z";
                for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
                    res.push(r = []);
                    pa = pathArray[i];
                    pa0 = pa[0];
                    if (pa0 != pa0.toUpperCase()) {
                        r[0] = pa0.toUpperCase();
                        switch (r[0]) {
                            case "A":
                                r[1] = pa[1];
                                r[2] = pa[2];
                                r[3] = pa[3];
                                r[4] = pa[4];
                                r[5] = pa[5];
                                r[6] = +pa[6] + x;
                                r[7] = +pa[7] + y;
                                break;
                            case "V":
                                r[1] = +pa[1] + y;
                                break;
                            case "H":
                                r[1] = +pa[1] + x;
                                break;
                            case "R":
                                var dots = [x, y].concat(pa.slice(1));
                                for (var j = 2, jj = dots.length; j < jj; j++) {
                                    dots[j] = +dots[j] + x;
                                    dots[++j] = +dots[j] + y;
                                }
                                res.pop();
                                res = res.concat(catmullRom2bezier(dots, crz));
                                break;
                            case "O":
                                res.pop();
                                dots = ellipsePath(x, y, pa[1], pa[2]);
                                dots.push(dots[0]);
                                res = res.concat(dots);
                                break;
                            case "U":
                                res.pop();
                                res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
                                r = ["U"].concat(res[res.length - 1].slice(-2));
                                break;
                            case "M":
                                mx = +pa[1] + x;
                                my = +pa[2] + y;
                            default:
                                for (j = 1, jj = pa.length; j < jj; j++) {
                                    r[j] = +pa[j] + (j % 2 ? x : y);
                                }
                        }

                    } else if (pa0 == "R") {
                        dots = [x, y].concat(pa.slice(1));
                        res.pop();
                        res = res.concat(catmullRom2bezier(dots, crz));
                        r = ["R"].concat(pa.slice(-2));
                    } else if (pa0 == "O") {
                        res.pop();
                        dots = ellipsePath(x, y, pa[1], pa[2]);
                        dots.push(dots[0]);
                        res = res.concat(dots);
                    } else if (pa0 == "U") {
                        res.pop();
                        res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
                        r = ["U"].concat(res[res.length - 1].slice(-2));
                    } else {
                        for (var k = 0, kk = pa.length; k < kk; k++) {
                            r[k] = pa[k];
                        }
                    }
                    pa0 = pa0.toUpperCase();
                    if (pa0 != "O") {
                        switch (r[0]) {
                            case "Z":
                                x = +mx;
                                y = +my;
                                break;
                            case "H":
                                x = r[1];
                                break;
                            case "V":
                                y = r[1];
                                break;
                            case "M":
                                mx = r[r.length - 2];
                                my = r[r.length - 1];
                            default:
                                x = r[r.length - 2];
                                y = r[r.length - 1];
                        }

                    }
                }
                res.toString = toString;
                pth.abs = pathClone(res);
                return res;
            }
            function l2c(x1, y1, x2, y2) {
                return [x1, y1, x2, y2, x2, y2];
            }
            function q2c(x1, y1, ax, ay, x2, y2) {
                var _13 = 1 / 3,
                    _23 = 2 / 3;
                return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2];

            }
            function a2c(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
                // for more information of where this math came from visit:
                // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
                var _120 = PI * 120 / 180,
                    rad = PI / 180 * (+angle || 0),
                    res = [],
                    xy,
                    rotate = Snap._.cacher(function (x, y, rad) {
                        var X = x * math.cos(rad) - y * math.sin(rad),
                            Y = x * math.sin(rad) + y * math.cos(rad);
                        return { x: X, y: Y };
                    });
                if (!rx || !ry) {
                    return [x1, y1, x2, y2, x2, y2];
                }
                if (!recursive) {
                    xy = rotate(x1, y1, -rad);
                    x1 = xy.x;
                    y1 = xy.y;
                    xy = rotate(x2, y2, -rad);
                    x2 = xy.x;
                    y2 = xy.y;
                    var cos = math.cos(PI / 180 * angle),
                        sin = math.sin(PI / 180 * angle),
                        x = (x1 - x2) / 2,
                        y = (y1 - y2) / 2;
                    var h = x * x / (rx * rx) + y * y / (ry * ry);
                    if (h > 1) {
                        h = math.sqrt(h);
                        rx = h * rx;
                        ry = h * ry;
                    }
                    var rx2 = rx * rx,
                        ry2 = ry * ry,
                        k = (large_arc_flag == sweep_flag ? -1 : 1) *
                            math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                        cx = k * rx * y / ry + (x1 + x2) / 2,
                        cy = k * -ry * x / rx + (y1 + y2) / 2,
                        f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                        f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                    f1 = x1 < cx ? PI - f1 : f1;
                    f2 = x2 < cx ? PI - f2 : f2;
                    f1 < 0 && (f1 = PI * 2 + f1);
                    f2 < 0 && (f2 = PI * 2 + f2);
                    if (sweep_flag && f1 > f2) {
                        f1 = f1 - PI * 2;
                    }
                    if (!sweep_flag && f2 > f1) {
                        f2 = f2 - PI * 2;
                    }
                } else {
                    f1 = recursive[0];
                    f2 = recursive[1];
                    cx = recursive[2];
                    cy = recursive[3];
                }
                var df = f2 - f1;
                if (abs(df) > _120) {
                    var f2old = f2,
                        x2old = x2,
                        y2old = y2;
                    f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                    x2 = cx + rx * math.cos(f2);
                    y2 = cy + ry * math.sin(f2);
                    res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
                }
                df = f2 - f1;
                var c1 = math.cos(f1),
                    s1 = math.sin(f1),
                    c2 = math.cos(f2),
                    s2 = math.sin(f2),
                    t = math.tan(df / 4),
                    hx = 4 / 3 * rx * t,
                    hy = 4 / 3 * ry * t,
                    m1 = [x1, y1],
                    m2 = [x1 + hx * s1, y1 - hy * c1],
                    m3 = [x2 + hx * s2, y2 - hy * c2],
                    m4 = [x2, y2];
                m2[0] = 2 * m1[0] - m2[0];
                m2[1] = 2 * m1[1] - m2[1];
                if (recursive) {
                    return [m2, m3, m4].concat(res);
                } else {
                    res = [m2, m3, m4].concat(res).join().split(",");
                    var newres = [];
                    for (var i = 0, ii = res.length; i < ii; i++) {
                        newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                    }
                    return newres;
                }
            }
            function findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
                var t1 = 1 - t;
                return {
                    x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                    y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
                };

            }

            // Returns bounding box of cubic bezier curve.
            // Source: http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
            // Original version: NISHIO Hirokazu
            // Modifications: https://github.com/timo22345
            function curveDim(x0, y0, x1, y1, x2, y2, x3, y3) {
                var tvalues = [],
                    bounds = [[], []],
                    a, b, c, t, t1, t2, b2ac, sqrtb2ac;
                for (var i = 0; i < 2; ++i) {
                    if (i == 0) {
                        b = 6 * x0 - 12 * x1 + 6 * x2;
                        a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
                        c = 3 * x1 - 3 * x0;
                    } else {
                        b = 6 * y0 - 12 * y1 + 6 * y2;
                        a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
                        c = 3 * y1 - 3 * y0;
                    }
                    if (abs(a) < 1e-12) {
                        if (abs(b) < 1e-12) {
                            continue;
                        }
                        t = -c / b;
                        if (0 < t && t < 1) {
                            tvalues.push(t);
                        }
                        continue;
                    }
                    b2ac = b * b - 4 * c * a;
                    sqrtb2ac = math.sqrt(b2ac);
                    if (b2ac < 0) {
                        continue;
                    }
                    t1 = (-b + sqrtb2ac) / (2 * a);
                    if (0 < t1 && t1 < 1) {
                        tvalues.push(t1);
                    }
                    t2 = (-b - sqrtb2ac) / (2 * a);
                    if (0 < t2 && t2 < 1) {
                        tvalues.push(t2);
                    }
                }

                var x, y, j = tvalues.length,
                    jlen = j,
                    mt;
                while (j--) {
                    t = tvalues[j];
                    mt = 1 - t;
                    bounds[0][j] = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
                    bounds[1][j] = mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
                }

                bounds[0][jlen] = x0;
                bounds[1][jlen] = y0;
                bounds[0][jlen + 1] = x3;
                bounds[1][jlen + 1] = y3;
                bounds[0].length = bounds[1].length = jlen + 2;


                return {
                    min: { x: mmin.apply(0, bounds[0]), y: mmin.apply(0, bounds[1]) },
                    max: { x: mmax.apply(0, bounds[0]), y: mmax.apply(0, bounds[1]) }
                };

            }

            function path2curve(path, path2) {
                var pth = !path2 && paths(path);
                if (!path2 && pth.curve) {
                    return pathClone(pth.curve);
                }
                var p = pathToAbsolute(path),
                    p2 = path2 && pathToAbsolute(path2),
                    attrs = { x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null },
                    attrs2 = { x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null },
                    processPath = function processPath(path, d, pcom) {
                        var nx, ny;
                        if (!path) {
                            return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                        }
                        !(path[0] in { T: 1, Q: 1 }) && (d.qx = d.qy = null);
                        switch (path[0]) {
                            case "M":
                                d.X = path[1];
                                d.Y = path[2];
                                break;
                            case "A":
                                path = ["C"].concat(a2c.apply(0, [d.x, d.y].concat(path.slice(1))));
                                break;
                            case "S":
                                if (pcom == "C" || pcom == "S") {// In "S" case we have to take into account, if the previous command is C/S.
                                    nx = d.x * 2 - d.bx;// And reflect the previous
                                    ny = d.y * 2 - d.by;// command's control point relative to the current point.
                                } else {// or some else or nothing
                                    nx = d.x;
                                    ny = d.y;
                                }
                                path = ["C", nx, ny].concat(path.slice(1));
                                break;
                            case "T":
                                if (pcom == "Q" || pcom == "T") {// In "T" case we have to take into account, if the previous command is Q/T.
                                    d.qx = d.x * 2 - d.qx;// And make a reflection similar
                                    d.qy = d.y * 2 - d.qy;// to case "S".
                                } else {// or something else or nothing
                                    d.qx = d.x;
                                    d.qy = d.y;
                                }
                                path = ["C"].concat(q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                                break;
                            case "Q":
                                d.qx = path[1];
                                d.qy = path[2];
                                path = ["C"].concat(q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                                break;
                            case "L":
                                path = ["C"].concat(l2c(d.x, d.y, path[1], path[2]));
                                break;
                            case "H":
                                path = ["C"].concat(l2c(d.x, d.y, path[1], d.y));
                                break;
                            case "V":
                                path = ["C"].concat(l2c(d.x, d.y, d.x, path[1]));
                                break;
                            case "Z":
                                path = ["C"].concat(l2c(d.x, d.y, d.X, d.Y));
                                break;
                        }

                        return path;
                    },
                    fixArc = function fixArc(pp, i) {
                        if (pp[i].length > 7) {
                            pp[i].shift();
                            var pi = pp[i];
                            while (pi.length) {
                                pcoms1[i] = "A";// if created multiple C:s, their original seg is saved
                                p2 && (pcoms2[i] = "A");// the same as above
                                pp.splice(i++, 0, ["C"].concat(pi.splice(0, 6)));
                            }
                            pp.splice(i, 1);
                            ii = mmax(p.length, p2 && p2.length || 0);
                        }
                    },
                    fixM = function fixM(path1, path2, a1, a2, i) {
                        if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                            path2.splice(i, 0, ["M", a2.x, a2.y]);
                            a1.bx = 0;
                            a1.by = 0;
                            a1.x = path1[i][1];
                            a1.y = path1[i][2];
                            ii = mmax(p.length, p2 && p2.length || 0);
                        }
                    },
                    pcoms1 = [],// path commands of original path p
                    pcoms2 = [],// path commands of original path p2
                    pfirst = "",// temporary holder for original path command
                    pcom = "";// holder for previous path command of original path
                for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
                    p[i] && (pfirst = p[i][0]);// save current path command

                    if (pfirst != "C")// C is not saved yet, because it may be result of conversion
                    {
                        pcoms1[i] = pfirst;// Save current path command
                        i && (pcom = pcoms1[i - 1]);// Get previous path command pcom
                    }
                    p[i] = processPath(p[i], attrs, pcom);// Previous path command is inputted to processPath

                    if (pcoms1[i] != "A" && pfirst == "C") pcoms1[i] = "C";// A is the only command
                    // which may produce multiple C:s
                    // so we have to make sure that C is also C in original path

                    fixArc(p, i);// fixArc adds also the right amount of A:s to pcoms1

                    if (p2) {// the same procedures is done to p2
                        p2[i] && (pfirst = p2[i][0]);
                        if (pfirst != "C") {
                            pcoms2[i] = pfirst;
                            i && (pcom = pcoms2[i - 1]);
                        }
                        p2[i] = processPath(p2[i], attrs2, pcom);

                        if (pcoms2[i] != "A" && pfirst == "C") {
                            pcoms2[i] = "C";
                        }

                        fixArc(p2, i);
                    }
                    fixM(p, p2, attrs, attrs2, i);
                    fixM(p2, p, attrs2, attrs, i);
                    var seg = p[i],
                        seg2 = p2 && p2[i],
                        seglen = seg.length,
                        seg2len = p2 && seg2.length;
                    attrs.x = seg[seglen - 2];
                    attrs.y = seg[seglen - 1];
                    attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                    attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                    attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                    attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                    attrs2.x = p2 && seg2[seg2len - 2];
                    attrs2.y = p2 && seg2[seg2len - 1];
                }
                if (!p2) {
                    pth.curve = pathClone(p);
                }
                return p2 ? [p, p2] : p;
            }
            function mapPath(path, matrix) {
                if (!matrix) {
                    return path;
                }
                var x, y, i, j, ii, jj, pathi;
                path = path2curve(path);
                for (i = 0, ii = path.length; i < ii; i++) {
                    pathi = path[i];
                    for (j = 1, jj = pathi.length; j < jj; j += 2) {
                        x = matrix.x(pathi[j], pathi[j + 1]);
                        y = matrix.y(pathi[j], pathi[j + 1]);
                        pathi[j] = x;
                        pathi[j + 1] = y;
                    }
                }
                return path;
            }

            // http://schepers.cc/getting-to-the-point
            function catmullRom2bezier(crp, z) {
                var d = [];
                for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
                    var p = [
                        { x: +crp[i - 2], y: +crp[i - 1] },
                        { x: +crp[i], y: +crp[i + 1] },
                        { x: +crp[i + 2], y: +crp[i + 3] },
                        { x: +crp[i + 4], y: +crp[i + 5] }];

                    if (z) {
                        if (!i) {
                            p[0] = { x: +crp[iLen - 2], y: +crp[iLen - 1] };
                        } else if (iLen - 4 == i) {
                            p[3] = { x: +crp[0], y: +crp[1] };
                        } else if (iLen - 2 == i) {
                            p[2] = { x: +crp[0], y: +crp[1] };
                            p[3] = { x: +crp[2], y: +crp[3] };
                        }
                    } else {
                        if (iLen - 4 == i) {
                            p[3] = p[2];
                        } else if (!i) {
                            p[0] = { x: +crp[i], y: +crp[i + 1] };
                        }
                    }
                    d.push(["C",
                        (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                        (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                        (p[1].x + 6 * p[2].x - p[3].x) / 6,
                        (p[1].y + 6 * p[2].y - p[3].y) / 6,
                        p[2].x,
                        p[2].y]);

                }

                return d;
            }

            // export
            Snap.path = paths;

            /*\
                 * Snap.path.getTotalLength
                 [ method ]
                 **
                 * Returns the length of the given path in pixels
                 **
                 - path (string) SVG path string
                 **
                 = (number) length
                \*/
            Snap.path.getTotalLength = getTotalLength;
            /*\
                 * Snap.path.getPointAtLength
                 [ method ]
                 **
                 * Returns the coordinates of the point located at the given length along the given path
                 **
                 - path (string) SVG path string
                 - length (number) length, in pixels, from the start of the path, excluding non-rendering jumps
                 **
                 = (object) representation of the point:
                 o {
                 o     x: (number) x coordinate,
                 o     y: (number) y coordinate,
                 o     alpha: (number) angle of derivative
                 o }
                \*/
            Snap.path.getPointAtLength = getPointAtLength;
            /*\
                 * Snap.path.getSubpath
                 [ method ]
                 **
                 * Returns the subpath of a given path between given start and end lengths
                 **
                 - path (string) SVG path string
                 - from (number) length, in pixels, from the start of the path to the start of the segment
                 - to (number) length, in pixels, from the start of the path to the end of the segment
                 **
                 = (string) path string definition for the segment
                \*/
            Snap.path.getSubpath = function (path, from, to) {
                if (this.getTotalLength(path) - to < 1e-6) {
                    return getSubpathsAtLength(path, from).end;
                }
                var a = getSubpathsAtLength(path, to, 1);
                return from ? getSubpathsAtLength(a, from).end : a;
            };
            /*\
                 * Element.getTotalLength
                 [ method ]
                 **
                 * Returns the length of the path in pixels (only works for `path` elements)
                 = (number) length
                \*/
            elproto.getTotalLength = function () {
                if (this.node.getTotalLength) {
                    return this.node.getTotalLength();
                }
            };
            // SIERRA Element.getPointAtLength()/Element.getTotalLength(): If a <path> is broken into different segments, is the jump distance to the new coordinates set by the _M_ or _m_ commands calculated as part of the path's total length?
            /*\
                 * Element.getPointAtLength
                 [ method ]
                 **
                 * Returns coordinates of the point located at the given length on the given path (only works for `path` elements)
                 **
                 - length (number) length, in pixels, from the start of the path, excluding non-rendering jumps
                 **
                 = (object) representation of the point:
                 o {
                 o     x: (number) x coordinate,
                 o     y: (number) y coordinate,
                 o     alpha: (number) angle of derivative
                 o }
                \*/
            elproto.getPointAtLength = function (length) {
                return getPointAtLength(this.attr("d"), length);
            };
            // SIERRA Element.getSubpath(): Similar to the problem for Element.getPointAtLength(). Unclear how this would work for a segmented path. Overall, the concept of _subpath_ and what I'm calling a _segment_ (series of non-_M_ or _Z_ commands) is unclear.
            /*\
                 * Element.getSubpath
                 [ method ]
                 **
                 * Returns subpath of a given element from given start and end lengths (only works for `path` elements)
                 **
                 - from (number) length, in pixels, from the start of the path to the start of the segment
                 - to (number) length, in pixels, from the start of the path to the end of the segment
                 **
                 = (string) path string definition for the segment
                \*/
            elproto.getSubpath = function (from, to) {
                return Snap.path.getSubpath(this.attr("d"), from, to);
            };
            Snap._.box = box;
            /*\
                 * Snap.path.findDotsAtSegment
                 [ method ]
                 **
                 * Utility method
                 **
                 * Finds dot coordinates on the given cubic beziér curve at the given t
                 - p1x (number) x of the first point of the curve
                 - p1y (number) y of the first point of the curve
                 - c1x (number) x of the first anchor of the curve
                 - c1y (number) y of the first anchor of the curve
                 - c2x (number) x of the second anchor of the curve
                 - c2y (number) y of the second anchor of the curve
                 - p2x (number) x of the second point of the curve
                 - p2y (number) y of the second point of the curve
                 - t (number) position on the curve (0..1)
                 = (object) point information in format:
                 o {
                 o     x: (number) x coordinate of the point,
                 o     y: (number) y coordinate of the point,
                 o     m: {
                 o         x: (number) x coordinate of the left anchor,
                 o         y: (number) y coordinate of the left anchor
                 o     },
                 o     n: {
                 o         x: (number) x coordinate of the right anchor,
                 o         y: (number) y coordinate of the right anchor
                 o     },
                 o     start: {
                 o         x: (number) x coordinate of the start of the curve,
                 o         y: (number) y coordinate of the start of the curve
                 o     },
                 o     end: {
                 o         x: (number) x coordinate of the end of the curve,
                 o         y: (number) y coordinate of the end of the curve
                 o     },
                 o     alpha: (number) angle of the curve derivative at the point
                 o }
                \*/
            Snap.path.findDotsAtSegment = findDotsAtSegment;
            /*\
                 * Snap.path.bezierBBox
                 [ method ]
                 **
                 * Utility method
                 **
                 * Returns the bounding box of a given cubic beziér curve
                 - p1x (number) x of the first point of the curve
                 - p1y (number) y of the first point of the curve
                 - c1x (number) x of the first anchor of the curve
                 - c1y (number) y of the first anchor of the curve
                 - c2x (number) x of the second anchor of the curve
                 - c2y (number) y of the second anchor of the curve
                 - p2x (number) x of the second point of the curve
                 - p2y (number) y of the second point of the curve
                 * or
                 - bez (array) array of six points for beziér curve
                 = (object) bounding box
                 o {
                 o     x: (number) x coordinate of the left top point of the box,
                 o     y: (number) y coordinate of the left top point of the box,
                 o     x2: (number) x coordinate of the right bottom point of the box,
                 o     y2: (number) y coordinate of the right bottom point of the box,
                 o     width: (number) width of the box,
                 o     height: (number) height of the box
                 o }
                \*/
            Snap.path.bezierBBox = bezierBBox;
            /*\
                 * Snap.path.isPointInsideBBox
                 [ method ]
                 **
                 * Utility method
                 **
                 * Returns `true` if given point is inside bounding box
                 - bbox (string) bounding box
                 - x (string) x coordinate of the point
                 - y (string) y coordinate of the point
                 = (boolean) `true` if point is inside
                \*/
            Snap.path.isPointInsideBBox = isPointInsideBBox;
            Snap.closest = function (x, y, X, Y) {
                var r = 100,
                    b = box(x - r / 2, y - r / 2, r, r),
                    inside = [],
                    getter = X[0].hasOwnProperty("x") ? function (i) {
                        return {
                            x: X[i].x,
                            y: X[i].y
                        };

                    } : function (i) {
                        return {
                            x: X[i],
                            y: Y[i]
                        };

                    },
                    found = 0;
                while (r <= 1e6 && !found) {
                    for (var i = 0, ii = X.length; i < ii; i++) {
                        var xy = getter(i);
                        if (isPointInsideBBox(b, xy.x, xy.y)) {
                            found++;
                            inside.push(xy);
                            break;
                        }
                    }
                    if (!found) {
                        r *= 2;
                        b = box(x - r / 2, y - r / 2, r, r);
                    }
                }
                if (r == 1e6) {
                    return;
                }
                var len = Infinity,
                    res;
                for (i = 0, ii = inside.length; i < ii; i++) {
                    var l = Snap.len(x, y, inside[i].x, inside[i].y);
                    if (len > l) {
                        len = l;
                        inside[i].len = l;
                        res = inside[i];
                    }
                }
                return res;
            };
            /*\
                 * Snap.path.isBBoxIntersect
                 [ method ]
                 **
                 * Utility method
                 **
                 * Returns `true` if two bounding boxes intersect
                 - bbox1 (string) first bounding box
                 - bbox2 (string) second bounding box
                 = (boolean) `true` if bounding boxes intersect
                \*/
            Snap.path.isBBoxIntersect = isBBoxIntersect;
            /*\
                 * Snap.path.intersection
                 [ method ]
                 **
                 * Utility method
                 **
                 * Finds intersections of two paths
                 - path1 (string) path string
                 - path2 (string) path string
                 = (array) dots of intersection
                 o [
                 o     {
                 o         x: (number) x coordinate of the point,
                 o         y: (number) y coordinate of the point,
                 o         t1: (number) t value for segment of path1,
                 o         t2: (number) t value for segment of path2,
                 o         segment1: (number) order number for segment of path1,
                 o         segment2: (number) order number for segment of path2,
                 o         bez1: (array) eight coordinates representing beziér curve for the segment of path1,
                 o         bez2: (array) eight coordinates representing beziér curve for the segment of path2
                 o     }
                 o ]
                \*/
            Snap.path.intersection = pathIntersection;
            Snap.path.intersectionNumber = pathIntersectionNumber;
            /*\
                 * Snap.path.isPointInside
                 [ method ]
                 **
                 * Utility method
                 **
                 * Returns `true` if given point is inside a given closed path.
                 *
                 * Note: fill mode doesn’t affect the result of this method.
                 - path (string) path string
                 - x (number) x of the point
                 - y (number) y of the point
                 = (boolean) `true` if point is inside the path
                \*/
            Snap.path.isPointInside = isPointInsidePath;
            /*\
                 * Snap.path.getBBox
                 [ method ]
                 **
                 * Utility method
                 **
                 * Returns the bounding box of a given path
                 - path (string) path string
                 = (object) bounding box
                 o {
                 o     x: (number) x coordinate of the left top point of the box,
                 o     y: (number) y coordinate of the left top point of the box,
                 o     x2: (number) x coordinate of the right bottom point of the box,
                 o     y2: (number) y coordinate of the right bottom point of the box,
                 o     width: (number) width of the box,
                 o     height: (number) height of the box
                 o }
                \*/
            Snap.path.getBBox = pathBBox;
            Snap.path.get = getPath;
            /*\
                 * Snap.path.toRelative
                 [ method ]
                 **
                 * Utility method
                 **
                 * Converts path coordinates into relative values
                 - path (string) path string
                 = (array) path string
                \*/
            Snap.path.toRelative = pathToRelative;
            /*\
                 * Snap.path.toAbsolute
                 [ method ]
                 **
                 * Utility method
                 **
                 * Converts path coordinates into absolute values
                 - path (string) path string
                 = (array) path string
                \*/
            Snap.path.toAbsolute = pathToAbsolute;
            /*\
                 * Snap.path.toCubic
                 [ method ]
                 **
                 * Utility method
                 **
                 * Converts path to a new path where all segments are cubic beziér curves
                 - pathString (string|array) path string or array of segments
                 = (array) array of segments
                \*/
            Snap.path.toCubic = path2curve;
            /*\
                 * Snap.path.map
                 [ method ]
                 **
                 * Transform the path string with the given matrix
                 - path (string) path string
                 - matrix (object) see @Matrix
                 = (string) transformed path string
                \*/
            Snap.path.map = mapPath;
            Snap.path.toString = toString;
            Snap.path.clone = pathClone;
        });

        // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob) {
            var mmax = Math.max,
                mmin = Math.min;

            // Set
            var Set = function Set(items) {
                this.items = [];
                this.bindings = {};
                this.length = 0;
                this.type = "set";
                if (items) {
                    for (var i = 0, ii = items.length; i < ii; i++) {
                        if (items[i]) {
                            this[this.items.length] = this.items[this.items.length] = items[i];
                            this.length++;
                        }
                    }
                }
            },
                setproto = Set.prototype;
            /*\
                 * Set.push
                 [ method ]
                 **
                 * Adds each argument to the current set
                 = (object) original element
                \*/
            setproto.push = function () {
                var item,
                    len;
                for (var i = 0, ii = arguments.length; i < ii; i++) {
                    item = arguments[i];
                    if (item) {
                        len = this.items.length;
                        this[len] = this.items[len] = item;
                        this.length++;
                    }
                }
                return this;
            };
            /*\
                 * Set.pop
                 [ method ]
                 **
                 * Removes last element and returns it
                 = (object) element
                \*/
            setproto.pop = function () {
                this.length && delete this[this.length--];
                return this.items.pop();
            };
            /*\
                 * Set.forEach
                 [ method ]
                 **
                 * Executes given function for each element in the set
                 *
                 * If the function returns `false`, the loop stops running.
                 **
                 - callback (function) function to run
                 - thisArg (object) context object for the callback
                 = (object) Set object
                \*/
            setproto.forEach = function (callback, thisArg) {
                for (var i = 0, ii = this.items.length; i < ii; i++) {
                    if (callback.call(thisArg, this.items[i], i) === false) {
                        return this;
                    }
                }
                return this;
            };
            /*\
                 * Set.animate
                 [ method ]
                 **
                 * Animates each element in set in sync.
                 *
                 **
                 - attrs (object) key-value pairs of destination attributes
                 - duration (number) duration of the animation in milliseconds
                 - easing (function) #optional easing function from @mina or custom
                 - callback (function) #optional callback function that executes when the animation ends
                 * or
                 - animation (array) array of animation parameter for each element in set in format `[attrs, duration, easing, callback]`
                 > Usage
                 | // animate all elements in set to radius 10
                 | set.animate({r: 10}, 500, mina.easein);
                 | // or
                 | // animate first element to radius 10, but second to radius 20 and in different time
                 | set.animate([{r: 10}, 500, mina.easein], [{r: 20}, 1500, mina.easein]);
                 = (Element) the current element
                \*/
            setproto.animate = function (attrs, ms, easing, callback) {
                if (typeof easing == "function" && !easing.length) {
                    callback = easing;
                    easing = mina.linear;
                }
                if (attrs instanceof Snap._.Animation) {
                    callback = attrs.callback;
                    easing = attrs.easing;
                    ms = easing.dur;
                    attrs = attrs.attr;
                }
                var args = arguments;
                if (Snap.is(attrs, "array") && Snap.is(args[args.length - 1], "array")) {
                    var each = true;
                }
                var begin,
                    handler = function handler() {
                        if (begin) {
                            this.b = begin;
                        } else {
                            begin = this.b;
                        }
                    },
                    cb = 0,
                    set = this,
                    callbacker = callback && function () {
                        if (++cb == set.length) {
                            callback.call(this);
                        }
                    };
                return this.forEach(function (el, i) {
                    eve.once("snap.animcreated." + el.id, handler);
                    if (each) {
                        args[i] && el.animate.apply(el, args[i]);
                    } else {
                        el.animate(attrs, ms, easing, callbacker);
                    }
                });
            };
            /*\
                 * Set.remove
                 [ method ]
                 **
                 * Removes all children of the set.
                 *
                 = (object) Set object
                \*/
            setproto.remove = function () {
                while (this.length) {
                    this.pop().remove();
                }
                return this;
            };
            /*\
                 * Set.bind
                 [ method ]
                 **
                 * Specifies how to handle a specific attribute when applied
                 * to a set.
                 *
                 **
                 - attr (string) attribute name
                 - callback (function) function to run
                 * or
                 - attr (string) attribute name
                 - element (Element) specific element in the set to apply the attribute to
                 * or
                 - attr (string) attribute name
                 - element (Element) specific element in the set to apply the attribute to
                 - eattr (string) attribute on the element to bind the attribute to
                 = (object) Set object
                \*/
            setproto.bind = function (attr, a, b) {
                var data = {};
                if (typeof a == "function") {
                    this.bindings[attr] = a;
                } else {
                    var aname = b || attr;
                    this.bindings[attr] = function (v) {
                        data[aname] = v;
                        a.attr(data);
                    };
                }
                return this;
            };
            /*\
                 * Set.attr
                 [ method ]
                 **
                 * Equivalent of @Element.attr.
                 = (object) Set object
                \*/
            setproto.attr = function (value) {
                var unbound = {};
                for (var k in value) {
                    if (this.bindings[k]) {
                        this.bindings[k](value[k]);
                    } else {
                        unbound[k] = value[k];
                    }
                }
                for (var i = 0, ii = this.items.length; i < ii; i++) {
                    this.items[i].attr(unbound);
                }
                return this;
            };
            /*\
                 * Set.clear
                 [ method ]
                 **
                 * Removes all elements from the set
                \*/
            setproto.clear = function () {
                while (this.length) {
                    this.pop();
                }
            };
            /*\
                 * Set.splice
                 [ method ]
                 **
                 * Removes range of elements from the set
                 **
                 - index (number) position of the deletion
                 - count (number) number of element to remove
                 - insertion… (object) #optional elements to insert
                 = (object) set elements that were deleted
                \*/
            setproto.splice = function (index, count, insertion) {
                index = index < 0 ? mmax(this.length + index, 0) : index;
                count = mmax(0, mmin(this.length - index, count));
                var tail = [],
                    todel = [],
                    args = [],
                    i;
                for (i = 2; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                for (i = 0; i < count; i++) {
                    todel.push(this[index + i]);
                }
                for (; i < this.length - index; i++) {
                    tail.push(this[index + i]);
                }
                var arglen = args.length;
                for (i = 0; i < arglen + tail.length; i++) {
                    this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
                }
                i = this.items.length = this.length -= count - arglen;
                while (this[i]) {
                    delete this[i++];
                }
                return new Set(todel);
            };
            /*\
                 * Set.exclude
                 [ method ]
                 **
                 * Removes given element from the set
                 **
                 - element (object) element to remove
                 = (boolean) `true` if object was found and removed from the set
                \*/
            setproto.exclude = function (el) {
                for (var i = 0, ii = this.length; i < ii; i++) {
                    if (this[i] == el) {
                        this.splice(i, 1);
                        return true;
                    }
                }
                return false;
            };
            /*\
                 * Set.insertAfter
                 [ method ]
                 **
                 * Inserts set elements after given element.
                 **
                 - element (object) set will be inserted after this element
                 = (object) Set object
                \*/
            setproto.insertAfter = function (el) {
                var i = this.items.length;
                while (i--) {
                    this.items[i].insertAfter(el);
                }
                return this;
            };
            /*\
                 * Set.getBBox
                 [ method ]
                 **
                 * Union of all bboxes of the set. See @Element.getBBox.
                 = (object) bounding box descriptor. See @Element.getBBox.
                \*/
            setproto.getBBox = function () {
                var x = [],
                    y = [],
                    x2 = [],
                    y2 = [];
                for (var i = this.items.length; i--;) {
                    if (!this.items[i].removed) {
                        var box = this.items[i].getBBox();
                        x.push(box.x);
                        y.push(box.y);
                        x2.push(box.x + box.width);
                        y2.push(box.y + box.height);
                    }
                }
                x = mmin.apply(0, x);
                y = mmin.apply(0, y);
                x2 = mmax.apply(0, x2);
                y2 = mmax.apply(0, y2);
                return {
                    x: x,
                    y: y,
                    x2: x2,
                    y2: y2,
                    width: x2 - x,
                    height: y2 - y,
                    cx: x + (x2 - x) / 2,
                    cy: y + (y2 - y) / 2
                };

            };
            /*\
                 * Set.insertAfter
                 [ method ]
                 **
                 * Creates a clone of the set.
                 **
                 = (object) New Set object
                \*/
            setproto.clone = function (s) {
                s = new Set();
                for (var i = 0, ii = this.items.length; i < ii; i++) {
                    s.push(this.items[i].clone());
                }
                return s;
            };
            setproto.toString = function () {
                return "Snap\u2018s set";
            };
            setproto.type = "set";
            // export
            /*\
                 * Snap.Set
                 [ property ]
                 **
                 * Set constructor.
                \*/
            Snap.Set = Set;
            /*\
                 * Snap.set
                 [ method ]
                 **
                 * Creates a set and fills it with list of arguments.
                 **
                 = (object) New Set object
                 | var r = paper.rect(0, 0, 10, 10),
                 |     s1 = Snap.set(), // empty set
                 |     s2 = Snap.set(r, paper.circle(100, 100, 20)); // prefilled set
                \*/
            Snap.set = function () {
                var set = new Set();
                if (arguments.length) {
                    set.push.apply(set, Array.prototype.slice.call(arguments, 0));
                }
                return set;
            };
        });

        // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob) {
            var names = {},
                reUnit = /[%a-z]+$/i,
                Str = String;
            names.stroke = names.fill = "colour";
            function getEmpty(item) {
                var l = item[0];
                switch (l.toLowerCase()) {
                    case "t": return [l, 0, 0];
                    case "m": return [l, 1, 0, 0, 1, 0, 0];
                    case "r": if (item.length == 4) {
                        return [l, 0, item[2], item[3]];
                    } else {
                        return [l, 0];
                    }
                    case "s": if (item.length == 5) {
                        return [l, 1, 1, item[3], item[4]];
                    } else if (item.length == 3) {
                        return [l, 1, 1];
                    } else {
                        return [l, 1];
                    }
                }

            }
            function equaliseTransform(t1, t2, getBBox) {
                t1 = t1 || new Snap.Matrix();
                t2 = t2 || new Snap.Matrix();
                t1 = Snap.parseTransformString(t1.toTransformString()) || [];
                t2 = Snap.parseTransformString(t2.toTransformString()) || [];
                var maxlength = Math.max(t1.length, t2.length),
                    from = [],
                    to = [],
                    i = 0, j, jj,
                    tt1, tt2;
                for (; i < maxlength; i++) {
                    tt1 = t1[i] || getEmpty(t2[i]);
                    tt2 = t2[i] || getEmpty(tt1);
                    if (tt1[0] != tt2[0] ||
                        tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3]) ||
                        tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4])) {
                        t1 = Snap._.transform2matrix(t1, getBBox());
                        t2 = Snap._.transform2matrix(t2, getBBox());
                        from = [["m", t1.a, t1.b, t1.c, t1.d, t1.e, t1.f]];
                        to = [["m", t2.a, t2.b, t2.c, t2.d, t2.e, t2.f]];
                        break;
                    }
                    from[i] = [];
                    to[i] = [];
                    for (j = 0, jj = Math.max(tt1.length, tt2.length); j < jj; j++) {
                        j in tt1 && (from[i][j] = tt1[j]);
                        j in tt2 && (to[i][j] = tt2[j]);
                    }
                }
                return {
                    from: path2array(from),
                    to: path2array(to),
                    f: getPath(from)
                };

            }
            function getNumber(val) {
                return val;
            }
            function getUnit(unit) {
                return function (val) {
                    return +val.toFixed(3) + unit;
                };
            }
            function getViewBox(val) {
                return val.join(" ");
            }
            function getColour(clr) {
                return Snap.rgb(clr[0], clr[1], clr[2], clr[3]);
            }
            function getPath(path) {
                var k = 0, i, ii, j, jj, out, a, b = [];
                for (i = 0, ii = path.length; i < ii; i++) {
                    out = "[";
                    a = ['"' + path[i][0] + '"'];
                    for (j = 1, jj = path[i].length; j < jj; j++) {
                        a[j] = "val[" + k++ + "]";
                    }
                    out += a + "]";
                    b[i] = out;
                }
                return Function("val", "return Snap.path.toString.call([" + b + "])");
            }
            function path2array(path) {
                var out = [];
                for (var i = 0, ii = path.length; i < ii; i++) {
                    for (var j = 1, jj = path[i].length; j < jj; j++) {
                        out.push(path[i][j]);
                    }
                }
                return out;
            }
            function isNumeric(obj) {
                return isFinite(obj);
            }
            function arrayEqual(arr1, arr2) {
                if (!Snap.is(arr1, "array") || !Snap.is(arr2, "array")) {
                    return false;
                }
                return arr1.toString() == arr2.toString();
            }
            Element.prototype.equal = function (name, b) {
                return eve("snap.util.equal", this, name, b).firstDefined();
            };
            eve.on("snap.util.equal", function (name, b) {
                var A, B, a = Str(this.attr(name) || ""),
                    el = this;
                if (names[name] == "colour") {
                    A = Snap.color(a);
                    B = Snap.color(b);
                    return {
                        from: [A.r, A.g, A.b, A.opacity],
                        to: [B.r, B.g, B.b, B.opacity],
                        f: getColour
                    };

                }
                if (name == "viewBox") {
                    A = this.attr(name).vb.split(" ").map(Number);
                    B = b.split(" ").map(Number);
                    return {
                        from: A,
                        to: B,
                        f: getViewBox
                    };

                }
                if (name == "transform" || name == "gradientTransform" || name == "patternTransform") {
                    if (typeof b == "string") {
                        b = Str(b).replace(/\.{3}|\u2026/g, a);
                    }
                    a = this.matrix;
                    if (!Snap._.rgTransform.test(b)) {
                        b = Snap._.transform2matrix(Snap._.svgTransform2string(b), this.getBBox());
                    } else {
                        b = Snap._.transform2matrix(b, this.getBBox());
                    }
                    return equaliseTransform(a, b, function () {
                        return el.getBBox(1);
                    });
                }
                if (name == "d" || name == "path") {
                    A = Snap.path.toCubic(a, b);
                    return {
                        from: path2array(A[0]),
                        to: path2array(A[1]),
                        f: getPath(A[0])
                    };

                }
                if (name == "points") {
                    A = Str(a).split(Snap._.separator);
                    B = Str(b).split(Snap._.separator);
                    return {
                        from: A,
                        to: B,
                        f: function f(val) { return val; }
                    };

                }
                if (isNumeric(a) && isNumeric(b)) {
                    return {
                        from: parseFloat(a),
                        to: parseFloat(b),
                        f: getNumber
                    };

                }
                var aUnit = a.match(reUnit),
                    bUnit = Str(b).match(reUnit);
                if (aUnit && arrayEqual(aUnit, bUnit)) {
                    return {
                        from: parseFloat(a),
                        to: parseFloat(b),
                        f: getUnit(aUnit)
                    };

                } else {
                    return {
                        from: this.asPX(name),
                        to: this.asPX(name, b),
                        f: getNumber
                    };

                }
            });
        });

        // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
        // 
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        // 
        // http://www.apache.org/licenses/LICENSE-2.0
        // 
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob) {
            var elproto = Element.prototype,
                has = "hasOwnProperty",
                supportsTouch = "createTouch" in glob.doc,
                events = [
                    "click", "dblclick", "mousedown", "mousemove", "mouseout",
                    "mouseover", "mouseup", "touchstart", "touchmove", "touchend",
                    "touchcancel"],

                touchMap = {
                    mousedown: "touchstart",
                    mousemove: "touchmove",
                    mouseup: "touchend"
                },

                getScroll = function getScroll(xy, el) {
                    var name = xy == "y" ? "scrollTop" : "scrollLeft",
                        doc = el && el.node ? el.node.ownerDocument : glob.doc;
                    return doc[name in doc.documentElement ? "documentElement" : "body"][name];
                },
                preventDefault = function preventDefault() {
                    this.returnValue = false;
                },
                preventTouch = function preventTouch() {
                    return this.originalEvent.preventDefault();
                },
                stopPropagation = function stopPropagation() {
                    this.cancelBubble = true;
                },
                stopTouch = function stopTouch() {
                    return this.originalEvent.stopPropagation();
                },
                addEvent = function addEvent(obj, type, fn, element) {
                    var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
                        f = function f(e) {
                            var scrollY = getScroll("y", element),
                                scrollX = getScroll("x", element);
                            if (supportsTouch && touchMap[has](type)) {
                                for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                                    if (e.targetTouches[i].target == obj || obj.contains(e.targetTouches[i].target)) {
                                        var olde = e;
                                        e = e.targetTouches[i];
                                        e.originalEvent = olde;
                                        e.preventDefault = preventTouch;
                                        e.stopPropagation = stopTouch;
                                        break;
                                    }
                                }
                            }
                            var x = e.clientX + scrollX,
                                y = e.clientY + scrollY;
                            return fn.call(element, e, x, y);
                        };

                    if (type !== realName) {
                        obj.addEventListener(type, f, false);
                    }

                    obj.addEventListener(realName, f, false);

                    return function () {
                        if (type !== realName) {
                            obj.removeEventListener(type, f, false);
                        }

                        obj.removeEventListener(realName, f, false);
                        return true;
                    };
                },
                drag = [],
                dragMove = function dragMove(e) {
                    var x = e.clientX,
                        y = e.clientY,
                        scrollY = getScroll("y"),
                        scrollX = getScroll("x"),
                        dragi,
                        j = drag.length;
                    while (j--) {
                        dragi = drag[j];
                        if (supportsTouch) {
                            var i = e.touches && e.touches.length,
                                touch;
                            while (i--) {
                                touch = e.touches[i];
                                if (touch.identifier == dragi.el._drag.id || dragi.el.node.contains(touch.target)) {
                                    x = touch.clientX;
                                    y = touch.clientY;
                                    (e.originalEvent ? e.originalEvent : e).preventDefault();
                                    break;
                                }
                            }
                        } else {
                            e.preventDefault();
                        }
                        var node = dragi.el.node,
                            o,
                            next = node.nextSibling,
                            parent = node.parentNode,
                            display = node.style.display;
                        // glob.win.opera && parent.removeChild(node);
                        // node.style.display = "none";
                        // o = dragi.el.paper.getElementByPoint(x, y);
                        // node.style.display = display;
                        // glob.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
                        // o && eve("snap.drag.over." + dragi.el.id, dragi.el, o);
                        x += scrollX;
                        y += scrollY;
                        eve("snap.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
                    }
                },
                dragUp = function dragUp(e) {
                    Snap.unmousemove(dragMove).unmouseup(dragUp);
                    var i = drag.length,
                        dragi;
                    while (i--) {
                        dragi = drag[i];
                        dragi.el._drag = {};
                        eve("snap.drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
                        eve.off("snap.drag.*." + dragi.el.id);
                    }
                    drag = [];
                };
            /*\
                 * Element.click
                 [ method ]
                 **
                 * Adds a click event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.unclick
                 [ method ]
                 **
                 * Removes a click event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/

            /*\
                 * Element.dblclick
                 [ method ]
                 **
                 * Adds a double click event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.undblclick
                 [ method ]
                 **
                 * Removes a double click event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/

            /*\
                 * Element.mousedown
                 [ method ]
                 **
                 * Adds a mousedown event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.unmousedown
                 [ method ]
                 **
                 * Removes a mousedown event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/

            /*\
                 * Element.mousemove
                 [ method ]
                 **
                 * Adds a mousemove event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.unmousemove
                 [ method ]
                 **
                 * Removes a mousemove event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/

            /*\
                 * Element.mouseout
                 [ method ]
                 **
                 * Adds a mouseout event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.unmouseout
                 [ method ]
                 **
                 * Removes a mouseout event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/

            /*\
                 * Element.mouseover
                 [ method ]
                 **
                 * Adds a mouseover event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.unmouseover
                 [ method ]
                 **
                 * Removes a mouseover event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/

            /*\
                 * Element.mouseup
                 [ method ]
                 **
                 * Adds a mouseup event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.unmouseup
                 [ method ]
                 **
                 * Removes a mouseup event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/

            /*\
                 * Element.touchstart
                 [ method ]
                 **
                 * Adds a touchstart event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.untouchstart
                 [ method ]
                 **
                 * Removes a touchstart event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/

            /*\
                 * Element.touchmove
                 [ method ]
                 **
                 * Adds a touchmove event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.untouchmove
                 [ method ]
                 **
                 * Removes a touchmove event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/

            /*\
                 * Element.touchend
                 [ method ]
                 **
                 * Adds a touchend event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.untouchend
                 [ method ]
                 **
                 * Removes a touchend event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/

            /*\
                 * Element.touchcancel
                 [ method ]
                 **
                 * Adds a touchcancel event handler to the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            /*\
                 * Element.untouchcancel
                 [ method ]
                 **
                 * Removes a touchcancel event handler from the element
                 - handler (function) handler for the event
                 = (object) @Element
                \*/
            for (var i = events.length; i--;) {
                (function (eventName) {
                    Snap[eventName] = elproto[eventName] = function (fn, scope) {
                        if (Snap.is(fn, "function")) {
                            this.events = this.events || [];
                            this.events.push({
                                name: eventName,
                                f: fn,
                                unbind: addEvent(this.node || document, eventName, fn, scope || this)
                            });

                        } else {
                            for (var i = 0, ii = this.events.length; i < ii; i++) {
                                if (this.events[i].name == eventName) {
                                    try {
                                        this.events[i].f.call(this);
                                    } catch (e) { }
                                }
                            }
                        }
                        return this;
                    };
                    Snap["un" + eventName] =
                        elproto["un" + eventName] = function (fn) {
                            var events = this.events || [],
                                l = events.length;
                            while (l--) {
                                if (events[l].name == eventName && (
                                    events[l].f == fn || !fn)) {
                                    events[l].unbind();
                                    events.splice(l, 1);
                                    !events.length && delete this.events;
                                    return this;
                                }
                            }
                            return this;
                        };
                })(events[i]);
            }
            /*\
                 * Element.hover
                 [ method ]
                 **
                 * Adds hover event handlers to the element
                 - f_in (function) handler for hover in
                 - f_out (function) handler for hover out
                 - icontext (object) #optional context for hover in handler
                 - ocontext (object) #optional context for hover out handler
                 = (object) @Element
                \*/
            elproto.hover = function (f_in, f_out, scope_in, scope_out) {
                return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
            };
            /*\
                 * Element.unhover
                 [ method ]
                 **
                 * Removes hover event handlers from the element
                 - f_in (function) handler for hover in
                 - f_out (function) handler for hover out
                 = (object) @Element
                \*/
            elproto.unhover = function (f_in, f_out) {
                return this.unmouseover(f_in).unmouseout(f_out);
            };
            var draggable = [];
            // SIERRA unclear what _context_ refers to for starting, ending, moving the drag gesture.
            // SIERRA Element.drag(): _x position of the mouse_: Where are the x/y values offset from?
            // SIERRA Element.drag(): much of this member's doc appears to be duplicated for some reason.
            // SIERRA Unclear about this sentence: _Additionally following drag events will be triggered: drag.start.<id> on start, drag.end.<id> on end and drag.move.<id> on every move._ Is there a global _drag_ object to which you can assign handlers keyed by an element's ID?
            /*\
                 * Element.drag
                 [ method ]
                 **
                 * Adds event handlers for an element's drag gesture
                 **
                 - onmove (function) handler for moving
                 - onstart (function) handler for drag start
                 - onend (function) handler for drag end
                 - mcontext (object) #optional context for moving handler
                 - scontext (object) #optional context for drag start handler
                 - econtext (object) #optional context for drag end handler
                 * Additionaly following `drag` events are triggered: `drag.start.<id>` on start, 
                 * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element is dragged over another element 
                 * `drag.over.<id>` fires as well.
                 *
                 * Start event and start handler are called in specified context or in context of the element with following parameters:
                 o x (number) x position of the mouse
                 o y (number) y position of the mouse
                 o event (object) DOM event object
                 * Move event and move handler are called in specified context or in context of the element with following parameters:
                 o dx (number) shift by x from the start point
                 o dy (number) shift by y from the start point
                 o x (number) x position of the mouse
                 o y (number) y position of the mouse
                 o event (object) DOM event object
                 * End event and end handler are called in specified context or in context of the element with following parameters:
                 o event (object) DOM event object
                 = (object) @Element
                \*/
            elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
                var el = this;
                if (!arguments.length) {
                    var origTransform;
                    return el.drag(function (dx, dy) {
                        this.attr({
                            transform: origTransform + (origTransform ? "T" : "t") + [dx, dy]
                        });

                    }, function () {
                        origTransform = this.transform().local;
                    });
                }
                function start(e, x, y) {
                    (e.originalEvent || e).preventDefault();
                    el._drag.x = x;
                    el._drag.y = y;
                    el._drag.id = e.identifier;
                    !drag.length && Snap.mousemove(dragMove).mouseup(dragUp);
                    drag.push({ el: el, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope });
                    onstart && eve.on("snap.drag.start." + el.id, onstart);
                    onmove && eve.on("snap.drag.move." + el.id, onmove);
                    onend && eve.on("snap.drag.end." + el.id, onend);
                    eve("snap.drag.start." + el.id, start_scope || move_scope || el, x, y, e);
                }
                function init(e, x, y) {
                    eve("snap.draginit." + el.id, el, e, x, y);
                }
                eve.on("snap.draginit." + el.id, start);
                el._drag = {};
                draggable.push({ el: el, start: start, init: init });
                el.mousedown(init);
                return el;
            };
            /*
                 * Element.onDragOver
                 [ method ]
                 **
                 * Shortcut to assign event handler for `drag.over.<id>` event, where `id` is the element's `id` (see @Element.id)
                 - f (function) handler for event, first argument would be the element you are dragging over
                \*/
            // elproto.onDragOver = function (f) {
            //     f ? eve.on("snap.drag.over." + this.id, f) : eve.unbind("snap.drag.over." + this.id);
            // };
            /*\
                 * Element.undrag
                 [ method ]
                 **
                 * Removes all drag event handlers from the given element
                \*/
            elproto.undrag = function () {
                var i = draggable.length;
                while (i--) {
                    if (draggable[i].el == this) {
                        this.unmousedown(draggable[i].init);
                        draggable.splice(i, 1);
                        eve.unbind("snap.drag.*." + this.id);
                        eve.unbind("snap.draginit." + this.id);
                    }
                }
                !draggable.length && Snap.unmousemove(dragMove).unmouseup(dragUp);
                return this;
            };
        });

        // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob) {
            var elproto = Element.prototype,
                pproto = Paper.prototype,
                rgurl = /^\s*url\((.+)\)/,
                Str = String,
                $ = Snap._.$;
            Snap.filter = {};
            /*\
                 * Paper.filter
                 [ method ]
                 **
                 * Creates a `<filter>` element
                 **
                 - filstr (string) SVG fragment of filter provided as a string
                 = (object) @Element
                 * Note: It is recommended to use filters embedded into the page inside an empty SVG element.
                 > Usage
                 | var f = paper.filter('<feGaussianBlur stdDeviation="2"/>'),
                 |     c = paper.circle(10, 10, 10).attr({
                 |         filter: f
                 |     });
                \*/
            pproto.filter = function (filstr) {
                var paper = this;
                if (paper.type != "svg") {
                    paper = paper.paper;
                }
                var f = Snap.parse(Str(filstr)),
                    id = Snap._.id(),
                    width = paper.node.offsetWidth,
                    height = paper.node.offsetHeight,
                    filter = $("filter");
                $(filter, {
                    id: id,
                    filterUnits: "userSpaceOnUse"
                });

                filter.appendChild(f.node);
                paper.defs.appendChild(filter);
                return new Element(filter);
            };

            eve.on("snap.util.getattr.filter", function () {
                eve.stop();
                var p = $(this.node, "filter");
                if (p) {
                    var match = Str(p).match(rgurl);
                    return match && Snap.select(match[1]);
                }
            });
            eve.on("snap.util.attr.filter", function (value) {
                if (value instanceof Element && value.type == "filter") {
                    eve.stop();
                    var id = value.node.id;
                    if (!id) {
                        $(value.node, { id: value.id });
                        id = value.id;
                    }
                    $(this.node, {
                        filter: Snap.url(id)
                    });

                }
                if (!value || value == "none") {
                    eve.stop();
                    this.node.removeAttribute("filter");
                }
            });
            /*\
                 * Snap.filter.blur
                 [ method ]
                 **
                 * Returns an SVG markup string for the blur filter
                 **
                 - x (number) amount of horizontal blur, in pixels
                 - y (number) #optional amount of vertical blur, in pixels
                 = (string) filter representation
                 > Usage
                 | var f = paper.filter(Snap.filter.blur(5, 10)),
                 |     c = paper.circle(10, 10, 10).attr({
                 |         filter: f
                 |     });
                \*/
            Snap.filter.blur = function (x, y) {
                if (x == null) {
                    x = 2;
                }
                var def = y == null ? x : [x, y];
                return Snap.format('\<feGaussianBlur stdDeviation="{def}"/>', {
                    def: def
                });

            };
            Snap.filter.blur.toString = function () {
                return this();
            };
            /*\
                 * Snap.filter.shadow
                 [ method ]
                 **
                 * Returns an SVG markup string for the shadow filter
                 **
                 - dx (number) #optional horizontal shift of the shadow, in pixels
                 - dy (number) #optional vertical shift of the shadow, in pixels
                 - blur (number) #optional amount of blur
                 - color (string) #optional color of the shadow
                 - opacity (number) #optional `0..1` opacity of the shadow
                 * or
                 - dx (number) #optional horizontal shift of the shadow, in pixels
                 - dy (number) #optional vertical shift of the shadow, in pixels
                 - color (string) #optional color of the shadow
                 - opacity (number) #optional `0..1` opacity of the shadow
                 * which makes blur default to `4`. Or
                 - dx (number) #optional horizontal shift of the shadow, in pixels
                 - dy (number) #optional vertical shift of the shadow, in pixels
                 - opacity (number) #optional `0..1` opacity of the shadow
                 = (string) filter representation
                 > Usage
                 | var f = paper.filter(Snap.filter.shadow(0, 2, .3)),
                 |     c = paper.circle(10, 10, 10).attr({
                 |         filter: f
                 |     });
                \*/
            Snap.filter.shadow = function (dx, dy, blur, color, opacity) {
                if (opacity == null) {
                    if (color == null) {
                        opacity = blur;
                        blur = 4;
                        color = "#000";
                    } else {
                        opacity = color;
                        color = blur;
                        blur = 4;
                    }
                }
                if (blur == null) {
                    blur = 4;
                }
                if (opacity == null) {
                    opacity = 1;
                }
                if (dx == null) {
                    dx = 0;
                    dy = 2;
                }
                if (dy == null) {
                    dy = dx;
                }
                color = Snap.color(color);
                return Snap.format('<feGaussianBlur in="SourceAlpha" stdDeviation="{blur}"/><feOffset dx="{dx}" dy="{dy}" result="offsetblur"/><feFlood flood-color="{color}"/><feComposite in2="offsetblur" operator="in"/><feComponentTransfer><feFuncA type="linear" slope="{opacity}"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>', {
                    color: color,
                    dx: dx,
                    dy: dy,
                    blur: blur,
                    opacity: opacity
                });

            };
            Snap.filter.shadow.toString = function () {
                return this();
            };
            /*\
                 * Snap.filter.grayscale
                 [ method ]
                 **
                 * Returns an SVG markup string for the grayscale filter
                 **
                 - amount (number) amount of filter (`0..1`)
                 = (string) filter representation
                \*/
            Snap.filter.grayscale = function (amount) {
                if (amount == null) {
                    amount = 1;
                }
                return Snap.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {b} {h} 0 0 0 0 0 1 0"/>', {
                    a: 0.2126 + 0.7874 * (1 - amount),
                    b: 0.7152 - 0.7152 * (1 - amount),
                    c: 0.0722 - 0.0722 * (1 - amount),
                    d: 0.2126 - 0.2126 * (1 - amount),
                    e: 0.7152 + 0.2848 * (1 - amount),
                    f: 0.0722 - 0.0722 * (1 - amount),
                    g: 0.2126 - 0.2126 * (1 - amount),
                    h: 0.0722 + 0.9278 * (1 - amount)
                });

            };
            Snap.filter.grayscale.toString = function () {
                return this();
            };
            /*\
                 * Snap.filter.sepia
                 [ method ]
                 **
                 * Returns an SVG markup string for the sepia filter
                 **
                 - amount (number) amount of filter (`0..1`)
                 = (string) filter representation
                \*/
            Snap.filter.sepia = function (amount) {
                if (amount == null) {
                    amount = 1;
                }
                return Snap.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {h} {i} 0 0 0 0 0 1 0"/>', {
                    a: 0.393 + 0.607 * (1 - amount),
                    b: 0.769 - 0.769 * (1 - amount),
                    c: 0.189 - 0.189 * (1 - amount),
                    d: 0.349 - 0.349 * (1 - amount),
                    e: 0.686 + 0.314 * (1 - amount),
                    f: 0.168 - 0.168 * (1 - amount),
                    g: 0.272 - 0.272 * (1 - amount),
                    h: 0.534 - 0.534 * (1 - amount),
                    i: 0.131 + 0.869 * (1 - amount)
                });

            };
            Snap.filter.sepia.toString = function () {
                return this();
            };
            /*\
                 * Snap.filter.saturate
                 [ method ]
                 **
                 * Returns an SVG markup string for the saturate filter
                 **
                 - amount (number) amount of filter (`0..1`)
                 = (string) filter representation
                \*/
            Snap.filter.saturate = function (amount) {
                if (amount == null) {
                    amount = 1;
                }
                return Snap.format('<feColorMatrix type="saturate" values="{amount}"/>', {
                    amount: 1 - amount
                });

            };
            Snap.filter.saturate.toString = function () {
                return this();
            };
            /*\
                 * Snap.filter.hueRotate
                 [ method ]
                 **
                 * Returns an SVG markup string for the hue-rotate filter
                 **
                 - angle (number) angle of rotation
                 = (string) filter representation
                \*/
            Snap.filter.hueRotate = function (angle) {
                angle = angle || 0;
                return Snap.format('<feColorMatrix type="hueRotate" values="{angle}"/>', {
                    angle: angle
                });

            };
            Snap.filter.hueRotate.toString = function () {
                return this();
            };
            /*\
                 * Snap.filter.invert
                 [ method ]
                 **
                 * Returns an SVG markup string for the invert filter
                 **
                 - amount (number) amount of filter (`0..1`)
                 = (string) filter representation
                \*/
            Snap.filter.invert = function (amount) {
                if (amount == null) {
                    amount = 1;
                }
                //        <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0" color-interpolation-filters="sRGB"/>
                return Snap.format('<feComponentTransfer><feFuncR type="table" tableValues="{amount} {amount2}"/><feFuncG type="table" tableValues="{amount} {amount2}"/><feFuncB type="table" tableValues="{amount} {amount2}"/></feComponentTransfer>', {
                    amount: amount,
                    amount2: 1 - amount
                });

            };
            Snap.filter.invert.toString = function () {
                return this();
            };
            /*\
                 * Snap.filter.brightness
                 [ method ]
                 **
                 * Returns an SVG markup string for the brightness filter
                 **
                 - amount (number) amount of filter (`0..1`)
                 = (string) filter representation
                \*/
            Snap.filter.brightness = function (amount) {
                if (amount == null) {
                    amount = 1;
                }
                return Snap.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}"/><feFuncG type="linear" slope="{amount}"/><feFuncB type="linear" slope="{amount}"/></feComponentTransfer>', {
                    amount: amount
                });

            };
            Snap.filter.brightness.toString = function () {
                return this();
            };
            /*\
                 * Snap.filter.contrast
                 [ method ]
                 **
                 * Returns an SVG markup string for the contrast filter
                 **
                 - amount (number) amount of filter (`0..1`)
                 = (string) filter representation
                \*/
            Snap.filter.contrast = function (amount) {
                if (amount == null) {
                    amount = 1;
                }
                return Snap.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}" intercept="{amount2}"/><feFuncG type="linear" slope="{amount}" intercept="{amount2}"/><feFuncB type="linear" slope="{amount}" intercept="{amount2}"/></feComponentTransfer>', {
                    amount: amount,
                    amount2: .5 - amount / 2
                });

            };
            Snap.filter.contrast.toString = function () {
                return this();
            };
        });

        // Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
            var box = Snap._.box,
                is = Snap.is,
                firstLetter = /^[^a-z]*([tbmlrc])/i,
                toString = function toString() {
                    return "T" + this.dx + "," + this.dy;
                };
            /*\
                 * Element.getAlign
                 [ method ]
                 **
                 * Returns shift needed to align the element relatively to given element.
                 * If no elements specified, parent `<svg>` container will be used.
                 - el (object) @optional alignment element
                 - way (string) one of six values: `"top"`, `"middle"`, `"bottom"`, `"left"`, `"center"`, `"right"`
                 = (object|string) Object in format `{dx: , dy: }` also has a string representation as a transformation string
                 > Usage
                 | el.transform(el.getAlign(el2, "top"));
                 * or
                 | var dy = el.getAlign(el2, "top").dy;
                \*/
            Element.prototype.getAlign = function (el, way) {
                if (way == null && is(el, "string")) {
                    way = el;
                    el = null;
                }
                el = el || this.paper;
                var bx = el.getBBox ? el.getBBox() : box(el),
                    bb = this.getBBox(),
                    out = {};
                way = way && way.match(firstLetter);
                way = way ? way[1].toLowerCase() : "c";
                switch (way) {
                    case "t":
                        out.dx = 0;
                        out.dy = bx.y - bb.y;
                        break;
                    case "b":
                        out.dx = 0;
                        out.dy = bx.y2 - bb.y2;
                        break;
                    case "m":
                        out.dx = 0;
                        out.dy = bx.cy - bb.cy;
                        break;
                    case "l":
                        out.dx = bx.x - bb.x;
                        out.dy = 0;
                        break;
                    case "r":
                        out.dx = bx.x2 - bb.x2;
                        out.dy = 0;
                        break;
                    default:
                        out.dx = bx.cx - bb.cx;
                        out.dy = 0;
                        break;
                }

                out.toString = toString;
                return out;
            };
            /*\
                 * Element.align
                 [ method ]
                 **
                 * Aligns the element relatively to given one via transformation.
                 * If no elements specified, parent `<svg>` container will be used.
                 - el (object) @optional alignment element
                 - way (string) one of six values: `"top"`, `"middle"`, `"bottom"`, `"left"`, `"center"`, `"right"`
                 = (object) this element
                 > Usage
                 | el.align(el2, "top");
                 * or
                 | el.align("middle");
                \*/
            Element.prototype.align = function (el, way) {
                return this.transform("..." + this.getAlign(el, way));
            };
        });

        // Copyright (c) 2016 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
            var elproto = Element.prototype,
                is = Snap.is,
                Str = String,
                has = "hasOwnProperty";
            function slice(from, to, f) {
                return function (arr) {
                    var res = arr.slice(from, to);
                    if (res.length == 1) {
                        res = res[0];
                    }
                    return f ? f(res) : res;
                };
            }
            var Animation = function Animation(attr, ms, easing, callback) {
                if (typeof easing == "function" && !easing.length) {
                    callback = easing;
                    easing = mina.linear;
                }
                this.attr = attr;
                this.dur = ms;
                easing && (this.easing = easing);
                callback && (this.callback = callback);
            };
            Snap._.Animation = Animation;
            /*\
                 * Snap.animation
                 [ method ]
                 **
                 * Creates an animation object
                 **
                 - attr (object) attributes of final destination
                 - duration (number) duration of the animation, in milliseconds
                 - easing (function) #optional one of easing functions of @mina or custom one
                 - callback (function) #optional callback function that fires when animation ends
                 = (object) animation object
                \*/
            Snap.animation = function (attr, ms, easing, callback) {
                return new Animation(attr, ms, easing, callback);
            };
            /*\
                 * Element.inAnim
                 [ method ]
                 **
                 * Returns a set of animations that may be able to manipulate the current element
                 **
                 = (object) in format:
                 o {
                 o     anim (object) animation object,
                 o     mina (object) @mina object,
                 o     curStatus (number) 0..1 — status of the animation: 0 — just started, 1 — just finished,
                 o     status (function) gets or sets the status of the animation,
                 o     stop (function) stops the animation
                 o }
                \*/
            elproto.inAnim = function () {
                var el = this,
                    res = [];
                for (var id in el.anims) {
                    if (el.anims[has](id)) {
                        (function (a) {
                            res.push({
                                anim: new Animation(a._attrs, a.dur, a.easing, a._callback),
                                mina: a,
                                curStatus: a.status(),
                                status: function status(val) {
                                    return a.status(val);
                                },
                                stop: function stop() {
                                    a.stop();
                                }
                            });

                        })(el.anims[id]);
                    }
                }
                return res;
            };
            /*\
                 * Snap.animate
                 [ method ]
                 **
                 * Runs generic animation of one number into another with a caring function
                 **
                 - from (number|array) number or array of numbers
                 - to (number|array) number or array of numbers
                 - setter (function) caring function that accepts one number argument
                 - duration (number) duration, in milliseconds
                 - easing (function) #optional easing function from @mina or custom
                 - callback (function) #optional callback function to execute when animation ends
                 = (object) animation object in @mina format
                 o {
                 o     id (string) animation id, consider it read-only,
                 o     duration (function) gets or sets the duration of the animation,
                 o     easing (function) easing,
                 o     speed (function) gets or sets the speed of the animation,
                 o     status (function) gets or sets the status of the animation,
                 o     stop (function) stops the animation
                 o }
                 | var rect = Snap().rect(0, 0, 10, 10);
                 | Snap.animate(0, 10, function (val) {
                 |     rect.attr({
                 |         x: val
                 |     });
                 | }, 1000);
                 | // in given context is equivalent to
                 | rect.animate({x: 10}, 1000);
                \*/
            Snap.animate = function (from, to, setter, ms, easing, callback) {
                if (typeof easing == "function" && !easing.length) {
                    callback = easing;
                    easing = mina.linear;
                }
                var now = mina.time(),
                    anim = mina(from, to, now, now + ms, mina.time, setter, easing);
                callback && eve.once("mina.finish." + anim.id, callback);
                return anim;
            };
            /*\
                 * Element.stop
                 [ method ]
                 **
                 * Stops all the animations for the current element
                 **
                 = (Element) the current element
                \*/
            elproto.stop = function () {
                var anims = this.inAnim();
                for (var i = 0, ii = anims.length; i < ii; i++) {
                    anims[i].stop();
                }
                return this;
            };
            /*\
                 * Element.animate
                 [ method ]
                 **
                 * Animates the given attributes of the element
                 **
                 - attrs (object) key-value pairs of destination attributes
                 - duration (number) duration of the animation in milliseconds
                 - easing (function) #optional easing function from @mina or custom
                 - callback (function) #optional callback function that executes when the animation ends
                 = (Element) the current element
                \*/
            elproto.animate = function (attrs, ms, easing, callback) {
                if (typeof easing == "function" && !easing.length) {
                    callback = easing;
                    easing = mina.linear;
                }
                if (attrs instanceof Animation) {
                    callback = attrs.callback;
                    easing = attrs.easing;
                    ms = attrs.dur;
                    attrs = attrs.attr;
                }
                var fkeys = [], tkeys = [], keys = {}, from, to, f, eq,
                    el = this;
                for (var key in attrs) {
                    if (attrs[has](key)) {
                        if (el.equal) {
                            eq = el.equal(key, Str(attrs[key]));
                            from = eq.from;
                            to = eq.to;
                            f = eq.f;
                        } else {
                            from = +el.attr(key);
                            to = +attrs[key];
                        }
                        var len = is(from, "array") ? from.length : 1;
                        keys[key] = slice(fkeys.length, fkeys.length + len, f);
                        fkeys = fkeys.concat(from);
                        tkeys = tkeys.concat(to);
                    }
                }
                var now = mina.time(),
                    anim = mina(fkeys, tkeys, now, now + ms, mina.time, function (val) {
                        var attr = {};
                        for (var key in keys) {
                            if (keys[has](key)) {
                                attr[key] = keys[key](val);
                            }
                        }
                        el.attr(attr);
                    }, easing);
                el.anims[anim.id] = anim;
                anim._attrs = attrs;
                anim._callback = callback;
                eve("snap.animcreated." + el.id, anim);
                eve.once("mina.finish." + anim.id, function () {
                    eve.off("mina.*." + anim.id);
                    delete el.anims[anim.id];
                    callback && callback.call(el);
                });
                eve.once("mina.stop." + anim.id, function () {
                    eve.off("mina.*." + anim.id);
                    delete el.anims[anim.id];
                });
                return el;
            };
        });

        // Copyright (c) 2017 Adobe Systems Incorporated. All rights reserved.
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        // http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.
        Snap.plugin(function (Snap, Element, Paper, glob) {
            // Colours are from https://www.materialui.co
            var red = "#ffebee#ffcdd2#ef9a9a#e57373#ef5350#f44336#e53935#d32f2f#c62828#b71c1c#ff8a80#ff5252#ff1744#d50000",
                pink = "#FCE4EC#F8BBD0#F48FB1#F06292#EC407A#E91E63#D81B60#C2185B#AD1457#880E4F#FF80AB#FF4081#F50057#C51162",
                purple = "#F3E5F5#E1BEE7#CE93D8#BA68C8#AB47BC#9C27B0#8E24AA#7B1FA2#6A1B9A#4A148C#EA80FC#E040FB#D500F9#AA00FF",
                deeppurple = "#EDE7F6#D1C4E9#B39DDB#9575CD#7E57C2#673AB7#5E35B1#512DA8#4527A0#311B92#B388FF#7C4DFF#651FFF#6200EA",
                indigo = "#E8EAF6#C5CAE9#9FA8DA#7986CB#5C6BC0#3F51B5#3949AB#303F9F#283593#1A237E#8C9EFF#536DFE#3D5AFE#304FFE",
                blue = "#E3F2FD#BBDEFB#90CAF9#64B5F6#64B5F6#2196F3#1E88E5#1976D2#1565C0#0D47A1#82B1FF#448AFF#2979FF#2962FF",
                lightblue = "#E1F5FE#B3E5FC#81D4FA#4FC3F7#29B6F6#03A9F4#039BE5#0288D1#0277BD#01579B#80D8FF#40C4FF#00B0FF#0091EA",
                cyan = "#E0F7FA#B2EBF2#80DEEA#4DD0E1#26C6DA#00BCD4#00ACC1#0097A7#00838F#006064#84FFFF#18FFFF#00E5FF#00B8D4",
                teal = "#E0F2F1#B2DFDB#80CBC4#4DB6AC#26A69A#009688#00897B#00796B#00695C#004D40#A7FFEB#64FFDA#1DE9B6#00BFA5",
                green = "#E8F5E9#C8E6C9#A5D6A7#81C784#66BB6A#4CAF50#43A047#388E3C#2E7D32#1B5E20#B9F6CA#69F0AE#00E676#00C853",
                lightgreen = "#F1F8E9#DCEDC8#C5E1A5#AED581#9CCC65#8BC34A#7CB342#689F38#558B2F#33691E#CCFF90#B2FF59#76FF03#64DD17",
                lime = "#F9FBE7#F0F4C3#E6EE9C#DCE775#D4E157#CDDC39#C0CA33#AFB42B#9E9D24#827717#F4FF81#EEFF41#C6FF00#AEEA00",
                yellow = "#FFFDE7#FFF9C4#FFF59D#FFF176#FFEE58#FFEB3B#FDD835#FBC02D#F9A825#F57F17#FFFF8D#FFFF00#FFEA00#FFD600",
                amber = "#FFF8E1#FFECB3#FFE082#FFD54F#FFCA28#FFC107#FFB300#FFA000#FF8F00#FF6F00#FFE57F#FFD740#FFC400#FFAB00",
                orange = "#FFF3E0#FFE0B2#FFCC80#FFB74D#FFA726#FF9800#FB8C00#F57C00#EF6C00#E65100#FFD180#FFAB40#FF9100#FF6D00",
                deeporange = "#FBE9E7#FFCCBC#FFAB91#FF8A65#FF7043#FF5722#F4511E#E64A19#D84315#BF360C#FF9E80#FF6E40#FF3D00#DD2C00",
                brown = "#EFEBE9#D7CCC8#BCAAA4#A1887F#8D6E63#795548#6D4C41#5D4037#4E342E#3E2723",
                grey = "#FAFAFA#F5F5F5#EEEEEE#E0E0E0#BDBDBD#9E9E9E#757575#616161#424242#212121",
                bluegrey = "#ECEFF1#CFD8DC#B0BEC5#90A4AE#78909C#607D8B#546E7A#455A64#37474F#263238";
            /*\
                 * Snap.mui
                 [ property ]
                 **
                 * Contain Material UI colours.
                 | Snap().rect(0, 0, 10, 10).attr({fill: Snap.mui.deeppurple, stroke: Snap.mui.amber[600]});
                 # For colour reference: <a href="https://www.materialui.co">https://www.materialui.co</a>.
                \*/
            Snap.mui = {};
            /*\
                 * Snap.flat
                 [ property ]
                 **
                 * Contain Flat UI colours.
                 | Snap().rect(0, 0, 10, 10).attr({fill: Snap.flat.carrot, stroke: Snap.flat.wetasphalt});
                 # For colour reference: <a href="https://www.materialui.co">https://www.materialui.co</a>.
                \*/
            Snap.flat = {};
            function saveColor(colors) {
                colors = colors.split(/(?=#)/);
                var color = new String(colors[5]);
                color[50] = colors[0];
                color[100] = colors[1];
                color[200] = colors[2];
                color[300] = colors[3];
                color[400] = colors[4];
                color[500] = colors[5];
                color[600] = colors[6];
                color[700] = colors[7];
                color[800] = colors[8];
                color[900] = colors[9];
                if (colors[10]) {
                    color.A100 = colors[10];
                    color.A200 = colors[11];
                    color.A400 = colors[12];
                    color.A700 = colors[13];
                }
                return color;
            }
            Snap.mui.red = saveColor(red);
            Snap.mui.pink = saveColor(pink);
            Snap.mui.purple = saveColor(purple);
            Snap.mui.deeppurple = saveColor(deeppurple);
            Snap.mui.indigo = saveColor(indigo);
            Snap.mui.blue = saveColor(blue);
            Snap.mui.lightblue = saveColor(lightblue);
            Snap.mui.cyan = saveColor(cyan);
            Snap.mui.teal = saveColor(teal);
            Snap.mui.green = saveColor(green);
            Snap.mui.lightgreen = saveColor(lightgreen);
            Snap.mui.lime = saveColor(lime);
            Snap.mui.yellow = saveColor(yellow);
            Snap.mui.amber = saveColor(amber);
            Snap.mui.orange = saveColor(orange);
            Snap.mui.deeporange = saveColor(deeporange);
            Snap.mui.brown = saveColor(brown);
            Snap.mui.grey = saveColor(grey);
            Snap.mui.bluegrey = saveColor(bluegrey);
            Snap.flat.turquoise = "#1abc9c";
            Snap.flat.greensea = "#16a085";
            Snap.flat.sunflower = "#f1c40f";
            Snap.flat.orange = "#f39c12";
            Snap.flat.emerland = "#2ecc71";
            Snap.flat.nephritis = "#27ae60";
            Snap.flat.carrot = "#e67e22";
            Snap.flat.pumpkin = "#d35400";
            Snap.flat.peterriver = "#3498db";
            Snap.flat.belizehole = "#2980b9";
            Snap.flat.alizarin = "#e74c3c";
            Snap.flat.pomegranate = "#c0392b";
            Snap.flat.amethyst = "#9b59b6";
            Snap.flat.wisteria = "#8e44ad";
            Snap.flat.clouds = "#ecf0f1";
            Snap.flat.silver = "#bdc3c7";
            Snap.flat.wetasphalt = "#34495e";
            Snap.flat.midnightblue = "#2c3e50";
            Snap.flat.concrete = "#95a5a6";
            Snap.flat.asbestos = "#7f8c8d";
            /*\
                 * Snap.importMUIColors
                 [ method ]
                 **
                 * Imports Material UI colours into global object.
                 | Snap.importMUIColors();
                 | Snap().rect(0, 0, 10, 10).attr({fill: deeppurple, stroke: amber[600]});
                 # For colour reference: <a href="https://www.materialui.co">https://www.materialui.co</a>.
                \*/
            Snap.importMUIColors = function () {
                for (var color in Snap.mui) {
                    if (Snap.mui.hasOwnProperty(color)) {
                        window[color] = Snap.mui[color];
                    }
                }
            };
        });

        module.exports = Snap;

    }, { "eve": 1 }], 3: [function (require, module, exports) {
        (function (global) {
            /* eslint-env browser */
            'use strict';

            var _jquery = typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null; var _jquery2 = _interopRequireDefault(_jquery);
            var _prepinputs = require('modules/prepinputs.js'); var _prepinputs2 = _interopRequireDefault(_prepinputs);
            var _socialShare = require('modules/socialShare.js'); var _socialShare2 = _interopRequireDefault(_socialShare);
            var _carousel = require('modules/carousel.js'); var _carousel2 = _interopRequireDefault(_carousel);
            var _qTip = require('modules/qTip.js'); var _qTip2 = _interopRequireDefault(_qTip);
            var _accordion = require('modules/accordion.js'); var _accordion2 = _interopRequireDefault(_accordion);
            var _galleryWidget = require('modules/galleryWidget.js'); var _galleryWidget2 = _interopRequireDefault(_galleryWidget);
            var _heroAnimation = require('modules/hero-animation.js'); var _heroAnimation2 = _interopRequireDefault(_heroAnimation);
            var _browserDetection = require('modules/browser-detection.js'); var _browserDetection2 = _interopRequireDefault(_browserDetection);
            var _facetsOveride = require('modules/facets-overide.js'); var _facetsOveride2 = _interopRequireDefault(_facetsOveride);
            var _scrollBar = require('modules/scrollBar.js'); var _scrollBar2 = _interopRequireDefault(_scrollBar);
            var _stickySidebar = require('modules/sticky-sidebar.js'); var _stickySidebar2 = _interopRequireDefault(_stickySidebar);
            var _osBrowserHack = require('modules/osBrowserHack.js'); var _osBrowserHack2 = _interopRequireDefault(_osBrowserHack);


            var _loading = require('./modules/loading.js'); var _loading2 = _interopRequireDefault(_loading);
            var _fullpageSettings = require('./modules/fullpageSettings.js'); var _fullpageSettings2 = _interopRequireDefault(_fullpageSettings);
            var _beforePrintInit = require('./modules/beforePrintInit.js'); var _beforePrintInit2 = _interopRequireDefault(_beforePrintInit);
            var _navigation = require('./modules/navigation.js'); var _navigation2 = _interopRequireDefault(_navigation);
            var _inPageNavigation = require('./modules/in-page-navigation.js'); var _inPageNavigation2 = _interopRequireDefault(_inPageNavigation);
            var _hamburger = require('./modules/hamburger.js'); var _hamburger2 = _interopRequireDefault(_hamburger);
            var _autoHeight = require('./modules/autoHeight.js'); var _autoHeight2 = _interopRequireDefault(_autoHeight);
            var _partnerPopup = require('./modules/partnerPopup.js'); var _partnerPopup2 = _interopRequireDefault(_partnerPopup);
            var _diptychPopup = require('./modules/diptychPopup.js'); var _diptychPopup2 = _interopRequireDefault(_diptychPopup);
            var _triptychPopup = require('./modules/triptychPopup.js'); var _triptychPopup2 = _interopRequireDefault(_triptychPopup);
            var _triptychVidPopup = require('./modules/triptychVidPopup.js'); var _triptychVidPopup2 = _interopRequireDefault(_triptychVidPopup);
            var _scrollHandler = require('./modules/scrollHandler.js'); var _scrollHandler2 = _interopRequireDefault(_scrollHandler);
            var _lineChart = require('./modules/lineChart.js'); var _lineChart2 = _interopRequireDefault(_lineChart);
            var _socialShareCS = require('modules/socialShareCS.js'); var _socialShareCS2 = _interopRequireDefault(_socialShareCS);
            var _customScroll = require('./modules/customScroll.js'); var _customScroll2 = _interopRequireDefault(_customScroll);


            var _doodle = require('modules/doodle.js'); var _doodle2 = _interopRequireDefault(_doodle); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }/**************** Case Study ***********************/

            (function ($) {
                $(document).ready(function () {
                    ready();

                    // Styleguide event when an element is rendered
                    $(window).bind("styleguide:onRendered", function (e) {
                        ready();
                    });

                    // Event for screen rotation
                    $(window).on('resize orientationchange', function () {
                        (0, _stickySidebar2.default)();//Recalculate
                    });
                });

                // Initalizing all modules
                function ready() {
                    // add IE version helper classes
                    (0, _browserDetection2.default)();

                    // Initialize carousels
                    (0, _carousel2.default)();

                    // Initialize qTip
                    (0, _qTip2.default)();

                    // Initialize accordion
                    (0, _accordion2.default)();

                    // Initialize Plugins
                    $('.magnific-trigger').magnificPopup({
                        type: 'inline'
                    });


                    // Initialize Gallery Slider
                    (0, _galleryWidget2.default)();

                    // Init hero border hero animation
                    (0, _heroAnimation2.default)();

                    (0, _facetsOveride2.default)();

                    (0, _stickySidebar2.default)();

                    /*** Case Study ***/
                    (0, _loading2.default)();
                    (0, _fullpageSettings2.default)();
                    (0, _beforePrintInit2.default)();
                    (0, _navigation2.default)();
                    (0, _hamburger2.default)();
                    (0, _autoHeight2.default)();
                    (0, _partnerPopup2.default)();
                    (0, _diptychPopup2.default)();
                    (0, _triptychPopup2.default)();
                    (0, _triptychVidPopup2.default)();
                    (0, _scrollHandler2.default)();
                    (0, _lineChart2.default)();
                    (0, _scrollBar2.default)();
                    (0, _socialShareCS2.default)();
                    (0, _customScroll2.default)();
                    (0, _osBrowserHack2.default)();

                    // Doodle
                    (0, _doodle2.default)();
                }
            })(_jquery2.default);// Doodle

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

    }, { "./modules/autoHeight.js": 5, "./modules/beforePrintInit.js": 7, "./modules/customScroll.js": 10, "./modules/diptychPopup.js": 11, "./modules/fullpageSettings.js": 14, "./modules/hamburger.js": 16, "./modules/in-page-navigation.js": 18, "./modules/lineChart.js": 19, "./modules/loading.js": 20, "./modules/navigation.js": 21, "./modules/partnerPopup.js": 23, "./modules/scrollHandler.js": 28, "./modules/triptychPopup.js": 32, "./modules/triptychVidPopup.js": 33, "modules/accordion.js": 4, "modules/browser-detection.js": 8, "modules/carousel.js": 9, "modules/doodle.js": 12, "modules/facets-overide.js": 13, "modules/galleryWidget.js": 15, "modules/hero-animation.js": 17, "modules/osBrowserHack.js": 22, "modules/prepinputs.js": 25, "modules/qTip.js": 26, "modules/scrollBar.js": 27, "modules/socialShare.js": 29, "modules/socialShareCS.js": 30, "modules/sticky-sidebar.js": 31 }], 4: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var winWidth = $(window).width();

                // *1 Used not here to avoid facets running this code twice which causes un expected behaviour
                $('.toggle:not(".js-attached"), .c-filter--research .c-filter__title:not(".js-attached")').click(function (e) {
                    var $this = $(this);

                    e.preventDefault();

                    // Collapse
                    if ($this.next().hasClass('show')) {
                        $this.next().removeClass('show');
                        $this.removeClass('active');
                        $this.next().slideUp(350);
                    }

                    // Expand
                    else {
                        $this.parent().parent().find('li .inner, .c-filter--research .c-filter__filters').removeClass('show');
                        $('.toggle, .c-filter--research .c-filter__title').removeClass('active');
                        $this.parent().parent().find('li .inner, .c-filter--research .c-filter__filters').slideUp(350);
                        $this.addClass('active');
                        $this.next().toggleClass('show');
                        $this.next().slideToggle(350);
                    }
                }).addClass('js-attached');//*1

                if (winWidth < 768) {
                    $('.c-filter--staff .c-filter__title:not(".js-attached")').click(function (e) {
                        var $this = $(this);

                        e.preventDefault();

                        // Collapse      
                        if ($this.next().hasClass('show') && $this.hasClass('active')) {
                            $this.removeClass('active');
                            $this.next().removeClass('show');
                            $this.next().slideUp(350);
                        } else {
                            $this.parent().parent().find('.c-filter--staff .c-filter__filters').removeClass('show');
                            $('.toggle').removeClass('active');
                            $this.parent().parent().find('.c-filter--staff .c-filter__filters').slideUp(350);
                            $this.addClass('active');
                            $this.next().toggleClass('show');
                            $this.next().slideToggle(350);
                        }
                    }).addClass('js-attached');
                }
            };

    }, {}], 5: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var winWidth = $(window).width();
                var setofElements = $('.section');
                // $('.featured__with-photo--invert, .section-introducer, .series-landing-page, .process-sequence, .partners-overview, .recommended-articles, .bar-chart, .line-chart, .keypoints, .summary-triptych--video, .boundingbox-section, .turquoise--with-list, .featured-section__pattern--two');

                if (winWidth <= 991 && !setofElements.filter('fp-auto-height').length) {
                    setofElements.addClass('fp-auto-height');
                }
            };

    }, {}], 6: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            drawChart;/**
           * Bar Chart
           */function drawChart(chart, type) {
            var def_val = $(chart).attr('amount-1'); var currency = $(chart).attr('currency');
            var full_val = Number($(chart).attr('amount-2'));
            var half_val = Math.round(full_val / 2);
            var barStatus = parseInt((full_val - def_val) / def_val * 100);
            var fullText = $(chart).attr("bar-full-text");

            var anim1, anim2;
            var timer = 500;
            if (type == 'print')
                timer = 0;
            // anim1 = setTimeout(moveBar, 1000, "50%");
            anim2 = setTimeout(moveBar, timer, "100%");

            $(chart).find('.bar-status .change-amount').html(barStatus + "%" + " increase");

            function moveBar(perc) {
                var time_duration = 2000;
                if (type == 'print')
                    time_duration = 0;

                $(chart).find('.animator').animate({
                    height: perc
                },
                    {
                        duration: time_duration,
                        start: function start() { $(chart).find('.animation-bar .desc').addClass("hidden-obj"); },
                        complete: function complete() { doneAnimation(perc); }
                    });

            }

            function doneAnimation(perc) {
                // if(perc == "50%"){
                //   $('.animation-bar .desc').html('<span class="desc__amount">' + currency + half_val + '</span><span class="desc__text">' + fullText + '</span>').removeClass("hidden-obj");
                //   clearTimeout(anim1);
                // }

                // if(perc == "100%"){
                $(chart).find('.animation-bar .desc').html('<span class="desc__amount">' + currency + full_val + '</span><span class="desc__text">' + fullText + '</span>').removeClass("hidden-obj");
                $(chart).find('.bar-status').removeClass('hidden-obj');
                clearTimeout(anim2);
                // }
            }
        }

    }, {}], 7: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =






            function () {

                // Print Function
                (function () {
                    var beforePrint = function beforePrint() {

                        (0, _pieChartInit2.default)('print');


                        // Draw all the bar charts
                        $('.chart').each(function () {
                            (0, _barChart2.default)($(this), 'print');
                        });
                    };

                    if (window.matchMedia) {
                        var mediaQueryList = window.matchMedia('print');
                        mediaQueryList.addListener(function (mql) {
                            if (mql.matches) {
                                beforePrint();
                            }
                        });
                    }

                    window.onbeforeprint = beforePrint;
                })();
            }; var _barChart = require('./barChart.js'); var _barChart2 = _interopRequireDefault(_barChart); var _pieChartInit = require('./pieChartInit.js'); var _pieChartInit2 = _interopRequireDefault(_pieChartInit); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    }, { "./barChart.js": 6, "./pieChartInit.js": 24 }], 8: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); var browserDetection = function browserDetection() {
            //  ========================
            //  Browser Helper Classes
            //  ========================
            //
            // Advanced IE Detection - https://codepen.io/gapcode/pen/vEJNZN?editors=0010
            // returns version of IE or false, if browser is not Internet Explorer
            function detectIE() {
                var ua = window.navigator.userAgent;

                // Test values; Uncomment to check result …

                // IE 10
                // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

                // IE 11
                // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

                // Edge 12 (Spartan)
                // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

                // Edge 13
                // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

                var msie = ua.indexOf('MSIE ');
                if (msie > 0) {
                    // IE 10 or older => return version number
                    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
                }

                var trident = ua.indexOf('Trident/');
                if (trident > 0) {
                    // IE 11 => return version number
                    var rv = ua.indexOf('rv:');
                    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
                }

                var edge = ua.indexOf('Edge/');
                if (edge > 0) {
                    // Edge (IE 12+) => return version number
                    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
                }
                // other browser
                return false;
            }

            var version = detectIE();

            if (version === false) {
                // document.getElementById('result').innerHTML = '<s>IE/Edge</s>';
                $('html').addClass('no-ie');
            } else if (version >= 12) {
                // document.getElementById('result').innerHTML = 'Edge ' + version;
                $('html').addClass('ie ie-edge');
            } else {
                // document.getElementById('result').innerHTML = 'IE ' + version;
                $('html').addClass('ie oldie ie-v' + version);
            }
        }; exports.default =

            browserDetection;

    }, {}], 9: [function (require, module, exports) {
        (function (global) {
            /* eslint-env browser */
            'use strict'; Object.defineProperty(exports, "__esModule", { value: true });

            var _jquery = typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null; var _jquery2 = _interopRequireDefault(_jquery);
            require('vendor/jquery.slick.js'); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            var carousel = function carousel() {
                (0, _jquery2.default)('.js-carousel').slick({
                    adaptiveHeight: true,
                    dots: false,
                    centerMode: true,
                    slidesToShow: 1,
                    arrows: true,
                    centerPadding: '0px',
                    infinite: false,
                    prevArrow: '<button type="button" class="tiny">' +
                        '<i class="fa fa-chevron-left"></i></button>',
                    nextArrow: '<button type="button" class="tiny">' +
                        '<i class="fa fa-chevron-right"></i></button>'
                });

            }; exports.default =

                carousel;

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

    }, { "vendor/jquery.slick.js": 34 }], 10: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var winWidth = $(window).width();

                if (winWidth >= 992 && $('nav.header__main-nav').length) {
                    new SimpleBar($('nav.header__main-nav')[0]);
                }
            };

    }, {}], 11: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var popupLink = $('.js-sdpopup-link', '.summary-diptych.js-img-popup--dual'),
                    closeButton = $('.po__close', '.summary-diptych.js-img-popup--dual'),
                    body = $('body'),
                    hamMenuLink = $('.js-nav-toggle'),
                    header = $('.js-header');
                var winWidth = $(window).width();

                popupLink.on("click", function (e) {
                    e.preventDefault();
                    var link = $(this).attr('popupLink');
                    $('.po__popup-' + link, '.summary-diptych.js-img-popup--dual').addClass('popup-active');
                    $('.iScrollVerticalScrollbar').hide();
                    $('.fp-scroller').addClass('transform-none');
                    body.addClass('scroll-disable');
                    hamMenuLink.hide();
                    if (winWidth < 768) {
                        header.addClass('width-auto');
                    }
                });

                closeButton.on("click", function (e) {
                    e.preventDefault();
                    $('.sd__column').removeClass('popup-active');
                    $('.iScrollVerticalScrollbar').show();
                    $('.fp-scroller').removeClass('transform-none');
                    body.removeClass('scroll-disable');
                    hamMenuLink.show(300);
                    if (winWidth < 768) {
                        header.removeClass('width-auto');
                    }
                });
            };

    }, {}], 12: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var body = $('body');
                var doodle = $('.hero-doodle');
                var text = $('.hero-doodle-text');
                var illustrations = $('.hero-doodle-illustration');

                if (body.hasClass('home')) {
                    if (doodle.length > 0) {
                        text.addClass('active');
                        illustrations.first().addClass('active');
                        setInterval(nextIllustration, 5000);
                    }
                }

                function nextIllustration() {
                    if (illustrations.filter('.active').is(':last-child')) {
                        illustrations.filter('.active').removeClass('active');
                        illustrations.first().addClass('active');
                    } else {
                        illustrations.filter('.active').removeClass('active').next().addClass('active');
                    }
                }
            };

    }, {}], 13: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =


            function () {

                // Pre-filtered links - manually refreashing facet if the user comes from the menu link
                if (window.location.search.indexOf('fwp_') >= 0) {
                    FWP.autoload();
                }

                setTimeout(function () {
                    // Giving a fixed height to filters so that page doesnt jump
                    // Using a timeout to make sure facets have finished loading
                    $('.c-filter__filters').css('min-height', $('.c-filter__filters').outerHeight());

                }, 3000);

                // Mannualy resetting facets
                $('.js-clear-all').on('click', function () {
                    var facet;
                    if ($(this).attr('facet'))
                        facet = $(this).attr('facet');

                    FWP.reset(facet);
                });

                // Collpase filter if Pre-Filtered Search page link
                if (window.location.search.indexOf("filter") > 0 && getQueryVariable('filter') == 'collapse') {
                    $('.c-filter__title').trigger('click');
                }

                // Get query string by name
                function getQueryVariable(variable) {
                    var query = window.location.search.substring(1);
                    var vars = query.split('&');
                    for (var i = 0; i < vars.length; i++) {
                        var pair = vars[i].split('=');
                        if (decodeURIComponent(pair[0]) == variable) {
                            return decodeURIComponent(pair[1]);
                        }
                    }
                    console.log('Query variable %s not found', variable);
                }

                var loader_icon = $('.c-filter__icon');
                // Event that fires when facets finish loading
                $(document).on('facetwp-loaded', function () {
                    // Search Header
                    if ($('.search-header').length) {
                        $('.search-header').hide();
                        if (FWP.facets.formats.length == 1) {
                            var format_selected = FWP.facets.formats[0];
                            if ($('.search-header-' + format_selected).length > 0) {
                                $('.search-header-' + format_selected).show();
                            } else {
                                $('.search-header-generic').show();
                            }
                        } else {
                            $('.search-header-generic').show();
                        }
                    }

                    // Partners Header
                    if ($('.partners-header').length) {
                        $('.partners-header').hide();
                        if (FWP.facets.initiatives.length == 1) {
                            var format_selected = FWP.facets.initiatives[0];
                            if ($('.partners-header-' + format_selected).length > 0) {
                                $('.partners-header-' + format_selected).show();
                            } else {
                                $('.partners-header-generic').show();
                            }
                        } else {
                            $('.partners-header-generic').show();
                        }
                    }

                    // Search Page - Search Button
                    $('.js-autoload-facets').on('click', function () {
                        FWP.autoload();
                    });

                    // Partner Page
                    (0, _accordion2.default)();

                    // Implementing facets sort manually so we can use a radio button
                    // - since sort has been changed to a radio button
                    $(document).on('change', '.facetwp-sort-select-custom input', function () {
                        FWP.extras.sort = $(this).val();
                        FWP.soft_refresh = true;
                        FWP.autoload();

                    });

                    // Mannually set sort option as this doesnt happen in the default facets code
                    // - since sort has been changed to a radio button
                    $(".facetwp-sort-select-custom input[value='" + FWP.extras.sort + "']").prop("checked", true);

                    // Remove loading icon when facets finishes refresh
                    loader_icon.fadeOut();
                });

                // Event fired when facets is clicked
                $(document).on('facetwp-refresh', function () {
                    // Show loading icon
                    loader_icon.fadeIn();
                });
            }; var _accordion = require('./accordion.js'); var _accordion2 = _interopRequireDefault(_accordion); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    }, { "./accordion.js": 4 }], 14: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =





            function () {

                if ($(window).width() > 991) {
                    var scroll = true;
                } else {
                    var scroll = false;
                }

                $('#fullpage-js').fullpage({
                    easing: 'easeInOutCubic',
                    scrollingSpeed: 800,
                    easingcss3: 'ease',
                    css3: false,
                    verticalCentered: false,
                    fitToSection: false,
                    autoScrolling: false,

                    'afterLoad': function afterLoad(anchorLink, index) {
                        menuSlideHandler(index);

                        if ($('[data-anchor="slide' + index + '"]').hasClass('js-animate-donut')) {
                            (0, _pieChartInit2.default)('default');
                        }
                    }
                });


                $.fn.is_on_screen = function () {
                    var win = $(window);

                    var viewport = {
                        top: win.scrollTop(),
                        left: win.scrollLeft()
                    };

                    viewport.right = viewport.left + win.width();
                    viewport.bottom = viewport.top + win.height();

                    var bounds = this.offset();
                    bounds.right = bounds.left + this.outerWidth();
                    bounds.bottom = bounds.top + this.outerHeight();

                    return !(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom);
                };

                function isTargetVisible() {
                    var retunVal = false;
                    $('.hero').each(function () {
                        if ($(this).is_on_screen()) {
                            retunVal = true;
                        }
                    });
                    return retunVal;
                }

                function menuSlideHandler(i) {
                    var header = $('.js-header');
                    var hero = $('.hero');
                    if ($('[data-anchor="slide' + i + '"]').hasClass('hero')) {
                        header.addClass('header--full');
                    } else {
                        header.removeClass('header--full');
                    }
                }

                $(document).ready(function (e) {
                    menuSlideHandler;
                });
            }; var _pieChartInit = require('./pieChartInit.js'); var _pieChartInit2 = _interopRequireDefault(_pieChartInit); var _barChart = require('./barChart.js'); var _barChart2 = _interopRequireDefault(_barChart); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    }, { "./barChart.js": 6, "./pieChartInit.js": 24 }], 15: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =


            function () {
                // Exit if gallery is not found
                if (!$('.c-gallery').length)
                    return false;

                var popupLink = $('.js-popup-link', '.c-gallery');
                var closeButton = $('.po__close', '.c-gallery');
                var sliderContainer = $('.c-gallery__slide', '.c-gallery');
                var body = $('body');
                var hamMenuLink = $('.js-nav-toggle');
                var header = $('.js-header');
                var winWidth = $(window).width();

                popupLink.on("click", function (e) {
                    // Re initalized to make sure the correct slider opens
                    var sliderContainer = $(this).closest('.c-gallery').find('.c-gallery__slide');
                    e.preventDefault();
                    sliderContainer.addClass('popup-active');
                    body.addClass('scroll-disable');
                    hamMenuLink.hide();
                    if (winWidth < 768) {
                        header.addClass('width-auto');
                    }
                });

                closeButton.on("click", function (e) {
                    e.preventDefault();
                    sliderContainer.removeClass('popup-active');
                    $('.iScrollVerticalScrollbar').show();
                    $('.fp-scroller').removeClass('transform-none');

                    body.removeClass('scroll-disable');
                    hamMenuLink.show(300);
                    if (winWidth < 768) {
                        header.removeClass('width-auto');
                    }
                });

                $(document).on('keyup', function (evt) {
                    if (evt.keyCode == 27) {
                        sliderContainer.removeClass('popup-active');
                        body.removeClass('scroll-disable');
                        hamMenuLink.show(300);
                        if (winWidth < 768) {
                            header.removeClass('width-auto');
                        }
                    }
                });

                var thumbCont = $('#thumb-cont');
                var slideCont = $('.bxslide');
                var slideright = true;
                var showRestart;
                var count;
                var showReset = true;


                $('[id^=slider-container]').each(function () {
                    var slider = $(this);
                    var isInline = slider.closest('.c-gallery').hasClass('c-gallery-style-inline');

                    var settings = {
                        minSlides: 1,
                        infiniteLoop: false,
                        mode: 'fade',
                        controls: false,
                        slideMargin: 0,
                        pager: false,
                        adaptiveHeight: isInline ? false : true,
                        speed: 500,

                        onSliderLoad: function onSliderLoad(currentSlide) {
                            // If it's an inline slideshow, force height to be equal (equalizer)
                            if (isInline) {
                                slider.css('width', '100%');
                                slider.parent('.bx-viewport').css('display', 'flex');
                                slider.find('.slideshow-cont').css({ 'bottom': '0', 'top': '0' });
                            }
                        },

                        onSlideBefore: function onSlideBefore() {
                            var count = slider.getCurrentSlide();
                            var slides = $(".slideshow-cont")[count];
                            var firstSlide = $('.cslide');
                            var pager = count + 1;

                            gradient();

                            function gradient() {
                                var gcount = count + 4;
                                $('.transparency').remove();
                                $('[data-rel=' + gcount + ']').append("<div class='transparency'></div>");
                                // console.log(gcount)
                            }

                            thumbCont.find('.thumbslide:gt(' + count + ')').show();
                            thumbCont.find('.thumbslide:lt(' + (count + 1) + ')').hide();
                            $("li.active.current div.year").text($(slideCont[count]).data("year"));
                            $("li.active.current div.year-title").text($(slideCont[count]).data("title"));
                            if (count === endSlide) {
                                $("#restart").show();
                            } else {
                                $("#restart").hide();
                            }

                            firstSlide.html(pager);
                        }
                    };


                    slider.bxSlider(settings);

                    var slideQty = slider.getSlideCount();
                    var endSlide = slider.getSlideCount() - 1;

                    $(".title-head").find('li').each(function () {
                        var current = $(this);
                    });

                    //Get the number of the last slide
                    $('.eslide').html(slideQty);

                    slideCont.each(function (i, slide) {
                        thumbCont.append('<li class="row col1 thumbslide"id=thumb-' + i + ' data-rel="' + i + '"><div class=year>' + $(this).data("year") + '</div><div class=year-title>' + $(this).data("title") + '</div></li>');
                        thumbCont.find('.thumbslide:first').hide();
                        $('[data-rel="4"]').append("<div class='transparency'></div>");
                    });
                    thumbCont.append("<li class='row col1 thumbnail' id='restart'><h1>Restart Slideshow ></h1></li>");

                    $('#restart').click(function () {
                        slider.goToSlide(0);
                    });

                    $("li.active.current div.year").text($(slideCont[0]).data("year"));
                    $("li.active.current div.year-title").text($(slideCont[0]).data("title"));

                    thumbCont.find("li.thumbslide").click(function (e) {
                        slider.goToSlide($(this).data("rel"));
                        e.stopPropagation();
                    });

                    $('.left').click(function () {
                        var slidecurrent = slider.getCurrentSlide() - 1;
                        slider.goToPrevSlide();
                    });

                    $('.right').click(function () {
                        slider.goToNextSlide();
                    });
                });
            };

    }, {}], 16: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var headertopWrapper = $('.header__top-wrapper');
                var toggleButton = $('.js-nav-toggle');
                var headerLogo = $('.header__logo img');
                var shareHolder = $('.share-holder');
                var imagePath = $("meta[name='base_url']").attr('content') + '/wp-content/themes/mastercard-foundation/case-study/assets/img/';
                var body = $('body');
                var viewport = $(window).width();

                toggleButton.click(function (e) {
                    e.preventDefault();
                    headertopWrapper.toggleClass('active');

                    if (headertopWrapper.hasClass('active') && viewport < 992) {
                        $(".js-nav-collapse").slideDown();
                        $(".js-share-collapse").fadeIn();
                        // headerLogo.attr('src', imagePath+'mc-logo-black.svg');
                        body.addClass('scroll-disable');
                        $(".js-header").addClass("header--full-height");
                    } else if (viewport < 992) {
                        $(".js-nav-collapse").slideUp();
                        $(".js-share-collapse").slideUp();
                        // headerLogo.attr('src', imagePath+'mc-logo.svg');
                        body.removeClass('scroll-disable');
                        $(".js-header").removeClass("header--full-height");
                    }
                });

                if (viewport < 992) {
                    headerLogo.attr('src', imagePath + 'mc-logo-black.svg');

                    $('.header__main-nav a').click(function () {
                        headertopWrapper.removeClass('active');
                        $(".js-nav-collapse").slideUp();
                        $(".js-share-collapse").fadeOut();
                        // headerLogo.attr('src', imagePath+'mc-logo.svg');
                        body.removeClass('scroll-disable');
                        $(".js-header").removeClass("header--full-height");
                    });

                    var lastScrollTop = 0;
                    var navandBanner = $('.js-header').innerHeight();

                    // console.log(bannerHeight);
                    $(window).scroll(function (event) {
                        var st = $(this).scrollTop();
                        if (st > lastScrollTop) {
                            // Scroll Down
                            if (st > 80) {
                                $('.js-header').addClass('scrolling');
                            }
                        } else {
                            // Scroll Up
                            $('.js-header').removeClass('scrolling');
                        }

                        // Top most of the page
                        if (st == 0) {
                            $('.js-header').removeClass('scrolling');
                        }
                        lastScrollTop = st;
                    });
                }
            };

    }, {}], 17: [function (require, module, exports) {
        /* eslint-env browser */
        'use strict';

        // import SnapSVG for webpack builds: https://www.npmjs.com/package/snapsvg-cjs
        // related to: https://github.com/adobe-webplatform/Snap.svg/issues/341#issuecomment-244818538
        Object.defineProperty(exports, "__esModule", { value: true }); var _snapsvgCjs = require('snapsvg-cjs'); var _snapsvgCjs2 = _interopRequireDefault(_snapsvgCjs);
        var _jqueryWaypoints = require('vendor/jquery.waypoints.js'); var _jqueryWaypoints2 = _interopRequireDefault(_jqueryWaypoints); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

        var heroAnimation = function heroAnimation() {
            // Get svg element
            var hero = $(".js-animated-hero");
            var heroSVG = $(".hero-svg-border");
            var s = (0, _snapsvgCjs2.default)(heroSVG);
            var heroHeight = hero.height();

            // Get the paths of the two shapes to be animated
            if ($(".hero-svg-border").length) {
                var baseCurve = _snapsvgCjs2.default.select('.curve-base');
                var inverseCurve = _snapsvgCjs2.default.select('.curve-inverse');
                var baseCurvePoints = baseCurve.node.getAttribute('d');
                var inverseCurvePoints = inverseCurve.node.getAttribute('d');
            }

            // animation functions
            // animate the d(path description), set duration and easing function of animation
            var toInverseCurve = function toInverseCurve() {
                inverseCurve.animate({ d: baseCurvePoints }, 500, mina.ease);
            };
            var toBaseCurve = function toBaseCurve() {
                // animate the d(path description), set duration and easing function of animation
                inverseCurve.animate({ d: inverseCurvePoints }, 500, mina.ease);
            };

            var lastScrollTop = 0;
            $(window).scroll(function (event) {
                var currentScrollTop = $(this).scrollTop(),
                    wpTrigger = $('body').height() / 10;

                if (currentScrollTop > lastScrollTop && currentScrollTop > wpTrigger) {
                    $('.navigation-container').addClass('snapup');
                } else if (currentScrollTop < lastScrollTop && currentScrollTop > wpTrigger) {
                    $('.navigation-container').removeClass('snapup');
                }
                lastScrollTop = currentScrollTop;
            });

            $('.js-mobile-nav__toggle').on('click', function () {
                $('.js-nav--mobile').toggleClass('show');

                if ($('.js-nav--mobile').hasClass('show')) {
                    $('.mobile-nav-drawer').slideDown();
                } else {
                    $('.mobile-nav-drawer').slideUp();
                }
            });


            // animate once user has scrolled 10% of the page, revert when they scroll back up
            var waypoints = $('.home').waypoint(function (direction) {
                if (direction === "down") {
                    toInverseCurve();
                } else {
                    toBaseCurve();
                }
            }, {
                offset: '-10%'
            });


            var navigationWaypoint = $('body').waypoint(function (direction) {
                if (direction === "down") {
                    $('.navigation-container').addClass('shrink');
                } else {
                    $('.navigation-container').removeClass('shrink');
                }
            }, {
                offset: '-10%'
            });


            var navSnapWaypoint = $('body').waypoint(function (direction) {
                if (direction === "down") {
                    $('.navigation-container').addClass('snapup');
                } else {
                    $('.navigation-container').removeClass('snapup');
                }
            }, {
                offset: '-20%'
            });


            // Remove open state on page load
            $('.js-nav__item').removeClass('show');

            $('.js-nav__item').on('click', function () {
                var $this = $(this);
                console.log('foo');

                if ($this.hasClass('show')) {
                    $this.find('.js-nav__children-container').slideUp();
                    // $this.find('.js-nav__item-link-state').css({'transform' : 'rotate(-45deg)'});
                    $this.removeClass('show');
                } else {
                    $this.find('.js-nav__children-container').slideDown();
                    // $this.find('.js-nav__item-link-state').css({'transform' : 'rotate(45deg)'});
                    $this.addClass('show');
                }
            });

            // Add a class on click of search field
            $('.nav__search-field').on('focus', function () {
                $(this).parent().addClass('active');
            }).on('blur', function () {
                if ($(this).val().length <= 0) {
                    $(this).parent().removeClass('active');
                }
            });
        }; exports.default =

            heroAnimation;

    }, { "snapsvg-cjs": 2, "vendor/jquery.waypoints.js": 35 }], 18: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var winWidth = $(window).width();

                if (winWidth >= 768) {
                    $(window).scroll(function () {
                        var sidebar = $('.c-in-page-navigation'),
                            sidebarHeight = sidebar.outerHeight(),
                            contentHeight = $('.page-content').outerHeight(),
                            sidebarBottomPos = contentHeight - sidebarHeight;

                        if ($(window).scrollTop() >= sidebarBottomPos) {
                            sidebar.addClass('c-in-page-navigation--bottom').css('bottom', contentHeight * -1);
                        } else {
                            sidebar.removeClass('c-in-page-navigation--bottom').css('bottom', '');
                        }
                    });
                }

            };

    }, {}], 19: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                // Exit if not line chart is found
                if (!$('.section').hasClass('line-chart'))
                    return false;

                if ($(window).width() > 768) {
                    var svgWidth = 800;
                    var svgHeight = 380;
                    var width = 700;
                    var height = 100;
                    var cicleSize = 7;
                    var titleFontsize = "28px";
                    var textFontsize = "15px";
                    var startAmountOffset = 30;
                    var startDateOffset = 50;
                    var endAmountOffset = -15;
                    var endDateOffset = -40;
                } else {
                    var svgWidth = 280;
                    var svgHeight = 300;
                    var width = 250;
                    var height = 150;
                    var cicleSize = 4;
                    var titleFontsize = "19px";
                    var textFontsize = "13px";
                    var startAmountOffset = 25;
                    var startDateOffset = 45;
                    var endAmountOffset = -15;
                    var endDateOffset = -35;
                }

                var w = width;
                var h = height;
                var chart = $('.chart-props');
                var amount1_val = chart.attr('amount-1');
                var amount2_val = chart.attr('amount-2');
                var date1_val = chart.attr('date-1');
                var date2_val = chart.attr('date-2');

                var svg = d3.select("#line").
                    append("svg").
                    attr("width", svgWidth).
                    attr("height", svgHeight).
                    attr("id", "visualization").
                    attr("xmlns", "http://www.w3.org/2000/svg");

                var data = [45, 50, 60, 60, 70, 80];

                var max = Math.max.apply(null, data);
                var min = Math.min.apply(null, data);
                var xmargin = (svgWidth - w) / 2;
                var ymargin = (svgHeight - h) / 2;

                var x = d3.scale.linear().domain([0, data.length - 1]).range([xmargin, svgWidth - xmargin]);
                var y = d3.scale.linear().domain([0, max - min]).range([ymargin, svgHeight - ymargin]);

                var line = d3.svg.line().
                    x(function (d, i) { return x(i); }).
                    y(function (d) { return y(max - d); });


                var path = svg.append("path").
                    attr("d", line(data)).
                    attr("stroke", "#35a287").
                    attr("stroke-width", "4").
                    attr("fill", "none");

                var totalLength = path.node().getTotalLength();

                path.
                    attr("stroke-dasharray", totalLength + " " + totalLength).
                    attr("stroke-dashoffset", totalLength).
                    transition().
                    duration(800).
                    ease("linear").
                    attr("stroke-dashoffset", 0);

                var startPoint = svg.append("circle").
                    attr("cx", function () { return x(0); }).
                    attr("cy", function () { return y(max - data[0]); }).
                    attr("r", function () { return cicleSize; }).
                    style("fill", function () { return "#35a287 "; });

                var start = svg.append("text").
                    attr("y", function () { return y(max - data[0]) + startAmountOffset; }).
                    attr("x", function () { return x(0); }).
                    attr('text-anchor', 'start').
                    attr("class", "start").
                    style("font-size", titleFontsize).
                    text(amount1_val);

                var startText = svg.append("text").
                    attr("y", function () { return y(max - data[0]) + startDateOffset; }).
                    attr("x", function () { return x(0); }).
                    attr('text-anchor', 'start').
                    attr("class", "start-label").
                    style("font-size", textFontsize).
                    text(date1_val);

                var endPoint = svg.append("circle").
                    attr("cx", function () { return x(data.length - 1); }).
                    attr("cy", function () { return y(max - data[data.length - 1]); }).
                    attr("r", function () { return cicleSize; }).
                    style("fill", function () { return "#35a287 "; });

                var end = svg.append("text").
                    attr("y", function () { return y(max - data[data.length - 1]) + endAmountOffset; }).
                    attr("x", function () { return x(data.length - 1); }).
                    attr('text-anchor', 'end').
                    attr("class", "end").
                    style("font-size", titleFontsize).
                    text(amount2_val).transition().duration(800);

                var endText = svg.append("text").
                    attr("y", function () { return y(max - data[data.length - 1]) + endDateOffset; }).
                    attr("x", function () { return x(data.length - 1); }).
                    attr('text-anchor', 'end').
                    attr("class", "end-label").
                    style("font-size", textFontsize).
                    text(date2_val).transition().duration(800);
            };

    }, {}], 20: [function (require, module, exports) {
        "use strict"; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                $(window).on('load', function () {
                    // Animate loader off screen
                    $(".o-loading-container").fadeOut("slow");
                });
            };

    }, {}], 21: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var fullHeader = $('.js-header');
                var floatingLogo = $('.floating-logo');
                var viewport = $(window).width();
                var body = $('body');

                if (viewport >= 992) {
                    floatingLogo.mouseenter(function () {
                        fullHeader.addClass('header-active');
                    });

                    floatingLogo.mouseleave(function () {
                        fullHeader.removeClass('header-active');
                        body.removeClass('scroll-disable');
                    });

                    fullHeader.mouseenter(function () {
                        body.addClass('scroll-disable');
                        $.fn.fullpage.setAllowScrolling(false);
                    });

                    fullHeader.mouseleave(function () {
                        body.removeClass('scroll-disable');
                        $.fn.fullpage.setAllowScrolling(true);
                    });
                }

                // Scroll to section if the anchor is bookmarked
                // if(window.location.hash) {
                //   scrollToSection(window.location.hash.substr(1));
                // }


                // Scroll to section when menu is clicked
                // $('a[href^="#"]').on('click',function (e) {
                //   e.preventDefault();
                //   scrollToSection(this.hash.substr(1));
                // });

                // function scrollToSection(target){
                //   var $target = $("[data-anchor='"+target+"']");

                //   $('html, body').stop().animate({
                //       'scrollTop': $target.offset().top
                //   }, 600, 'swing');
                // }
            };

    }, {}], 22: [function (require, module, exports) {
        "use strict"; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                (function () {
                    var uaMatch = "",
                        prefix = "";

                    if (navigator.userAgent.match(/Windows/)) {

                        // browser
                        if (navigator.userAgent.match(/Chrome/)) {
                            uaMatch = " Chrome/";
                            prefix = "x-chrome";
                        } else if (navigator.userAgent.match(/Firefox/)) {
                            uaMatch = " Firefox/";
                            prefix = "x-firefox";
                        }

                        // add result prefix as browser class
                        if (prefix) {
                            $("html").addClass(prefix);
                        }
                    }
                })();
            };

    }, {}], 23: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var popupLink = $('.js-popup-link', '.partners-overview'),
                    closeButton = $('.po__close', '.partners-overview'),
                    body = $('body'),
                    hamMenuLink = $('.js-nav-toggle'),
                    header = $('.js-header'),
                    winWidth = $(window).width();

                popupLink.on("click", function (e) {
                    e.preventDefault();
                    var link = $(this).attr('popupLink');
                    $('.po__popup-' + link, '.partners-overview').addClass('popup-active');
                    body.addClass('scroll-disable');
                });

                closeButton.on("click", function (e) {
                    e.preventDefault();
                    $('.po__popup', '.partners-overview').removeClass('popup-active');
                    body.removeClass('scroll-disable');
                });
            };

    }, {}], 24: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function (type) {
                if ($(window).width() > 991) {
                    var width = 365;
                    var lineWidth = 50;
                } else {
                    var width = 250;
                    var lineWidth = 30;
                }

                var anim = 1000;
                if (type == 'print')
                    anim = 100;

                $('.js-chart').easyPieChart({
                    size: width,
                    lineWidth: lineWidth,
                    trackColor: '#e3e1dd',
                    barColor: '#2ea388',
                    scaleColor: false,
                    animate: anim,
                    lineCap: 'square',
                    onStep: function onStep(from, to, percent) {
                        $(this.el).find('.percent').text(Math.round(percent));
                    }
                });

            };

    }, {}], 25: [function (require, module, exports) {
        (function (global) {
            /* eslint-env browser */
            'use strict'; Object.defineProperty(exports, "__esModule", { value: true });

            var _jquery = typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null; var _jquery2 = _interopRequireDefault(_jquery); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            var prepinputs = function prepinputs() {
                (0, _jquery2.default)('input, textarea').placeholder().
                    filter('[type="text"], [type="email"], [type="tel"], [type="password"]').
                    addClass('text').end().
                    filter('[type="checkbox"]').addClass('checkbox').end().
                    filter('[type="radio"]').addClass('radiobutton').end().
                    filter('[type="submit"]').addClass('submit').end().
                    filter('[type="image"]').addClass('buttonImage');
            }; exports.default =

                prepinputs;

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

    }, {}], 26: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var _tip;
                if ($(window).width() < 1024) {
                    var pointerPosition = 'center center';
                    var tooltipPosition = 'center center';
                    var pointerOffset = 0;
                    var adjustY = 0;
                    var corner = false;
                    var target = $(window);
                } else {
                    var pointerPosition = 'center left';
                    var tooltipPosition = 'bottom right';
                    var pointerOffset = -15;
                    var adjustY = -50;
                    var corner = true;
                    var target = false;
                }

                $('[data-tooltip]').qtip({
                    content: {
                        attr: 'data-tooltip',
                        button: 'x'
                    },

                    position: {
                        my: pointerPosition,
                        at: tooltipPosition,
                        target: target,
                        // viewport: $(window),
                        adjust: {
                            resize: true,
                            method: 'shift shift',
                            x: 0,
                            y: adjustY
                        }
                    },


                    style: {
                        classes: 'tooltip-viewer',
                        tip: (_tip = {
                            corner: corner
                        }, _defineProperty(_tip, 'corner',
                            pointerPosition), _defineProperty(_tip, 'mimic',
                                'center top'), _defineProperty(_tip, 'border',
                                    1), _defineProperty(_tip, 'width',
                                        40), _defineProperty(_tip, 'height',
                                            40), _defineProperty(_tip, 'offset',
                                                pointerOffset), _tip)
                    },


                    show: {
                        event: 'click',
                        effect: function effect() {
                            $(this).fadeTo(500, 1);
                        }
                    },

                    hide: {
                        event: false,
                        effect: function effect() {
                            $(this).fadeTo(500, 0);
                        }
                    }
                });



                // $('[class*="tooltip"]').click(function (){
                //   $(this).removeClass('active');
                //   $(this).addClass('active');
                // });
            }; function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }/**
                                                                                                                                                                                                             * qTip
                                                                                                                                                                                                             */

    }, {}], 27: [function (require, module, exports) {
        (function (global) {
            'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) { return typeof obj === "undefined" ? "undefined" : _typeof2(obj); } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj); };/**
                                                                                                                                                                                                                                                                                                                                                     * Accordion
                                                                                                                                                                                                                                                                                                                                                     */exports.default =

                function () {
                    ; (function (factory) {
                        if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
                            factory(typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null, window, document);
                        } else {
                            factory(window.jQuery, window, document);
                        }
                    })(function ($, window, document, undefined) {
                        /**
                                                                         * Calculate scrollbar width
                                                                         *
                                                                         * Called only once as a constant variable: we assume that scrollbar width never change
                                                                         *
                                                                         * Original function by Jonathan Sharp:
                                                                         * http://jdsharp.us/jQuery/minute/calculate-scrollbar-width.php
                                                                         */
                        var SCROLLBAR_WIDTH;

                        function scrollbarWidth() {
                            // Append a temporary scrolling element to the DOM, then measure
                            // the difference between its outer and inner elements.
                            var tempEl = $('<div class="scrollbar-width-tester" style="width:50px;height:50px;overflow-y:scroll;top:-200px;left:-200px;"><div style="height:100px;"></div>'),
                                width = 0,
                                widthMinusScrollbars = 0;

                            $('body').append(tempEl);

                            width = $(tempEl).innerWidth(),
                                widthMinusScrollbars = $('div', tempEl).innerWidth();

                            tempEl.remove();

                            return width - widthMinusScrollbars;
                        }

                        var IS_WEBKIT = 'WebkitAppearance' in document.documentElement.style;

                        // SimpleBar Constructor
                        function SimpleBar(element, options) {
                            this.el = element,
                                this.$el = $(element),
                                this.$track,
                                this.$scrollbar,
                                this.dragOffset,
                                this.flashTimeout,
                                this.$contentEl = this.$el,
                                this.$scrollContentEl = this.$el,
                                this.scrollDirection = 'vert',
                                this.scrollOffsetAttr = 'scrollTop',
                                this.sizeAttr = 'height',
                                this.scrollSizeAttr = 'scrollHeight',
                                this.offsetAttr = 'top';

                            this.options = $.extend({}, SimpleBar.DEFAULTS, options);
                            this.theme = this.options.css;

                            this.init();
                        }

                        SimpleBar.DEFAULTS = {
                            wrapContent: true,
                            autoHide: true,
                            css: {
                                container: 'simplebar',
                                content: 'simplebar-content',
                                scrollContent: 'simplebar-scroll-content',
                                scrollbar: 'simplebar-scrollbar',
                                scrollbarTrack: 'simplebar-track'
                            }
                        };



                        SimpleBar.prototype.init = function () {
                            // Measure scrollbar width
                            if (typeof SCROLLBAR_WIDTH === 'undefined') {
                                SCROLLBAR_WIDTH = scrollbarWidth();
                            }

                            // If scrollbar is a floating scrollbar, disable the plugin
                            if (SCROLLBAR_WIDTH === 0) {
                                this.$el.css('overflow', 'auto');

                                return;
                            }

                            if (this.$el.data('simplebar-direction') === 'horizontal' || this.$el.hasClass(this.theme.container + ' horizontal')) {
                                this.scrollDirection = 'horiz';
                                this.scrollOffsetAttr = 'scrollLeft';
                                this.sizeAttr = 'width';
                                this.scrollSizeAttr = 'scrollWidth';
                                this.offsetAttr = 'left';
                            }

                            if (this.options.wrapContent) {
                                this.$el.wrapInner('<div class="' + this.theme.scrollContent + '"><div class="' + this.theme.content + '"></div></div>');
                            }

                            this.$contentEl = this.$el.find('.' + this.theme.content);

                            this.$el.prepend('<div class="' + this.theme.scrollbarTrack + '"><div class="' + this.theme.scrollbar + '"></div></div>');
                            this.$track = this.$el.find('.' + this.theme.scrollbarTrack);
                            this.$scrollbar = this.$el.find('.' + this.theme.scrollbar);

                            this.$scrollContentEl = this.$el.find('.' + this.theme.scrollContent);

                            this.resizeScrollContent();

                            if (this.options.autoHide) {
                                this.$el.on('mouseenter', $.proxy(this.flashScrollbar, this));
                            }

                            this.$scrollbar.on('mousedown', $.proxy(this.startDrag, this));
                            this.$scrollContentEl.on('scroll', $.proxy(this.startScroll, this));

                            this.resizeScrollbar();

                            if (!this.options.autoHide) {
                                this.showScrollbar();
                            }
                        };


                        /**
                                * Start scrollbar handle drag
                                */
                        SimpleBar.prototype.startDrag = function (e) {
                            // Preventing the event's default action stops text being
                            // selectable during the drag.
                            e.preventDefault();

                            // Measure how far the user's mouse is from the top of the scrollbar drag handle.
                            var eventOffset = e.pageY;
                            if (this.scrollDirection === 'horiz') {
                                eventOffset = e.pageX;
                            }
                            this.dragOffset = eventOffset - this.$scrollbar.offset()[this.offsetAttr];

                            $(document).on('mousemove', $.proxy(this.drag, this));
                            $(document).on('mouseup', $.proxy(this.endDrag, this));
                        };


                        /**
                                * Drag scrollbar handle
                                */
                        SimpleBar.prototype.drag = function (e) {
                            e.preventDefault();

                            // Calculate how far the user's mouse is from the top/left of the scrollbar (minus the dragOffset).
                            var eventOffset = e.pageY,
                                dragPos = null,
                                dragPerc = null,
                                scrollPos = null;

                            if (this.scrollDirection === 'horiz') {
                                eventOffset = e.pageX;
                            }

                            dragPos = eventOffset - this.$track.offset()[this.offsetAttr] - this.dragOffset;
                            // Convert the mouse position into a percentage of the scrollbar height/width.
                            dragPerc = dragPos / this.$track[this.sizeAttr]();
                            // Scroll the content by the same percentage.
                            scrollPos = dragPerc * this.$contentEl[0][this.scrollSizeAttr];

                            this.$scrollContentEl[this.scrollOffsetAttr](scrollPos);
                        };


                        /**
                                * End scroll handle drag
                                */
                        SimpleBar.prototype.endDrag = function () {
                            $(document).off('mousemove', this.drag);
                            $(document).off('mouseup', this.endDrag);
                        };


                        /**
                                * Resize scrollbar
                                */
                        SimpleBar.prototype.resizeScrollbar = function () {
                            if (SCROLLBAR_WIDTH === 0) {
                                return;
                            }

                            var contentSize = this.$contentEl[0][this.scrollSizeAttr],
                                scrollOffset = this.$scrollContentEl[this.scrollOffsetAttr](),// Either scrollTop() or scrollLeft().
                                scrollbarSize = this.$track[this.sizeAttr](),
                                scrollbarRatio = scrollbarSize / contentSize,
                                // Calculate new height/position of drag handle.
                                // Offset of 2px allows for a small top/bottom or left/right margin around handle.
                                handleOffset = Math.round(scrollbarRatio * scrollOffset),
                                handleSize = Math.floor(scrollbarRatio * scrollbarSize);


                            if (scrollbarSize < contentSize) {
                                if (this.scrollDirection === 'vert') {
                                    this.$scrollbar.css({ 'top': handleOffset, 'height': handleSize });
                                } else {
                                    this.$scrollbar.css({ 'left': handleOffset, 'width': handleSize });
                                }
                                this.$track.show();
                            } else {
                                this.$track.hide();
                            }
                        };


                        /**
                                * On scroll event handling
                                */
                        SimpleBar.prototype.startScroll = function (e) {
                            // Simulate event bubbling to root element
                            this.$el.trigger(e);

                            this.flashScrollbar();
                        };


                        /**
                                * Flash scrollbar visibility
                                */
                        SimpleBar.prototype.flashScrollbar = function () {
                            this.resizeScrollbar();
                            this.showScrollbar();
                        };


                        /**
                                * Show scrollbar
                                */
                        SimpleBar.prototype.showScrollbar = function () {
                            this.$scrollbar.addClass('visible');

                            if (!this.options.autoHide) {
                                return;
                            }
                            if (typeof this.flashTimeout === 'number') {
                                window.clearTimeout(this.flashTimeout);
                            }

                            this.flashTimeout = window.setTimeout($.proxy(this.hideScrollbar, this), 1000);
                        };


                        /**
                                * Hide Scrollbar
                                */
                        SimpleBar.prototype.hideScrollbar = function () {
                            this.$scrollbar.removeClass('visible');
                            if (typeof this.flashTimeout === 'number') {
                                window.clearTimeout(this.flashTimeout);
                            }
                        };


                        /**
                                * Resize content element
                                */
                        SimpleBar.prototype.resizeScrollContent = function () {
                            if (IS_WEBKIT) {
                                return;
                            }

                            if (this.scrollDirection === 'vert') {
                                this.$scrollContentEl.width(this.$el.width() + SCROLLBAR_WIDTH);
                                this.$scrollContentEl.height(this.$el.height());
                            } else {
                                this.$scrollContentEl.width(this.$el.width());
                                this.$scrollContentEl.height(this.$el.height() + SCROLLBAR_WIDTH);
                            }
                        };


                        /**
                                * Recalculate scrollbar
                                */
                        SimpleBar.prototype.recalculate = function () {
                            this.resizeScrollContent();
                            this.resizeScrollbar();
                        };


                        /**
                                * Getter for original scrolling element
                                */
                        SimpleBar.prototype.getScrollElement = function () {
                            return this.$scrollContentEl;
                        };


                        /**
                                * Getter for content element
                                */
                        SimpleBar.prototype.getContentElement = function () {
                            return this.$contentEl;
                        };


                        /**
                                * Data API
                                */
                        $(window).on('load', function () {
                            $('[data-simplebar-direction]').each(function () {
                                $(this).simplebar();
                            });
                        });


                        /**
                                 * Plugin definition
                                 */
                        var old = $.fn.simplebar;

                        $.fn.simplebar = function (options) {
                            var args = arguments,
                                returns;

                            // If the first parameter is an object (options), or was omitted,
                            // instantiate a new instance of the plugin.
                            if (typeof options === 'undefined' || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
                                return this.each(function () {
                                    // Only allow the plugin to be instantiated once,
                                    // so we check that the element has no plugin instantiation yet
                                    if (!$.data(this, 'simplebar')) { $.data(this, 'simplebar', new SimpleBar(this, options)); }
                                });

                                // If the first parameter is a string
                                // treat this as a call to a public method.
                            } else if (typeof options === 'string') {
                                this.each(function () {
                                    var instance = $.data(this, 'simplebar');

                                    // Tests that there's already a plugin-instance
                                    // and checks that the requested public method exists
                                    if (instance instanceof SimpleBar && typeof instance[options] === 'function') {

                                        // Call the method of our plugin instance,
                                        // and pass it the supplied arguments.
                                        returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                                    }

                                    // Allow instances to be destroyed via the 'destroy' method
                                    if (options === 'destroy') {
                                        $.data(this, 'simplebar', null);
                                    }
                                });

                                // If the earlier cached method
                                // gives a value back return the value,
                                // otherwise return this to preserve chainability.
                                return returns !== undefined ? returns : this;
                            }
                        };

                        $.fn.simplebar.Constructor = SimpleBar;


                        /**
                                                                     * No conflict
                                                                     */
                        $.fn.simplebar.noConflict = function () {
                            $.fn.simplebar = old;
                            return this;
                        };

                    });

                    $('.simplebar').simplebar();
                };

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

    }, {}], 28: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =





            function () {
                $(window).on('scroll', function () {
                    var chartSlide = $('.section.bar-chart.active');
                    if ($(chartSlide).hasClass('active') && !$(chartSlide).hasClass('doneAnimation')) {
                        (0, _barChart2.default)($(chartSlide).find('.chart'), 'default');
                        $(chartSlide).addClass('doneAnimation');
                    }
                });
            }; var _barChart = require('./barChart.js'); var _barChart2 = _interopRequireDefault(_barChart); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    }, { "./barChart.js": 6 }], 29: [function (require, module, exports) {
        (function (global) {
            /* eslint-env browser */
            'use strict'; Object.defineProperty(exports, "__esModule", { value: true });

            var _jquery = typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null; var _jquery2 = _interopRequireDefault(_jquery); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            var socialShare = function socialShare(fbId) {
                var $body = (0, _jquery2.default)('body');

                // Facebook sharing with the SDK
                _jquery2.default.getScript('//connect.facebook.net/en_US/sdk.js').done(function () {
                    $body.on('click.sharer-fb', '.sharer-fb', function (e) {
                        var $link = (0, _jquery2.default)(e.currentTarget);
                        var options = {
                            method: 'feed',
                            display: 'popup'
                        };

                        var newUrl = $link.data('redirect-to') ?
                            $link.data('redirect-to') : null;

                        e.preventDefault();

                        window.FB.init({
                            appId: fbId,
                            xfbml: false,
                            version: 'v2.0',
                            status: false,
                            cookie: true
                        });


                        if ($link.data('title')) {
                            options.name = $link.data('title');
                        }

                        if ($link.data('url')) {
                            options.link = $link.data('url');
                        }

                        if ($link.data('picture')) {
                            options.picture = $link.data('picture');
                        }

                        if ($link.data('description')) {
                            options.description = $link.data('description');
                        }

                        window.FB.ui(options, function (response) {
                            if (newUrl) {
                                window.location.href = newUrl;
                            }
                        });
                    });
                });

                // Twitter sharing
                $body.on('click.sharer-tw', '.sharer-tw', function (e) {
                    var $link = (0, _jquery2.default)(e.currentTarget);
                    var url = $link.data('url');
                    var text = $link.data('description');
                    var via = $link.data('source');
                    var twitterURL = 'https://twitter.com/share?url=' + encodeURIComponent(url);

                    e.preventDefault();

                    if (text) {
                        twitterURL += '&text=' + encodeURIComponent(text);
                    }
                    if (via) {
                        twitterURL += '&via=' + encodeURIComponent(via);
                    }
                    window.open(twitterURL, 'tweet',
                        'width=500,height=384,menubar=no,status=no,toolbar=no');
                });

                // LinkedIn sharing
                $body.on('click.sharer-li', '.sharer-li', function (e) {
                    var $link = (0, _jquery2.default)(e.target);
                    var url = $link.data('url');
                    var title = $link.data('title');
                    var summary = $link.data('description');
                    var source = $link.data('source');
                    var linkedinURL = 'https://www.linkedin.com/shareArticle?mini=true&url=' +
                        encodeURIComponent(url);

                    e.preventDefault();

                    if (title) {
                        linkedinURL += '&title=' + encodeURIComponent(title);
                    } else {
                        linkedinURL += '&title=';
                    }

                    if (summary) {
                        linkedinURL += '&summary=' +
                            encodeURIComponent(summary.substring(0, 256));
                    }

                    if (source) {
                        linkedinURL += '&source=' + encodeURIComponent(source);
                    }

                    window.open(linkedinURL, 'linkedin',
                        'width=520,height=570,menubar=no,status=no,toolbar=no');
                });
            }; exports.default =

                socialShare;

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

    }, {}], 30: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                $('#shareBtn').on('click', function () {
                    FB.ui({
                        display: 'popup',
                        method: 'share',
                        href: window.location.href
                    },
                        function (response) { });
                });
            };

    }, {}], 31: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =






            function () {
                // Elements
                var $sticky = $('.c-sidebar');
                var $stickyStopperBottom = $('.sticky-stopper-bottom');
                var $stickyStopperTop = $('.sticky-stopper-top');
                var $header = $('.navigation-container');
                var $section = $('section');
                var $content = $('#content');

                // !! to return a bool
                if (!!$sticky.offset() && $(window).width() >= 767) {






























                    // Setting the sidebar position depending 
                    // on where the user has scrolled to in the page
                    var setInPageNavPosition = function setInPageNavPosition() {
                        var windowTop = $(window).scrollTop();// returns scroll position from top, changes when the user scrolls
                        var stickyStopperBottomScrollPosition = $stickyStopperBottom.offset().top - windowTop;//Returns position of the element relative to the scroll

                        if (stickyStopperBottomScrollPosition < headerAndSideBarHeight) {//User is at the bottom of the page
                            $sticky.css({ position: 'absolute', top: stopPoint });
                        } else if (windowTop > startPoint) {// user has passed the hero and is in the center
                            $sticky.css({ position: 'fixed', top: headerSize });
                        } else {// User is at the top of the page
                            $sticky.css({ position: 'absolute', top: startPoint });
                        }
                    };// make sure ".sticky" element exists
                    // Heights and positions 
                    var stickySidebarHeight = $sticky.innerHeight();// navbar height
                    var headerSize = $header.height() + 10; var stickyStopperTopHeight = $stickyStopperTop.length ? $stickyStopperTop.outerHeight() : 0; var componentsMargin = $section.length ? parseInt($section.css('margin-top')) : 45; var generalSidebarPaddingTop = parseInt($sticky.css('padding-top')); var stickyStopperBottomPosition = $stickyStopperBottom.offset().top; var contentHeight = $content.height();// Calculations
                    var headerAndSideBarHeight = stickySidebarHeight + headerSize; var startPoint = stickyStopperTopHeight + componentsMargin - generalSidebarPaddingTop;// where the sidebar starts to become fixed
                    // Setting content height when there are no components
                    var minimumPageHeight = stickySidebarHeight + startPoint; $content.css('min-height', minimumPageHeight); contentHeight = $content.height(); var stopPoint = contentHeight - stickySidebarHeight + generalSidebarPaddingTop;// where the sidebar stops becoming fixed    
                    // Setting sidebar position at page load and then showing it
                    setInPageNavPosition(); $sticky.show(); $(window).scroll(function () {// scroll event
                        setInPageNavPosition();
                    });
                } $(window).resize(function () {// scroll event
                    if ($(window).width() >= 786) { $sticky.show(); $content.css('min-height', minimumPageHeight); } else {
                        $sticky.hide(); $content.css('min-height', '');
                    }
                });
            };

    }, {}], 32: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var popupLink = $('.js-popup-link', '.summary-triptych.js-img-popup--triple'),
                    closeButton = $('.po__close', '.summary-triptych.js-img-popup--triple'),
                    body = $('body'),
                    hamMenuLink = $('.js-nav-toggle'),
                    header = $('.js-header');
                var winWidth = $(window).width();

                popupLink.on("click", function (e) {
                    e.preventDefault();
                    var link = $(this).attr('popupLink');
                    $('.po__popup-' + link, '.summary-triptych.js-img-popup--triple').addClass('popup-active');
                    body.addClass('scroll-disable');
                    hamMenuLink.hide();
                    if (winWidth < 768) {
                        header.addClass('width-auto');
                    }
                });

                closeButton.on("click", function (e) {
                    e.preventDefault();
                    $('.sd__column').removeClass('popup-active');
                    body.removeClass('scroll-disable');
                    hamMenuLink.show(300);
                    if (winWidth < 768) {
                        header.removeClass('width-auto');
                    }
                });
            };

    }, {}], 33: [function (require, module, exports) {
        'use strict'; Object.defineProperty(exports, "__esModule", { value: true }); exports.default =



            function () {
                var popupLink = $('.js-stvpopup-link', '.summary-triptych--video.js-vid-popup--triple'),
                    closeButton = $('.po__close', '.summary-triptych--video.js-vid-popup--triple'),
                    body = $('body'),
                    hamMenuLink = $('.js-nav-toggle'),
                    header = $('.js-header');

                // Get youtube video ID function
                function getId(url) {
                    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                    var match = url.match(regExp);

                    if (match && match[2].length == 11) {
                        return match[2];
                    } else {
                        return 'error';
                    }
                }

                // The first argument of YT.Player is an HTML element ID. YouTube API will replace my <div id="triptych__video"> tag with an iframe containing the youtube video.
                var players = new Array();
                var fullWidthplayer;
                var nowPlaying;
                window.onYouTubeIframeAPIReady = function () {

                    $('.triptych__video').each(function (i, e) {
                        var VideoURL = $(e).attr('video-url');
                        var uniqueVid = $(this).attr('popupLink');
                        // Get youtube video ID from the URL
                        var videoId = getId(VideoURL);


                        players['player_' + uniqueVid] = new YT.Player($('.triptych__video')[i], {
                            height: 320,
                            width: 400,
                            videoId: videoId,
                            events: {
                                'onReady': onPlayerReady
                            }
                        });


                    });

                    if ($('.js-hero__video').length == 0)
                        return false;

                    var heroVideoURL = $('.js-hero__video').attr('video-url');
                    var heroVideoId = getId(heroVideoURL);
                    fullWidthplayer = new YT.Player($('.js-hero__video')[0], {
                        height: 1000,
                        width: 2000,
                        videoId: heroVideoId,
                        playerVars: {
                            autoplay: 1,
                            loop: 1,
                            playlist: heroVideoId,
                            controls: 0,
                            showinfo: 0,
                            autohide: 1,
                            modestbranding: 1,
                            rel: 0,
                            vq: 'hd1080'
                        },

                        events: {
                            'onReady': onHeroPlayerReady
                        }
                    });


                };


                function onHeroPlayerReady(e) {
                    console.info('hero player muted');
                    fullWidthplayer.mute();
                }

                function onPlayerReady(event) {
                    popupLink.on("click", function (e) {
                        e.preventDefault();
                        var link = parseInt($(this).attr('popupLink'));
                        var uniqueVid = $(this).attr('popupLink');

                        $(this).closest('.js-vid-popup').addClass('popup-active');

                        body.addClass('scroll-disable');

                        if ($(this).closest('.section').hasClass('js-vid-popup--triple')) {
                            setTimeout(function () {
                                var player_name = 'player_' + uniqueVid;
                                nowPlaying = players[player_name];
                                console.log(player_name);
                                players[player_name].playVideo();
                            }, 1200);
                        }
                    });

                    closeButton.on("click", function (e) {
                        e.preventDefault();
                        $(this).closest('.js-vid-popup').removeClass('popup-active');
                        body.removeClass('scroll-disable');

                        if ($(this).closest('.section').hasClass('js-vid-popup--triple')) {
                            nowPlaying.stopVideo();
                        }
                    });
                }
            };

    }, {}], 34: [function (require, module, exports) {
        (function (global) {
            'use strict'; var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) { return typeof obj === "undefined" ? "undefined" : _typeof2(obj); } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj); };/*
                                                                                                                                                                                                                                                                                            _ _      _       _
                                                                                                                                                                                                                                                                                        ___| (_) ___| | __  (_)___
                                                                                                                                                                                                                                                                                       / __| | |/ __| |/ /  | / __|
                                                                                                                                                                                                                                                                                       \__ \ | | (__|   < _ | \__ \
                                                                                                                                                                                                                                                                                       |___/_|_|\___|_|\_(_)/ |___/
                                                                                                                                                                                                                                                                                                          |__/
                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                        Version: 1.5.0
                                                                                                                                                                                                                                                                                         Author: Ken Wheeler
                                                                                                                                                                                                                                                                                        Website: http://kenwheeler.github.io
                                                                                                                                                                                                                                                                                           Docs: http://kenwheeler.github.io/slick
                                                                                                                                                                                                                                                                                           Repo: http://github.com/kenwheeler/slick
                                                                                                                                                                                                                                                                                         Issues: http://github.com/kenwheeler/slick/issues
                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                        */
            /* global window, document, define, jQuery, setInterval, clearInterval */
            (function (factory) {
                'use strict';
                if (typeof define === 'function' && define.amd) {
                    define(['jquery'], factory);
                } else if (typeof exports !== 'undefined') {
                    module.exports = factory(typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
                } else {
                    factory(jQuery);
                }
            })(function ($) {
                'use strict';
                var Slick = window.Slick || {};

                Slick = function () {
                    var instanceUid = 0;

                    function Slick(element, settings) {
                        var _ = this,
                            dataSettings = void 0, responsiveSettings = void 0, breakpoint = void 0;

                        _.defaults = {
                            accessibility: true,
                            adaptiveHeight: false,
                            appendArrows: $(element),
                            appendDots: $(element),
                            arrows: true,
                            asNavFor: null,
                            prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="previous">Previous</button>',
                            nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="next">Next</button>',
                            autoplay: false,
                            autoplaySpeed: 3000,
                            centerMode: false,
                            centerPadding: '50px',
                            cssEase: 'ease',
                            customPaging: function customPaging(slider, i) {
                                return '<button type="button" data-role="none">' + (i + 1) + '</button>';
                            },
                            dots: false,
                            dotsClass: 'slick-dots',
                            draggable: true,
                            easing: 'linear',
                            edgeFriction: 0.35,
                            fade: false,
                            focusOnSelect: false,
                            infinite: true,
                            initialSlide: 0,
                            lazyLoad: 'ondemand',
                            mobileFirst: false,
                            pauseOnHover: true,
                            pauseOnDotsHover: false,
                            respondTo: 'window',
                            responsive: null,
                            rows: 1,
                            rtl: false,
                            slide: '',
                            slidesPerRow: 1,
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            speed: 500,
                            swipe: true,
                            swipeToSlide: false,
                            touchMove: true,
                            touchThreshold: 5,
                            useCSS: true,
                            variableWidth: false,
                            vertical: false,
                            verticalSwiping: false,
                            waitForAnimate: true
                        };


                        _.initials = {
                            animating: false,
                            dragging: false,
                            autoPlayTimer: null,
                            currentDirection: 0,
                            currentLeft: null,
                            currentSlide: 0,
                            direction: 1,
                            $dots: null,
                            listWidth: null,
                            listHeight: null,
                            loadIndex: 0,
                            $nextArrow: null,
                            $prevArrow: null,
                            slideCount: null,
                            slideWidth: null,
                            $slideTrack: null,
                            $slides: null,
                            sliding: false,
                            slideOffset: 0,
                            swipeLeft: null,
                            $list: null,
                            touchObject: {},
                            transformsEnabled: false
                        };


                        $.extend(_, _.initials);

                        _.activeBreakpoint = null;
                        _.animType = null;
                        _.animProp = null;
                        _.breakpoints = [];
                        _.breakpointSettings = [];
                        _.cssTransitions = false;
                        _.hidden = 'hidden';
                        _.paused = false;
                        _.positionProp = null;
                        _.respondTo = null;
                        _.rowCount = 1;
                        _.shouldClick = true;
                        _.$slider = $(element);
                        _.$slidesCache = null;
                        _.transformType = null;
                        _.transitionType = null;
                        _.visibilityChange = 'visibilitychange';
                        _.windowWidth = 0;
                        _.windowTimer = null;

                        dataSettings = $(element).data('slick') || {};

                        _.options = $.extend({}, _.defaults, dataSettings, settings);

                        _.currentSlide = _.options.initialSlide;

                        _.originalSettings = _.options;
                        responsiveSettings = _.options.responsive || null;

                        if (responsiveSettings && responsiveSettings.length > -1) {
                            _.respondTo = _.options.respondTo || 'window';
                            for (breakpoint in responsiveSettings) {
                                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                                    _.breakpoints.push(responsiveSettings[
                                        breakpoint].breakpoint);
                                    _.breakpointSettings[responsiveSettings[
                                        breakpoint].breakpoint] =
                                        responsiveSettings[breakpoint].settings;
                                }
                            }
                            _.breakpoints.sort(function (a, b) {
                                if (_.options.mobileFirst === true) {
                                    return a - b;
                                } else {
                                    return b - a;
                                }
                            });
                        }

                        if (typeof document.mozHidden !== 'undefined') {
                            _.hidden = 'mozHidden';
                            _.visibilityChange = 'mozvisibilitychange';
                        } else if (typeof document.msHidden !== 'undefined') {
                            _.hidden = 'msHidden';
                            _.visibilityChange = 'msvisibilitychange';
                        } else if (typeof document.webkitHidden !== 'undefined') {
                            _.hidden = 'webkitHidden';
                            _.visibilityChange = 'webkitvisibilitychange';
                        }

                        _.autoPlay = $.proxy(_.autoPlay, _);
                        _.autoPlayClear = $.proxy(_.autoPlayClear, _);
                        _.changeSlide = $.proxy(_.changeSlide, _);
                        _.clickHandler = $.proxy(_.clickHandler, _);
                        _.selectHandler = $.proxy(_.selectHandler, _);
                        _.setPosition = $.proxy(_.setPosition, _);
                        _.swipeHandler = $.proxy(_.swipeHandler, _);
                        _.dragHandler = $.proxy(_.dragHandler, _);
                        _.keyHandler = $.proxy(_.keyHandler, _);
                        _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);

                        _.instanceUid = instanceUid++;

                        // A simple way to check for HTML strings
                        // Strict HTML recognition (must start with <)
                        // Extracted from jQuery v1.11 source
                        _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

                        _.init();

                        _.checkResponsive(true);
                    }

                    return Slick;
                }();

                Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {
                    var _ = this;

                    if (typeof index === 'boolean') {
                        addBefore = index;
                        index = null;
                    } else if (index < 0 || index >= _.slideCount) {
                        return false;
                    }

                    _.unload();

                    if (typeof index === 'number') {
                        if (index === 0 && _.$slides.length === 0) {
                            $(markup).appendTo(_.$slideTrack);
                        } else if (addBefore) {
                            $(markup).insertBefore(_.$slides.eq(index));
                        } else {
                            $(markup).insertAfter(_.$slides.eq(index));
                        }
                    } else {
                        if (addBefore === true) {
                            $(markup).prependTo(_.$slideTrack);
                        } else {
                            $(markup).appendTo(_.$slideTrack);
                        }
                    }

                    _.$slides = _.$slideTrack.children(this.options.slide);

                    _.$slideTrack.children(this.options.slide).detach();

                    _.$slideTrack.append(_.$slides);

                    _.$slides.each(function (index, element) {
                        $(element).attr('data-slick-index', index);
                    });

                    _.$slidesCache = _.$slides;

                    _.reinit();
                };

                Slick.prototype.animateHeight = function () {
                    var _ = this;
                    if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
                        var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
                        _.$list.animate({
                            height: targetHeight
                        },
                            _.options.speed);
                    }
                };

                Slick.prototype.animateSlide = function (targetLeft, callback) {
                    var animProps = {},
                        _ = this;

                    _.animateHeight();

                    if (_.options.rtl === true && _.options.vertical === false) {
                        targetLeft = -targetLeft;
                    }
                    if (_.transformsEnabled === false) {
                        if (_.options.vertical === false) {
                            _.$slideTrack.animate({
                                left: targetLeft
                            },
                                _.options.speed, _.options.easing, callback);
                        } else {
                            _.$slideTrack.animate({
                                top: targetLeft
                            },
                                _.options.speed, _.options.easing, callback);
                        }
                    } else {
                        if (_.cssTransitions === false) {
                            if (_.options.rtl === true) {
                                _.currentLeft = -_.currentLeft;
                            }
                            $({
                                animStart: _.currentLeft
                            }).
                                animate({
                                    animStart: targetLeft
                                },
                                    {
                                        duration: _.options.speed,
                                        easing: _.options.easing,
                                        step: function step(now) {
                                            now = Math.ceil(now);
                                            if (_.options.vertical === false) {
                                                animProps[_.animType] = 'translate(' +
                                                    now + 'px, 0px)';
                                                _.$slideTrack.css(animProps);
                                            } else {
                                                animProps[_.animType] = 'translate(0px,' +
                                                    now + 'px)';
                                                _.$slideTrack.css(animProps);
                                            }
                                        },
                                        complete: function complete() {
                                            if (callback) {
                                                callback.call();
                                            }
                                        }
                                    });

                        } else {
                            _.applyTransition();
                            targetLeft = Math.ceil(targetLeft);

                            if (_.options.vertical === false) {
                                animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                            } else {
                                animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                            }
                            _.$slideTrack.css(animProps);

                            if (callback) {
                                setTimeout(function () {
                                    _.disableTransition();

                                    callback.call();
                                }, _.options.speed);
                            }
                        }
                    }
                };

                Slick.prototype.asNavFor = function (index) {
                    var _ = this,
                        asNavFor = _.options.asNavFor !== null ? $(_.options.asNavFor).slick('getSlick') : null;
                    if (asNavFor !== null) asNavFor.slideHandler(index, true);
                };

                Slick.prototype.applyTransition = function (slide) {
                    var _ = this,
                        transition = {};

                    if (_.options.fade === false) {
                        transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
                    } else {
                        transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
                    }

                    if (_.options.fade === false) {
                        _.$slideTrack.css(transition);
                    } else {
                        _.$slides.eq(slide).css(transition);
                    }
                };

                Slick.prototype.autoPlay = function () {
                    var _ = this;

                    if (_.autoPlayTimer) {
                        clearInterval(_.autoPlayTimer);
                    }

                    if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
                        _.autoPlayTimer = setInterval(_.autoPlayIterator,
                            _.options.autoplaySpeed);
                    }
                };

                Slick.prototype.autoPlayClear = function () {
                    var _ = this;
                    if (_.autoPlayTimer) {
                        clearInterval(_.autoPlayTimer);
                    }
                };

                Slick.prototype.autoPlayIterator = function () {
                    var _ = this;

                    if (_.options.infinite === false) {
                        if (_.direction === 1) {
                            if (_.currentSlide + 1 === _.slideCount -
                                1) {
                                _.direction = 0;
                            }

                            _.slideHandler(_.currentSlide + _.options.slidesToScroll);
                        } else {
                            if (_.currentSlide - 1 === 0) {
                                _.direction = 1;
                            }

                            _.slideHandler(_.currentSlide - _.options.slidesToScroll);
                        }
                    } else {
                        _.slideHandler(_.currentSlide + _.options.slidesToScroll);
                    }
                };

                Slick.prototype.buildArrows = function () {
                    var _ = this;

                    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
                        _.$prevArrow = $(_.options.prevArrow);
                        _.$nextArrow = $(_.options.nextArrow);

                        if (_.htmlExpr.test(_.options.prevArrow)) {
                            _.$prevArrow.appendTo(_.options.appendArrows);
                        }

                        if (_.htmlExpr.test(_.options.nextArrow)) {
                            _.$nextArrow.appendTo(_.options.appendArrows);
                        }

                        if (_.options.infinite !== true) {
                            _.$prevArrow.addClass('slick-disabled');
                        }
                    }
                };

                Slick.prototype.buildDots = function () {
                    var _ = this,
                        i = void 0, dotString = void 0;

                    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
                        dotString = '<ul class="' + _.options.dotsClass + '">';

                        for (i = 0; i <= _.getDotCount(); i += 1) {
                            dotString += '<li>' + _.options.customPaging.call(this, _, i) + '</li>';
                        }

                        dotString += '</ul>';

                        _.$dots = $(dotString).appendTo(
                            _.options.appendDots);

                        _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');
                    }
                };

                Slick.prototype.buildOut = function () {
                    var _ = this;

                    _.$slides = _.$slider.children(
                        ':not(.slick-cloned)').addClass(
                            'slick-slide');
                    _.slideCount = _.$slides.length;

                    _.$slides.each(function (index, element) {
                        $(element).attr('data-slick-index', index);
                    });

                    _.$slidesCache = _.$slides;

                    _.$slider.addClass('slick-slider');

                    _.$slideTrack = _.slideCount === 0 ?
                        $('<div class="slick-track"/>').appendTo(_.$slider) :
                        _.$slides.wrapAll('<div class="slick-track"/>').parent();

                    _.$list = _.$slideTrack.wrap(
                        '<div aria-live="polite" class="slick-list"/>').parent();
                    _.$slideTrack.css('opacity', 0);

                    if (_.options.centerMode === true || _.options.swipeToSlide === true) {
                        _.options.slidesToScroll = 1;
                    }

                    $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

                    _.setupInfinite();

                    _.buildArrows();

                    _.buildDots();

                    _.updateDots();

                    if (_.options.accessibility === true) {
                        _.$list.prop('tabIndex', 0);
                    }

                    _.setSlideClasses(typeof this.currentSlide === 'number' ? this.currentSlide : 0);

                    if (_.options.draggable === true) {
                        _.$list.addClass('draggable');
                    }
                };

                Slick.prototype.buildRows = function () {
                    var _ = this, a = void 0, b = void 0, c = void 0, newSlides = void 0, numOfSlides = void 0, originalSlides = void 0, slidesPerSection = void 0;

                    newSlides = document.createDocumentFragment();
                    originalSlides = _.$slider.children();

                    if (_.options.rows > 1) {
                        slidesPerSection = _.options.slidesPerRow * _.options.rows;
                        numOfSlides = Math.ceil(
                            originalSlides.length / slidesPerSection);


                        for (a = 0; a < numOfSlides; a++) {
                            var slide = document.createElement('div');
                            for (b = 0; b < _.options.rows; b++) {
                                var row = document.createElement('div');
                                for (c = 0; c < _.options.slidesPerRow; c++) {
                                    var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);
                                    if (originalSlides.get(target)) {
                                        row.appendChild(originalSlides.get(target));
                                    }
                                }
                                slide.appendChild(row);
                            }
                            newSlides.appendChild(slide);
                        }
                        _.$slider.html(newSlides);
                        _.$slider.children().children().children().
                            width(100 / _.options.slidesPerRow + '%').
                            css({ 'display': 'inline-block' });
                    }
                };

                Slick.prototype.checkResponsive = function (initial) {
                    var _ = this,
                        breakpoint = void 0, targetBreakpoint = void 0, respondToWidth = void 0;
                    var sliderWidth = _.$slider.width();
                    var windowWidth = window.innerWidth || $(window).width();
                    if (_.respondTo === 'window') {
                        respondToWidth = windowWidth;
                    } else if (_.respondTo === 'slider') {
                        respondToWidth = sliderWidth;
                    } else if (_.respondTo === 'min') {
                        respondToWidth = Math.min(windowWidth, sliderWidth);
                    }

                    if (_.originalSettings.responsive && _.originalSettings.
                        responsive.length > -1 && _.originalSettings.responsive !== null) {
                        targetBreakpoint = null;

                        for (breakpoint in _.breakpoints) {
                            if (_.breakpoints.hasOwnProperty(breakpoint)) {
                                if (_.originalSettings.mobileFirst === false) {
                                    if (respondToWidth < _.breakpoints[breakpoint]) {
                                        targetBreakpoint = _.breakpoints[breakpoint];
                                    }
                                } else {
                                    if (respondToWidth > _.breakpoints[breakpoint]) {
                                        targetBreakpoint = _.breakpoints[breakpoint];
                                    }
                                }
                            }
                        }

                        if (targetBreakpoint !== null) {
                            if (_.activeBreakpoint !== null) {
                                if (targetBreakpoint !== _.activeBreakpoint) {
                                    _.activeBreakpoint =
                                        targetBreakpoint;
                                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                                        _.unslick();
                                    } else {
                                        _.options = $.extend({}, _.originalSettings,
                                            _.breakpointSettings[
                                            targetBreakpoint]);
                                        if (initial === true)
                                            _.currentSlide = _.options.initialSlide;
                                        _.refresh();
                                    }
                                }
                            } else {
                                _.activeBreakpoint = targetBreakpoint;
                                if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                                    _.unslick();
                                } else {
                                    _.options = $.extend({}, _.originalSettings,
                                        _.breakpointSettings[
                                        targetBreakpoint]);
                                    if (initial === true)
                                        _.currentSlide = _.options.initialSlide;
                                    _.refresh();
                                }
                            }
                        } else {
                            if (_.activeBreakpoint !== null) {
                                _.activeBreakpoint = null;
                                _.options = _.originalSettings;
                                if (initial === true)
                                    _.currentSlide = _.options.initialSlide;
                                _.refresh();
                            }
                        }
                    }
                };

                Slick.prototype.changeSlide = function (event, dontAnimate) {
                    var _ = this,
                        $target = $(event.target),
                        indexOffset = void 0, slideOffset = void 0, unevenOffset = void 0;

                    // If target is a link, prevent default action.
                    $target.is('a') && event.preventDefault();

                    unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
                    indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

                    switch (event.data.message) {

                        case 'previous':
                            slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                            if (_.slideCount > _.options.slidesToShow) {
                                _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                            }
                            break;

                        case 'next':
                            slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                            if (_.slideCount > _.options.slidesToShow) {
                                _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                            }
                            break;

                        case 'index':
                            var index = event.data.index === 0 ? 0 :
                                event.data.index || $(event.target).parent().index() * _.options.slidesToScroll;

                            _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                            break;

                        default:
                            return;
                    }

                };

                Slick.prototype.checkNavigable = function (index) {
                    var _ = this,
                        navigables = void 0, prevNavigable = void 0;

                    navigables = _.getNavigableIndexes();
                    prevNavigable = 0;
                    if (index > navigables[navigables.length - 1]) {
                        index = navigables[navigables.length - 1];
                    } else {
                        for (var n in navigables) {
                            if (index < navigables[n]) {
                                index = prevNavigable;
                                break;
                            }
                            prevNavigable = navigables[n];
                        }
                    }

                    return index;
                };

                Slick.prototype.cleanUpEvents = function () {
                    var _ = this;

                    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
                        $('li', _.$dots).off('click.slick', _.changeSlide);
                    }

                    if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
                        $('li', _.$dots).
                            off('mouseenter.slick', _.setPaused.bind(_, true)).
                            off('mouseleave.slick', _.setPaused.bind(_, false));
                    }

                    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
                        _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
                        _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
                    }

                    _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
                    _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
                    _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
                    _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

                    _.$list.off('click.slick', _.clickHandler);

                    if (_.options.autoplay === true) {
                        $(document).off(_.visibilityChange, _.visibility);
                    }

                    _.$list.off('mouseenter.slick', _.setPaused.bind(_, true));
                    _.$list.off('mouseleave.slick', _.setPaused.bind(_, false));

                    if (_.options.accessibility === true) {
                        _.$list.off('keydown.slick', _.keyHandler);
                    }

                    if (_.options.focusOnSelect === true) {
                        $(_.$slideTrack).children().off('click.slick', _.selectHandler);
                    }

                    $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

                    $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

                    $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

                    $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
                    $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);
                };

                Slick.prototype.cleanUpRows = function () {
                    var _ = this, originalSlides = void 0;

                    if (_.options.rows > 1) {
                        originalSlides = _.$slides.children().children();
                        originalSlides.removeAttr('style');
                        _.$slider.html(originalSlides);
                    }
                };

                Slick.prototype.clickHandler = function (event) {
                    var _ = this;

                    if (_.shouldClick === false) {
                        event.stopImmediatePropagation();
                        event.stopPropagation();
                        event.preventDefault();
                    }
                };

                Slick.prototype.destroy = function () {
                    var _ = this;

                    _.autoPlayClear();

                    _.touchObject = {};

                    _.cleanUpEvents();

                    $('.slick-cloned', _.$slider).remove();

                    if (_.$dots) {
                        _.$dots.remove();
                    }
                    if (_.$prevArrow && _typeof(_.options.prevArrow) !== 'object') {
                        _.$prevArrow.remove();
                    }
                    if (_.$nextArrow && _typeof(_.options.nextArrow) !== 'object') {
                        _.$nextArrow.remove();
                    }

                    if (_.$slides) {
                        _.$slides.removeClass('slick-slide slick-active slick-center slick-visible').
                            attr('aria-hidden', 'true').
                            removeAttr('data-slick-index').
                            css({
                                position: '',
                                left: '',
                                top: '',
                                zIndex: '',
                                opacity: '',
                                width: ''
                            });


                        _.$slider.html(_.$slides);
                    }

                    _.cleanUpRows();

                    _.$slider.removeClass('slick-slider');
                    _.$slider.removeClass('slick-initialized');
                };

                Slick.prototype.disableTransition = function (slide) {
                    var _ = this,
                        transition = {};

                    transition[_.transitionType] = '';

                    if (_.options.fade === false) {
                        _.$slideTrack.css(transition);
                    } else {
                        _.$slides.eq(slide).css(transition);
                    }
                };

                Slick.prototype.fadeSlide = function (slideIndex, callback) {
                    var _ = this;

                    if (_.cssTransitions === false) {
                        _.$slides.eq(slideIndex).css({
                            zIndex: 1000
                        });


                        _.$slides.eq(slideIndex).animate({
                            opacity: 1
                        },
                            _.options.speed, _.options.easing, callback);
                    } else {
                        _.applyTransition(slideIndex);

                        _.$slides.eq(slideIndex).css({
                            opacity: 1,
                            zIndex: 1000
                        });


                        if (callback) {
                            setTimeout(function () {
                                _.disableTransition(slideIndex);

                                callback.call();
                            }, _.options.speed);
                        }
                    }
                };

                Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {
                    var _ = this;

                    if (filter !== null) {
                        _.unload();

                        _.$slideTrack.children(this.options.slide).detach();

                        _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

                        _.reinit();
                    }
                };

                Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {
                    var _ = this;
                    return _.currentSlide;
                };

                Slick.prototype.getDotCount = function () {
                    var _ = this;

                    var breakPoint = 0;
                    var counter = 0;
                    var pagerQty = 0;

                    if (_.options.infinite === true) {
                        pagerQty = Math.ceil(_.slideCount / _.options.slidesToScroll);
                    } else if (_.options.centerMode === true) {
                        pagerQty = _.slideCount;
                    } else {
                        while (breakPoint < _.slideCount) {
                            ++pagerQty;
                            breakPoint = counter + _.options.slidesToShow;
                            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                        }
                    }

                    return pagerQty - 1;
                };

                Slick.prototype.getLeft = function (slideIndex) {
                    var _ = this,
                        targetLeft = void 0,
                        verticalHeight = void 0,
                        verticalOffset = 0,
                        targetSlide = void 0;

                    _.slideOffset = 0;
                    verticalHeight = _.$slides.first().outerHeight();

                    if (_.options.infinite === true) {
                        if (_.slideCount > _.options.slidesToShow) {
                            _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
                            verticalOffset = verticalHeight * _.options.slidesToShow * -1;
                        }
                        if (_.slideCount % _.options.slidesToScroll !== 0) {
                            if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                                if (slideIndex > _.slideCount) {
                                    _.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
                                    verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
                                } else {
                                    _.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
                                    verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
                                }
                            }
                        }
                    } else {
                        if (slideIndex + _.options.slidesToShow > _.slideCount) {
                            _.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
                            verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
                        }
                    }

                    if (_.slideCount <= _.options.slidesToShow) {
                        _.slideOffset = 0;
                        verticalOffset = 0;
                    }

                    if (_.options.centerMode === true && _.options.infinite === true) {
                        _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
                    } else if (_.options.centerMode === true) {
                        _.slideOffset = 0;
                        _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
                    }

                    if (_.options.vertical === false) {
                        targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
                    } else {
                        targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
                    }

                    if (_.options.variableWidth === true) {
                        if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                            targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                        } else {
                            targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
                        }

                        targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;

                        if (_.options.centerMode === true) {
                            if (_.options.infinite === false) {
                                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                            } else {
                                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                            }
                            targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                            targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
                        }
                    }

                    return targetLeft;
                };

                Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {
                    var _ = this;

                    return _.options[option];
                };

                Slick.prototype.getNavigableIndexes = function () {
                    var _ = this,
                        breakPoint = 0,
                        counter = 0,
                        indexes = [],
                        max = void 0;

                    if (_.options.infinite === false) {
                        max = _.slideCount - _.options.slidesToShow + 1;
                        if (_.options.centerMode === true) max = _.slideCount;
                    } else {
                        breakPoint = _.options.slidesToScroll * -1;
                        counter = _.options.slidesToScroll * -1;
                        max = _.slideCount * 2;
                    }

                    while (breakPoint < max) {
                        indexes.push(breakPoint);
                        breakPoint = counter + _.options.slidesToScroll;
                        counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                    }

                    return indexes;
                };

                Slick.prototype.getSlick = function () {
                    return this;
                };

                Slick.prototype.getSlideCount = function () {
                    var _ = this,
                        slidesTraversed = void 0, swipedSlide = void 0, centerOffset = void 0;

                    centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

                    if (_.options.swipeToSlide === true) {
                        _.$slideTrack.find('.slick-slide').each(function (index, slide) {
                            if (slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > _.swipeLeft * -1) {
                                swipedSlide = slide;
                                return false;
                            }
                        });

                        slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

                        return slidesTraversed;
                    } else {
                        return _.options.slidesToScroll;
                    }
                };

                Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {
                    var _ = this;

                    _.changeSlide({
                        data: {
                            message: 'index',
                            index: parseInt(slide)
                        }
                    },

                        dontAnimate);
                };

                Slick.prototype.init = function () {
                    var _ = this;

                    if (!$(_.$slider).hasClass('slick-initialized')) {
                        $(_.$slider).addClass('slick-initialized');
                        _.buildRows();
                        _.buildOut();
                        _.setProps();
                        _.startLoad();
                        _.loadSlider();
                        _.initializeEvents();
                        _.updateArrows();
                        _.updateDots();
                    }

                    _.$slider.trigger('init', [_]);
                };

                Slick.prototype.initArrowEvents = function () {
                    var _ = this;

                    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
                        _.$prevArrow.on('click.slick', {
                            message: 'previous'
                        },
                            _.changeSlide);
                        _.$nextArrow.on('click.slick', {
                            message: 'next'
                        },
                            _.changeSlide);
                    }
                };

                Slick.prototype.initDotEvents = function () {
                    var _ = this;

                    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
                        $('li', _.$dots).on('click.slick', {
                            message: 'index'
                        },
                            _.changeSlide);
                    }

                    if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
                        $('li', _.$dots).
                            on('mouseenter.slick', _.setPaused.bind(_, true)).
                            on('mouseleave.slick', _.setPaused.bind(_, false));
                    }
                };

                Slick.prototype.initializeEvents = function () {
                    var _ = this;

                    _.initArrowEvents();

                    _.initDotEvents();

                    _.$list.on('touchstart.slick mousedown.slick', {
                        action: 'start'
                    },
                        _.swipeHandler);
                    _.$list.on('touchmove.slick mousemove.slick', {
                        action: 'move'
                    },
                        _.swipeHandler);
                    _.$list.on('touchend.slick mouseup.slick', {
                        action: 'end'
                    },
                        _.swipeHandler);
                    _.$list.on('touchcancel.slick mouseleave.slick', {
                        action: 'end'
                    },
                        _.swipeHandler);

                    _.$list.on('click.slick', _.clickHandler);

                    if (_.options.autoplay === true) {
                        $(document).on(_.visibilityChange, _.visibility.bind(_));
                    }

                    _.$list.on('mouseenter.slick', _.setPaused.bind(_, true));
                    _.$list.on('mouseleave.slick', _.setPaused.bind(_, false));

                    if (_.options.accessibility === true) {
                        _.$list.on('keydown.slick', _.keyHandler);
                    }

                    if (_.options.focusOnSelect === true) {
                        $(_.$slideTrack).children().on('click.slick', _.selectHandler);
                    }

                    $(window).on('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange.bind(_));

                    $(window).on('resize.slick.slick-' + _.instanceUid, _.resize.bind(_));

                    $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

                    $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
                    $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);
                };

                Slick.prototype.initUI = function () {
                    var _ = this;

                    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
                        _.$prevArrow.show();
                        _.$nextArrow.show();
                    }

                    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
                        _.$dots.show();
                    }

                    if (_.options.autoplay === true) {
                        _.autoPlay();
                    }
                };

                Slick.prototype.keyHandler = function (event) {
                    var _ = this;

                    if (event.keyCode === 37 && _.options.accessibility === true) {
                        _.changeSlide({
                            data: {
                                message: 'previous'
                            }
                        });


                    } else if (event.keyCode === 39 && _.options.accessibility === true) {
                        _.changeSlide({
                            data: {
                                message: 'next'
                            }
                        });


                    }
                };

                Slick.prototype.lazyLoad = function () {
                    var _ = this,
                        loadRange = void 0, cloneRange = void 0, rangeStart = void 0, rangeEnd = void 0;

                    function loadImages(imagesScope) {
                        $('img[data-lazy]', imagesScope).each(function () {
                            var image = $(this),
                                imageSource = $(this).attr('data-lazy'),
                                imageToLoad = document.createElement('img');

                            imageToLoad.onload = function () {
                                image.animate({
                                    opacity: 1
                                },
                                    200);
                            };
                            imageToLoad.src = imageSource;

                            image.
                                css({
                                    opacity: 0
                                }).

                                attr('src', imageSource).
                                removeAttr('data-lazy').
                                removeClass('slick-loading');
                        });
                    }

                    if (_.options.centerMode === true) {
                        if (_.options.infinite === true) {
                            rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                            rangeEnd = rangeStart + _.options.slidesToShow + 2;
                        } else {
                            rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                            rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
                        }
                    } else {
                        rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
                        rangeEnd = rangeStart + _.options.slidesToShow;
                        if (_.options.fade === true) {
                            if (rangeStart > 0) rangeStart--;
                            if (rangeEnd <= _.slideCount) rangeEnd++;
                        }
                    }

                    loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
                    loadImages(loadRange);

                    if (_.slideCount <= _.options.slidesToShow) {
                        cloneRange = _.$slider.find('.slick-slide');
                        loadImages(cloneRange);
                    } else
                        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
                            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
                            loadImages(cloneRange);
                        } else if (_.currentSlide === 0) {
                            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
                            loadImages(cloneRange);
                        }
                };

                Slick.prototype.loadSlider = function () {
                    var _ = this;

                    _.setPosition();

                    _.$slideTrack.css({
                        opacity: 1
                    });


                    _.$slider.removeClass('slick-loading');

                    _.initUI();

                    if (_.options.lazyLoad === 'progressive') {
                        _.progressiveLazyLoad();
                    }
                };

                Slick.prototype.next = Slick.prototype.slickNext = function () {
                    var _ = this;

                    _.changeSlide({
                        data: {
                            message: 'next'
                        }
                    });


                };

                Slick.prototype.orientationChange = function () {
                    var _ = this;

                    _.checkResponsive();
                    _.setPosition();
                };

                Slick.prototype.pause = Slick.prototype.slickPause = function () {
                    var _ = this;

                    _.autoPlayClear();
                    _.paused = true;
                };

                Slick.prototype.play = Slick.prototype.slickPlay = function () {
                    var _ = this;

                    _.paused = false;
                    _.autoPlay();
                };

                Slick.prototype.postSlide = function (index) {
                    var _ = this;

                    _.$slider.trigger('afterChange', [_, index]);

                    _.animating = false;

                    _.setPosition();

                    _.swipeLeft = null;

                    if (_.options.autoplay === true && _.paused === false) {
                        _.autoPlay();
                    }
                };

                Slick.prototype.prev = Slick.prototype.slickPrev = function () {
                    var _ = this;

                    _.changeSlide({
                        data: {
                            message: 'previous'
                        }
                    });


                };

                Slick.prototype.preventDefault = function (e) {
                    e.preventDefault();
                };

                Slick.prototype.progressiveLazyLoad = function () {
                    var _ = this,
                        imgCount = void 0, targetImage = void 0;

                    imgCount = $('img[data-lazy]', _.$slider).length;

                    if (imgCount > 0) {
                        targetImage = $('img[data-lazy]', _.$slider).first();
                        targetImage.attr('src', targetImage.attr('data-lazy')).removeClass('slick-loading').load(function () {
                            targetImage.removeAttr('data-lazy');
                            _.progressiveLazyLoad();

                            if (_.options.adaptiveHeight === true) {
                                _.setPosition();
                            }
                        }).
                            error(function () {
                                targetImage.removeAttr('data-lazy');
                                _.progressiveLazyLoad();
                            });
                    }
                };

                Slick.prototype.refresh = function () {
                    var _ = this,
                        currentSlide = _.currentSlide;

                    _.destroy();

                    $.extend(_, _.initials);

                    _.init();

                    _.changeSlide({
                        data: {
                            message: 'index',
                            index: currentSlide
                        }
                    },

                        false);
                };

                Slick.prototype.reinit = function () {
                    var _ = this;

                    _.$slides = _.$slideTrack.children(_.options.slide).addClass(
                        'slick-slide');

                    _.slideCount = _.$slides.length;

                    if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
                        _.currentSlide = _.currentSlide - _.options.slidesToScroll;
                    }

                    if (_.slideCount <= _.options.slidesToShow) {
                        _.currentSlide = 0;
                    }

                    _.setProps();

                    _.setupInfinite();

                    _.buildArrows();

                    _.updateArrows();

                    _.initArrowEvents();

                    _.buildDots();

                    _.updateDots();

                    _.initDotEvents();

                    if (_.options.focusOnSelect === true) {
                        $(_.$slideTrack).children().on('click.slick', _.selectHandler);
                    }

                    _.setSlideClasses(0);

                    _.setPosition();

                    _.$slider.trigger('reInit', [_]);
                };

                Slick.prototype.resize = function () {
                    var _ = this;

                    if ($(window).width() !== _.windowWidth) {
                        clearTimeout(_.windowDelay);
                        _.windowDelay = window.setTimeout(function () {
                            _.windowWidth = $(window).width();
                            _.checkResponsive();
                            _.setPosition();
                        }, 50);
                    }
                };

                Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {
                    var _ = this;

                    if (typeof index === 'boolean') {
                        removeBefore = index;
                        index = removeBefore === true ? 0 : _.slideCount - 1;
                    } else {
                        index = removeBefore === true ? --index : index;
                    }

                    if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
                        return false;
                    }

                    _.unload();

                    if (removeAll === true) {
                        _.$slideTrack.children().remove();
                    } else {
                        _.$slideTrack.children(this.options.slide).eq(index).remove();
                    }

                    _.$slides = _.$slideTrack.children(this.options.slide);

                    _.$slideTrack.children(this.options.slide).detach();

                    _.$slideTrack.append(_.$slides);

                    _.$slidesCache = _.$slides;

                    _.reinit();
                };

                Slick.prototype.setCSS = function (position) {
                    var _ = this,
                        positionProps = {},
                        x = void 0, y = void 0;

                    if (_.options.rtl === true) {
                        position = -position;
                    }
                    x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
                    y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

                    positionProps[_.positionProp] = position;

                    if (_.transformsEnabled === false) {
                        _.$slideTrack.css(positionProps);
                    } else {
                        positionProps = {};
                        if (_.cssTransitions === false) {
                            positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                            _.$slideTrack.css(positionProps);
                        } else {
                            positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                            _.$slideTrack.css(positionProps);
                        }
                    }
                };

                Slick.prototype.setDimensions = function () {
                    var _ = this;

                    if (_.options.vertical === false) {
                        if (_.options.centerMode === true) {
                            _.$list.css({
                                padding: '0px ' + _.options.centerPadding
                            });

                        }
                    } else {
                        _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
                        if (_.options.centerMode === true) {
                            _.$list.css({
                                padding: _.options.centerPadding + ' 0px'
                            });

                        }
                    }

                    _.listWidth = _.$list.width();
                    _.listHeight = _.$list.height();


                    if (_.options.vertical === false && _.options.variableWidth === false) {
                        _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
                        _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children('.slick-slide').length));
                    } else if (_.options.variableWidth === true) {
                        _.$slideTrack.width(5000 * _.slideCount);
                    } else {
                        _.slideWidth = Math.ceil(_.listWidth);
                        _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length));
                    }

                    var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
                    if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);
                };

                Slick.prototype.setFade = function () {
                    var _ = this,
                        targetLeft = void 0;

                    _.$slides.each(function (index, element) {
                        targetLeft = _.slideWidth * index * -1;
                        if (_.options.rtl === true) {
                            $(element).css({
                                position: 'relative',
                                right: targetLeft,
                                top: 0,
                                zIndex: 800,
                                opacity: 0
                            });

                        } else {
                            $(element).css({
                                position: 'relative',
                                left: targetLeft,
                                top: 0,
                                zIndex: 800,
                                opacity: 0
                            });

                        }
                    });

                    _.$slides.eq(_.currentSlide).css({
                        zIndex: 900,
                        opacity: 1
                    });

                };

                Slick.prototype.setHeight = function () {
                    var _ = this;

                    if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
                        var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
                        _.$list.css('height', targetHeight);
                    }
                };

                Slick.prototype.setOption = Slick.prototype.slickSetOption = function (option, value, refresh) {
                    var _ = this;
                    _.options[option] = value;

                    if (refresh === true) {
                        _.unload();
                        _.reinit();
                    }
                };

                Slick.prototype.setPosition = function () {
                    var _ = this;

                    _.setDimensions();

                    _.setHeight();

                    if (_.options.fade === false) {
                        _.setCSS(_.getLeft(_.currentSlide));
                    } else {
                        _.setFade();
                    }

                    _.$slider.trigger('setPosition', [_]);
                };

                Slick.prototype.setProps = function () {
                    var _ = this,
                        bodyStyle = document.body.style;

                    _.positionProp = _.options.vertical === true ? 'top' : 'left';

                    if (_.positionProp === 'top') {
                        _.$slider.addClass('slick-vertical');
                    } else {
                        _.$slider.removeClass('slick-vertical');
                    }

                    if (bodyStyle.WebkitTransition !== undefined ||
                        bodyStyle.MozTransition !== undefined ||
                        bodyStyle.msTransition !== undefined) {
                        if (_.options.useCSS === true) {
                            _.cssTransitions = true;
                        }
                    }

                    if (bodyStyle.OTransform !== undefined) {
                        _.animType = 'OTransform';
                        _.transformType = '-o-transform';
                        _.transitionType = 'OTransition';
                        if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
                    }
                    if (bodyStyle.MozTransform !== undefined) {
                        _.animType = 'MozTransform';
                        _.transformType = '-moz-transform';
                        _.transitionType = 'MozTransition';
                        if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
                    }
                    if (bodyStyle.webkitTransform !== undefined) {
                        _.animType = 'webkitTransform';
                        _.transformType = '-webkit-transform';
                        _.transitionType = 'webkitTransition';
                        if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
                    }
                    if (bodyStyle.msTransform !== undefined) {
                        _.animType = 'msTransform';
                        _.transformType = '-ms-transform';
                        _.transitionType = 'msTransition';
                        if (bodyStyle.msTransform === undefined) _.animType = false;
                    }
                    if (bodyStyle.transform !== undefined && _.animType !== false) {
                        _.animType = 'transform';
                        _.transformType = 'transform';
                        _.transitionType = 'transition';
                    }
                    _.transformsEnabled = _.animType !== null && _.animType !== false;
                };


                Slick.prototype.setSlideClasses = function (index) {
                    var _ = this,
                        centerOffset = void 0, allSlides = void 0, indexOffset = void 0, remainder = void 0;

                    _.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden', 'true').removeClass('slick-center');
                    allSlides = _.$slider.find('.slick-slide');

                    if (_.options.centerMode === true) {
                        centerOffset = Math.floor(_.options.slidesToShow / 2);

                        if (_.options.infinite === true) {
                            if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
                                _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
                            } else {
                                indexOffset = _.options.slidesToShow + index;
                                allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
                            }

                            if (index === 0) {
                                allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
                            } else if (index === _.slideCount - 1) {
                                allSlides.eq(_.options.slidesToShow).addClass('slick-center');
                            }
                        }

                        _.$slides.eq(index).addClass('slick-center');
                    } else {
                        if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {
                            _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
                        } else if (allSlides.length <= _.options.slidesToShow) {
                            allSlides.addClass('slick-active').attr('aria-hidden', 'false');
                        } else {
                            remainder = _.slideCount % _.options.slidesToShow;
                            indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
                            if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {
                                allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass('slick-active').attr('aria-hidden', 'false');
                            } else {
                                allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
                            }
                        }
                    }

                    if (_.options.lazyLoad === 'ondemand') {
                        _.lazyLoad();
                    }
                };

                Slick.prototype.setupInfinite = function () {
                    var _ = this,
                        i = void 0, slideIndex = void 0, infiniteCount = void 0;

                    if (_.options.fade === true) {
                        _.options.centerMode = false;
                    }

                    if (_.options.infinite === true && _.options.fade === false) {
                        slideIndex = null;

                        if (_.slideCount > _.options.slidesToShow) {
                            if (_.options.centerMode === true) {
                                infiniteCount = _.options.slidesToShow + 1;
                            } else {
                                infiniteCount = _.options.slidesToShow;
                            }

                            for (i = _.slideCount; i > _.slideCount -
                                infiniteCount; i -= 1) {
                                slideIndex = i - 1;
                                $(_.$slides[slideIndex]).clone(true).attr('id', '').
                                    attr('data-slick-index', slideIndex - _.slideCount).
                                    prependTo(_.$slideTrack).addClass('slick-cloned');
                            }
                            for (i = 0; i < infiniteCount; i += 1) {
                                slideIndex = i;
                                $(_.$slides[slideIndex]).clone(true).attr('id', '').
                                    attr('data-slick-index', slideIndex + _.slideCount).
                                    appendTo(_.$slideTrack).addClass('slick-cloned');
                            }
                            _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
                                $(this).attr('id', '');
                            });
                        }
                    }
                };

                Slick.prototype.setPaused = function (paused) {
                    var _ = this;

                    if (_.options.autoplay === true && _.options.pauseOnHover === true) {
                        _.paused = paused;
                        _.autoPlayClear();
                    }
                };

                Slick.prototype.selectHandler = function (event) {
                    var _ = this;

                    var targetElement = $(event.target).is('.slick-slide') ?
                        $(event.target) :
                        $(event.target).parents('.slick-slide');

                    var index = parseInt(targetElement.attr('data-slick-index'));

                    if (!index) index = 0;

                    if (_.slideCount <= _.options.slidesToShow) {
                        _.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden', 'true');
                        _.$slides.eq(index).addClass('slick-active').attr('aria-hidden', 'false');
                        if (_.options.centerMode === true) {
                            _.$slider.find('.slick-slide').removeClass('slick-center');
                            _.$slides.eq(index).addClass('slick-center');
                        }
                        _.asNavFor(index);
                        return;
                    }
                    _.slideHandler(index);
                };

                Slick.prototype.slideHandler = function (index, sync, dontAnimate) {
                    var targetSlide = void 0, animSlide = void 0, oldSlide = void 0, slideLeft = void 0, targetLeft = null,
                        _ = this;

                    sync = sync || false;

                    if (_.animating === true && _.options.waitForAnimate === true) {
                        return;
                    }

                    if (_.options.fade === true && _.currentSlide === index) {
                        return;
                    }

                    if (_.slideCount <= _.options.slidesToShow) {
                        return;
                    }

                    if (sync === false) {
                        _.asNavFor(index);
                    }

                    targetSlide = index;
                    targetLeft = _.getLeft(targetSlide);
                    slideLeft = _.getLeft(_.currentSlide);

                    _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

                    if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
                        if (_.options.fade === false) {
                            targetSlide = _.currentSlide;
                            if (dontAnimate !== true) {
                                _.animateSlide(slideLeft, function () {
                                    _.postSlide(targetSlide);
                                });
                            } else {
                                _.postSlide(targetSlide);
                            }
                        }
                        return;
                    } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
                        if (_.options.fade === false) {
                            targetSlide = _.currentSlide;
                            if (dontAnimate !== true) {
                                _.animateSlide(slideLeft, function () {
                                    _.postSlide(targetSlide);
                                });
                            } else {
                                _.postSlide(targetSlide);
                            }
                        }
                        return;
                    }

                    if (_.options.autoplay === true) {
                        clearInterval(_.autoPlayTimer);
                    }

                    if (targetSlide < 0) {
                        if (_.slideCount % _.options.slidesToScroll !== 0) {
                            animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
                        } else {
                            animSlide = _.slideCount + targetSlide;
                        }
                    } else if (targetSlide >= _.slideCount) {
                        if (_.slideCount % _.options.slidesToScroll !== 0) {
                            animSlide = 0;
                        } else {
                            animSlide = targetSlide - _.slideCount;
                        }
                    } else {
                        animSlide = targetSlide;
                    }

                    _.animating = true;

                    _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

                    oldSlide = _.currentSlide;
                    _.currentSlide = animSlide;

                    _.setSlideClasses(_.currentSlide);

                    _.updateDots();
                    _.updateArrows();

                    if (_.options.fade === true) {
                        if (dontAnimate !== true) {
                            _.fadeSlide(animSlide, function () {
                                _.postSlide(animSlide);
                            });
                        } else {
                            _.postSlide(animSlide);
                        }
                        _.animateHeight();
                        return;
                    }

                    if (dontAnimate !== true) {
                        _.animateSlide(targetLeft, function () {
                            _.postSlide(animSlide);
                        });
                    } else {
                        _.postSlide(animSlide);
                    }
                };

                Slick.prototype.startLoad = function () {
                    var _ = this;

                    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
                        _.$prevArrow.hide();
                        _.$nextArrow.hide();
                    }

                    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
                        _.$dots.hide();
                    }

                    _.$slider.addClass('slick-loading');
                };

                Slick.prototype.swipeDirection = function () {
                    var xDist = void 0, yDist = void 0, r = void 0, swipeAngle = void 0, _ = this;

                    xDist = _.touchObject.startX - _.touchObject.curX;
                    yDist = _.touchObject.startY - _.touchObject.curY;
                    r = Math.atan2(yDist, xDist);

                    swipeAngle = Math.round(r * 180 / Math.PI);
                    if (swipeAngle < 0) {
                        swipeAngle = 360 - Math.abs(swipeAngle);
                    }

                    if (swipeAngle <= 45 && swipeAngle >= 0) {
                        return _.options.rtl === false ? 'left' : 'right';
                    }
                    if (swipeAngle <= 360 && swipeAngle >= 315) {
                        return _.options.rtl === false ? 'left' : 'right';
                    }
                    if (swipeAngle >= 135 && swipeAngle <= 225) {
                        return _.options.rtl === false ? 'right' : 'left';
                    }
                    if (_.options.verticalSwiping === true) {
                        if (swipeAngle >= 35 && swipeAngle <= 135) {
                            return 'left';
                        } else {
                            return 'right';
                        }
                    }

                    return 'vertical';
                };

                Slick.prototype.swipeEnd = function (event) {
                    var _ = this,
                        slideCount = void 0;

                    _.dragging = false;

                    _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

                    if (_.touchObject.curX === undefined) {
                        return false;
                    }

                    if (_.touchObject.edgeHit === true) {
                        _.$slider.trigger('edge', [_, _.swipeDirection()]);
                    }

                    if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
                        switch (_.swipeDirection()) {
                            case 'left':
                                slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();
                                _.slideHandler(slideCount);
                                _.currentDirection = 0;
                                _.touchObject = {};
                                _.$slider.trigger('swipe', [_, 'left']);
                                break;

                            case 'right':
                                slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();
                                _.slideHandler(slideCount);
                                _.currentDirection = 1;
                                _.touchObject = {};
                                _.$slider.trigger('swipe', [_, 'right']);
                                break;
                        }

                    } else {
                        if (_.touchObject.startX !== _.touchObject.curX) {
                            _.slideHandler(_.currentSlide);
                            _.touchObject = {};
                        }
                    }
                };

                Slick.prototype.swipeHandler = function (event) {
                    var _ = this;

                    if (_.options.swipe === false || 'ontouchend' in document && _.options.swipe === false) {
                        return;
                    } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
                        return;
                    }

                    _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
                        event.originalEvent.touches.length : 1;

                    _.touchObject.minSwipe = _.listWidth / _.options.
                        touchThreshold;

                    if (_.options.verticalSwiping === true) {
                        _.touchObject.minSwipe = _.listHeight / _.options.
                            touchThreshold;
                    }

                    switch (event.data.action) {

                        case 'start':
                            _.swipeStart(event);
                            break;

                        case 'move':
                            _.swipeMove(event);
                            break;

                        case 'end':
                            _.swipeEnd(event);
                            break;
                    }


                };

                Slick.prototype.swipeMove = function (event) {
                    var _ = this,
                        edgeWasHit = false,
                        curLeft = void 0, swipeDirection = void 0, swipeLength = void 0, positionOffset = void 0, touches = void 0;

                    touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

                    if (!_.dragging || touches && touches.length !== 1) {
                        return false;
                    }

                    curLeft = _.getLeft(_.currentSlide);

                    _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
                    _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

                    _.touchObject.swipeLength = Math.round(Math.sqrt(
                        Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

                    if (_.options.verticalSwiping === true) {
                        _.touchObject.swipeLength = Math.round(Math.sqrt(
                            Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
                    }

                    swipeDirection = _.swipeDirection();

                    if (swipeDirection === 'vertical') {
                        return;
                    }

                    if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
                        event.preventDefault();
                    }

                    positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
                    if (_.options.verticalSwiping === true) {
                        positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
                    }


                    swipeLength = _.touchObject.swipeLength;

                    _.touchObject.edgeHit = false;

                    if (_.options.infinite === false) {
                        if (_.currentSlide === 0 && swipeDirection === 'right' || _.currentSlide >= _.getDotCount() && swipeDirection === 'left') {
                            swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                            _.touchObject.edgeHit = true;
                        }
                    }

                    if (_.options.vertical === false) {
                        _.swipeLeft = curLeft + swipeLength * positionOffset;
                    } else {
                        _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
                    }
                    if (_.options.verticalSwiping === true) {
                        _.swipeLeft = curLeft + swipeLength * positionOffset;
                    }

                    if (_.options.fade === true || _.options.touchMove === false) {
                        return false;
                    }

                    if (_.animating === true) {
                        _.swipeLeft = null;
                        return false;
                    }

                    _.setCSS(_.swipeLeft);
                };

                Slick.prototype.swipeStart = function (event) {
                    var _ = this,
                        touches = void 0;

                    if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
                        _.touchObject = {};
                        return false;
                    }

                    if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
                        touches = event.originalEvent.touches[0];
                    }

                    _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
                    _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

                    _.dragging = true;
                };

                Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {
                    var _ = this;

                    if (_.$slidesCache !== null) {
                        _.unload();

                        _.$slideTrack.children(this.options.slide).detach();

                        _.$slidesCache.appendTo(_.$slideTrack);

                        _.reinit();
                    }
                };

                Slick.prototype.unload = function () {
                    var _ = this;

                    $('.slick-cloned', _.$slider).remove();
                    if (_.$dots) {
                        _.$dots.remove();
                    }
                    if (_.$prevArrow && _typeof(_.options.prevArrow) !== 'object') {
                        _.$prevArrow.remove();
                    }
                    if (_.$nextArrow && _typeof(_.options.nextArrow) !== 'object') {
                        _.$nextArrow.remove();
                    }
                    _.$slides.removeClass('slick-slide slick-active slick-visible').attr('aria-hidden', 'true').css('width', '');
                };

                Slick.prototype.unslick = function () {
                    var _ = this;
                    _.destroy();
                };

                Slick.prototype.updateArrows = function () {
                    var _ = this,
                        centerOffset = void 0;

                    centerOffset = Math.floor(_.options.slidesToShow / 2);

                    if (_.options.arrows === true && _.options.infinite !==
                        true && _.slideCount > _.options.slidesToShow) {
                        _.$prevArrow.removeClass('slick-disabled');
                        _.$nextArrow.removeClass('slick-disabled');
                        if (_.currentSlide === 0) {
                            _.$prevArrow.addClass('slick-disabled');
                            _.$nextArrow.removeClass('slick-disabled');
                        } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {
                            _.$nextArrow.addClass('slick-disabled');
                            _.$prevArrow.removeClass('slick-disabled');
                        } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {
                            _.$nextArrow.addClass('slick-disabled');
                            _.$prevArrow.removeClass('slick-disabled');
                        }
                    }
                };

                Slick.prototype.updateDots = function () {
                    var _ = this;

                    if (_.$dots !== null) {
                        _.$dots.find('li').removeClass('slick-active').attr('aria-hidden', 'true');
                        _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active').attr('aria-hidden', 'false');
                    }
                };

                Slick.prototype.visibility = function () {
                    var _ = this;

                    if (document[_.hidden]) {
                        _.paused = true;
                        _.autoPlayClear();
                    } else {
                        _.paused = false;
                        _.autoPlay();
                    }
                };

                $.fn.slick = function () {
                    var _ = this,
                        opt = arguments[0],
                        args = Array.prototype.slice.call(arguments, 1),
                        l = _.length,
                        i = 0,
                        ret = void 0;
                    for (i; i < l; i++) {
                        if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) == 'object' || typeof opt == 'undefined')
                            _[i].slick = new Slick(_[i], opt); else

                            ret = _[i].slick[opt].apply(_[i].slick, args);
                        if (typeof ret != 'undefined') return ret;
                    }
                    return _;
                };
            });

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

    }, {}], 35: [function (require, module, exports) {
        'use strict';/*!
              Waypoints - 4.0.1
              Copyright © 2011-2016 Caleb Troughton
              Licensed under the MIT license.
              https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
              */
        (function () {
            'use strict';

            var keyCounter = 0;
            var allWaypoints = {};

            /* http://imakewebthings.com/waypoints/api/waypoint */
            function Waypoint(options) {
                if (!options) {
                    throw new Error('No options passed to Waypoint constructor');
                }
                if (!options.element) {
                    throw new Error('No element option passed to Waypoint constructor');
                }
                if (!options.handler) {
                    throw new Error('No handler option passed to Waypoint constructor');
                }

                this.key = 'waypoint-' + keyCounter;
                this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options);
                this.element = this.options.element;
                this.adapter = new Waypoint.Adapter(this.element);
                this.callback = options.handler;
                this.axis = this.options.horizontal ? 'horizontal' : 'vertical';
                this.enabled = this.options.enabled;
                this.triggerPoint = null;
                this.group = Waypoint.Group.findOrCreate({
                    name: this.options.group,
                    axis: this.axis
                });

                this.context = Waypoint.Context.findOrCreateByElement(this.options.context);

                if (Waypoint.offsetAliases[this.options.offset]) {
                    this.options.offset = Waypoint.offsetAliases[this.options.offset];
                }
                this.group.add(this);
                this.context.add(this);
                allWaypoints[this.key] = this;
                keyCounter += 1;
            }

            /* Private */
            Waypoint.prototype.queueTrigger = function (direction) {
                this.group.queueTrigger(this, direction);
            };

            /* Private */
            Waypoint.prototype.trigger = function (args) {
                if (!this.enabled) {
                    return;
                }
                if (this.callback) {
                    this.callback.apply(this, args);
                }
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/destroy */
            Waypoint.prototype.destroy = function () {
                this.context.remove(this);
                this.group.remove(this);
                delete allWaypoints[this.key];
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/disable */
            Waypoint.prototype.disable = function () {
                this.enabled = false;
                return this;
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/enable */
            Waypoint.prototype.enable = function () {
                this.context.refresh();
                this.enabled = true;
                return this;
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/next */
            Waypoint.prototype.next = function () {
                return this.group.next(this);
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/previous */
            Waypoint.prototype.previous = function () {
                return this.group.previous(this);
            };

            /* Private */
            Waypoint.invokeAll = function (method) {
                var allWaypointsArray = [];
                for (var waypointKey in allWaypoints) {
                    allWaypointsArray.push(allWaypoints[waypointKey]);
                }
                for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
                    allWaypointsArray[i][method]();
                }
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/destroy-all */
            Waypoint.destroyAll = function () {
                Waypoint.invokeAll('destroy');
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/disable-all */
            Waypoint.disableAll = function () {
                Waypoint.invokeAll('disable');
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/enable-all */
            Waypoint.enableAll = function () {
                Waypoint.Context.refreshAll();
                for (var waypointKey in allWaypoints) {
                    allWaypoints[waypointKey].enabled = true;
                }
                return this;
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/refresh-all */
            Waypoint.refreshAll = function () {
                Waypoint.Context.refreshAll();
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/viewport-height */
            Waypoint.viewportHeight = function () {
                return window.innerHeight || document.documentElement.clientHeight;
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/viewport-width */
            Waypoint.viewportWidth = function () {
                return document.documentElement.clientWidth;
            };

            Waypoint.adapters = [];

            Waypoint.defaults = {
                context: window,
                continuous: true,
                enabled: true,
                group: 'default',
                horizontal: false,
                offset: 0
            };


            Waypoint.offsetAliases = {
                'bottom-in-view': function bottomInView() {
                    return this.context.innerHeight() - this.adapter.outerHeight();
                },
                'right-in-view': function rightInView() {
                    return this.context.innerWidth() - this.adapter.outerWidth();
                }
            };


            window.Waypoint = Waypoint;
        })();
        (function () {
            'use strict';

            function requestAnimationFrameShim(callback) {
                window.setTimeout(callback, 1000 / 60);
            }

            var keyCounter = 0;
            var contexts = {};
            var Waypoint = window.Waypoint;
            var oldWindowLoad = window.onload;

            /* http://imakewebthings.com/waypoints/api/context */
            function Context(element) {
                this.element = element;
                this.Adapter = Waypoint.Adapter;
                this.adapter = new this.Adapter(element);
                this.key = 'waypoint-context-' + keyCounter;
                this.didScroll = false;
                this.didResize = false;
                this.oldScroll = {
                    x: this.adapter.scrollLeft(),
                    y: this.adapter.scrollTop()
                };

                this.waypoints = {
                    vertical: {},
                    horizontal: {}
                };


                element.waypointContextKey = this.key;
                contexts[element.waypointContextKey] = this;
                keyCounter += 1;
                if (!Waypoint.windowContext) {
                    Waypoint.windowContext = true;
                    Waypoint.windowContext = new Context(window);
                }

                this.createThrottledScrollHandler();
                this.createThrottledResizeHandler();
            }

            /* Private */
            Context.prototype.add = function (waypoint) {
                var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical';
                this.waypoints[axis][waypoint.key] = waypoint;
                this.refresh();
            };

            /* Private */
            Context.prototype.checkEmpty = function () {
                var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal);
                var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical);
                var isWindow = this.element == this.element.window;
                if (horizontalEmpty && verticalEmpty && !isWindow) {
                    this.adapter.off('.waypoints');
                    delete contexts[this.key];
                }
            };

            /* Private */
            Context.prototype.createThrottledResizeHandler = function () {
                var self = this;

                function resizeHandler() {
                    self.handleResize();
                    self.didResize = false;
                }

                this.adapter.on('resize.waypoints', function () {
                    if (!self.didResize) {
                        self.didResize = true;
                        Waypoint.requestAnimationFrame(resizeHandler);
                    }
                });
            };

            /* Private */
            Context.prototype.createThrottledScrollHandler = function () {
                var self = this;
                function scrollHandler() {
                    self.handleScroll();
                    self.didScroll = false;
                }

                this.adapter.on('scroll.waypoints', function () {
                    if (!self.didScroll || Waypoint.isTouch) {
                        self.didScroll = true;
                        Waypoint.requestAnimationFrame(scrollHandler);
                    }
                });
            };

            /* Private */
            Context.prototype.handleResize = function () {
                Waypoint.Context.refreshAll();
            };

            /* Private */
            Context.prototype.handleScroll = function () {
                var triggeredGroups = {};
                var axes = {
                    horizontal: {
                        newScroll: this.adapter.scrollLeft(),
                        oldScroll: this.oldScroll.x,
                        forward: 'right',
                        backward: 'left'
                    },

                    vertical: {
                        newScroll: this.adapter.scrollTop(),
                        oldScroll: this.oldScroll.y,
                        forward: 'down',
                        backward: 'up'
                    }
                };



                for (var axisKey in axes) {
                    var axis = axes[axisKey];
                    var isForward = axis.newScroll > axis.oldScroll;
                    var direction = isForward ? axis.forward : axis.backward;

                    for (var waypointKey in this.waypoints[axisKey]) {
                        var waypoint = this.waypoints[axisKey][waypointKey];
                        if (waypoint.triggerPoint === null) {
                            continue;
                        }
                        var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint;
                        var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint;
                        var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint;
                        var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint;
                        if (crossedForward || crossedBackward) {
                            waypoint.queueTrigger(direction);
                            triggeredGroups[waypoint.group.id] = waypoint.group;
                        }
                    }
                }

                for (var groupKey in triggeredGroups) {
                    triggeredGroups[groupKey].flushTriggers();
                }

                this.oldScroll = {
                    x: axes.horizontal.newScroll,
                    y: axes.vertical.newScroll
                };

            };

            /* Private */
            Context.prototype.innerHeight = function () {
                /*eslint-disable eqeqeq */
                if (this.element == this.element.window) {
                    return Waypoint.viewportHeight();
                }
                /*eslint-enable eqeqeq */
                return this.adapter.innerHeight();
            };

            /* Private */
            Context.prototype.remove = function (waypoint) {
                delete this.waypoints[waypoint.axis][waypoint.key];
                this.checkEmpty();
            };

            /* Private */
            Context.prototype.innerWidth = function () {
                /*eslint-disable eqeqeq */
                if (this.element == this.element.window) {
                    return Waypoint.viewportWidth();
                }
                /*eslint-enable eqeqeq */
                return this.adapter.innerWidth();
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/context-destroy */
            Context.prototype.destroy = function () {
                var allWaypoints = [];
                for (var axis in this.waypoints) {
                    for (var waypointKey in this.waypoints[axis]) {
                        allWaypoints.push(this.waypoints[axis][waypointKey]);
                    }
                }
                for (var i = 0, end = allWaypoints.length; i < end; i++) {
                    allWaypoints[i].destroy();
                }
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/context-refresh */
            Context.prototype.refresh = function () {
                /*eslint-disable eqeqeq */
                var isWindow = this.element == this.element.window;
                /*eslint-enable eqeqeq */
                var contextOffset = isWindow ? undefined : this.adapter.offset();
                var triggeredGroups = {};
                var axes;

                this.handleScroll();
                axes = {
                    horizontal: {
                        contextOffset: isWindow ? 0 : contextOffset.left,
                        contextScroll: isWindow ? 0 : this.oldScroll.x,
                        contextDimension: this.innerWidth(),
                        oldScroll: this.oldScroll.x,
                        forward: 'right',
                        backward: 'left',
                        offsetProp: 'left'
                    },

                    vertical: {
                        contextOffset: isWindow ? 0 : contextOffset.top,
                        contextScroll: isWindow ? 0 : this.oldScroll.y,
                        contextDimension: this.innerHeight(),
                        oldScroll: this.oldScroll.y,
                        forward: 'down',
                        backward: 'up',
                        offsetProp: 'top'
                    }
                };



                for (var axisKey in axes) {
                    var axis = axes[axisKey];
                    for (var waypointKey in this.waypoints[axisKey]) {
                        var waypoint = this.waypoints[axisKey][waypointKey];
                        var adjustment = waypoint.options.offset;
                        var oldTriggerPoint = waypoint.triggerPoint;
                        var elementOffset = 0;
                        var freshWaypoint = oldTriggerPoint == null;
                        var contextModifier, wasBeforeScroll, nowAfterScroll;
                        var triggeredBackward, triggeredForward;

                        if (waypoint.element !== waypoint.element.window) {
                            elementOffset = waypoint.adapter.offset()[axis.offsetProp];
                        }

                        if (typeof adjustment === 'function') {
                            adjustment = adjustment.apply(waypoint);
                        } else
                            if (typeof adjustment === 'string') {
                                adjustment = parseFloat(adjustment);
                                if (waypoint.options.offset.indexOf('%') > -1) {
                                    adjustment = Math.ceil(axis.contextDimension * adjustment / 100);
                                }
                            }

                        contextModifier = axis.contextScroll - axis.contextOffset;
                        waypoint.triggerPoint = Math.floor(elementOffset + contextModifier - adjustment);
                        wasBeforeScroll = oldTriggerPoint < axis.oldScroll;
                        nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll;
                        triggeredBackward = wasBeforeScroll && nowAfterScroll;
                        triggeredForward = !wasBeforeScroll && !nowAfterScroll;

                        if (!freshWaypoint && triggeredBackward) {
                            waypoint.queueTrigger(axis.backward);
                            triggeredGroups[waypoint.group.id] = waypoint.group;
                        } else
                            if (!freshWaypoint && triggeredForward) {
                                waypoint.queueTrigger(axis.forward);
                                triggeredGroups[waypoint.group.id] = waypoint.group;
                            } else
                                if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
                                    waypoint.queueTrigger(axis.forward);
                                    triggeredGroups[waypoint.group.id] = waypoint.group;
                                }
                    }
                }

                Waypoint.requestAnimationFrame(function () {
                    for (var groupKey in triggeredGroups) {
                        triggeredGroups[groupKey].flushTriggers();
                    }
                });

                return this;
            };

            /* Private */
            Context.findOrCreateByElement = function (element) {
                return Context.findByElement(element) || new Context(element);
            };

            /* Private */
            Context.refreshAll = function () {
                for (var contextId in contexts) {
                    contexts[contextId].refresh();
                }
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/context-find-by-element */
            Context.findByElement = function (element) {
                return contexts[element.waypointContextKey];
            };

            window.onload = function () {
                if (oldWindowLoad) {
                    oldWindowLoad();
                }
                Context.refreshAll();
            };


            Waypoint.requestAnimationFrame = function (callback) {
                var requestFn = window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    requestAnimationFrameShim;
                requestFn.call(window, callback);
            };
            Waypoint.Context = Context;
        })();
        (function () {
            'use strict';

            function byTriggerPoint(a, b) {
                return a.triggerPoint - b.triggerPoint;
            }

            function byReverseTriggerPoint(a, b) {
                return b.triggerPoint - a.triggerPoint;
            }

            var groups = {
                vertical: {},
                horizontal: {}
            };

            var Waypoint = window.Waypoint;

            /* http://imakewebthings.com/waypoints/api/group */
            function Group(options) {
                this.name = options.name;
                this.axis = options.axis;
                this.id = this.name + '-' + this.axis;
                this.waypoints = [];
                this.clearTriggerQueues();
                groups[this.axis][this.name] = this;
            }

            /* Private */
            Group.prototype.add = function (waypoint) {
                this.waypoints.push(waypoint);
            };

            /* Private */
            Group.prototype.clearTriggerQueues = function () {
                this.triggerQueues = {
                    up: [],
                    down: [],
                    left: [],
                    right: []
                };

            };

            /* Private */
            Group.prototype.flushTriggers = function () {
                for (var direction in this.triggerQueues) {
                    var waypoints = this.triggerQueues[direction];
                    var reverse = direction === 'up' || direction === 'left';
                    waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint);
                    for (var i = 0, end = waypoints.length; i < end; i += 1) {
                        var waypoint = waypoints[i];
                        if (waypoint.options.continuous || i === waypoints.length - 1) {
                            waypoint.trigger([direction]);
                        }
                    }
                }
                this.clearTriggerQueues();
            };

            /* Private */
            Group.prototype.next = function (waypoint) {
                this.waypoints.sort(byTriggerPoint);
                var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
                var isLast = index === this.waypoints.length - 1;
                return isLast ? null : this.waypoints[index + 1];
            };

            /* Private */
            Group.prototype.previous = function (waypoint) {
                this.waypoints.sort(byTriggerPoint);
                var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
                return index ? this.waypoints[index - 1] : null;
            };

            /* Private */
            Group.prototype.queueTrigger = function (waypoint, direction) {
                this.triggerQueues[direction].push(waypoint);
            };

            /* Private */
            Group.prototype.remove = function (waypoint) {
                var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
                if (index > -1) {
                    this.waypoints.splice(index, 1);
                }
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/first */
            Group.prototype.first = function () {
                return this.waypoints[0];
            };

            /* Public */
            /* http://imakewebthings.com/waypoints/api/last */
            Group.prototype.last = function () {
                return this.waypoints[this.waypoints.length - 1];
            };

            /* Private */
            Group.findOrCreate = function (options) {
                return groups[options.axis][options.name] || new Group(options);
            };

            Waypoint.Group = Group;
        })();
        (function () {
            'use strict';

            var $ = window.jQuery;
            var Waypoint = window.Waypoint;

            function JQueryAdapter(element) {
                this.$element = $(element);
            }

            $.each([
                'innerHeight',
                'innerWidth',
                'off',
                'offset',
                'on',
                'outerHeight',
                'outerWidth',
                'scrollLeft',
                'scrollTop'],
                function (i, method) {
                    JQueryAdapter.prototype[method] = function () {
                        var args = Array.prototype.slice.call(arguments);
                        return this.$element[method].apply(this.$element, args);
                    };
                });

            $.each([
                'extend',
                'inArray',
                'isEmptyObject'],
                function (i, method) {
                    JQueryAdapter[method] = $[method];
                });

            Waypoint.adapters.push({
                name: 'jquery',
                Adapter: JQueryAdapter
            });

            Waypoint.Adapter = JQueryAdapter;
        })();
        (function () {
            'use strict';

            var Waypoint = window.Waypoint;

            function createExtension(framework) {
                return function () {
                    var waypoints = [];
                    var overrides = arguments[0];

                    if (framework.isFunction(arguments[0])) {
                        overrides = framework.extend({}, arguments[1]);
                        overrides.handler = arguments[0];
                    }

                    this.each(function () {
                        var options = framework.extend({}, overrides, {
                            element: this
                        });

                        if (typeof options.context === 'string') {
                            options.context = framework(this).closest(options.context)[0];
                        }
                        waypoints.push(new Waypoint(options));
                    });

                    return waypoints;
                };
            }

            if (window.jQuery) {
                window.jQuery.fn.waypoint = createExtension(window.jQuery);
            }
            if (window.Zepto) {
                window.Zepto.fn.waypoint = createExtension(window.Zepto);
            }
        })();

    }, {}]
}, {}, [3]);