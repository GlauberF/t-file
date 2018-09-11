(function (window, angular, $) {
    'use strict';
    angular.module('FileManagerApp', ['pascalprecht.translate', 'ngFileUpload']);

    /**
     * jQuery inits
     */
    $(window.document).on('shown.bs.modal', '.modal', function () {
        window.setTimeout(function () {
            $('[autofocus]', this).focus();
        }.bind(this), 100);
    });

    $(window.document).on('click', function () {
        $('#context-menu').hide();
    });

    function getCordinates(e) {
        var m_posx = 0, m_posy = 0, e_posx = 0, e_posy = 0;
        if (!e) { e = window.event; }
        if (e.pageX || e.pageY) {
            m_posx = e.pageX;
            m_posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            m_posx = e.clientX + document.body.scrollLeft
                + document.documentElement.scrollLeft;
            m_posy = e.clientY + document.body.scrollTop
                + document.documentElement.scrollTop;
        }
        var obj = $("#fileManagerParent"); //fuse specific
        if(obj.length){
            obj = obj.get(0);
            if (obj.offsetParent) {
                do {
                    e_posx += obj.offsetLeft;
                    e_posy += obj.offsetTop;
                } while (obj = obj.offsetParent);
            }
        }

        return {
            x: (m_posx - e_posx),
            y: (m_posy - e_posy)
        }
    }

    $(window.document).on('contextmenu', '.main-navigation .table-files tr.item-list:has("td"), .item-list', function (e) {
        var menu = $('#context-menu');

        var cords = getCordinates(e);

        menu.hide().css({
            left: cords.x,
            top: cords.y
        }).show();
        e.preventDefault();
    });

    if (!Array.prototype.find) {
        Array.prototype.find = function (predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        };
    }

})(window, angular, jQuery);
