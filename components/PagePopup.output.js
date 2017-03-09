'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
*   --------------------------------------------------
*   CT Page Popup Web Component V1
*   --------------------------------------------------
*
*   This will display a popup that is the same size
*   as the page, overlaying over the top of the
*   current page. Similar to native iOS views.
*
*   --------------------------------------------------
*/

(function () {

    /**
     * CTPagePopup
     * @attribute {string} [Direction]
     * @attribute {string} [Callback]
     * @container
     */
    var CTPagePopup = function (_HTMLElement) {
        _inherits(CTPagePopup, _HTMLElement);

        // Default Component methods

        function CTPagePopup(self) {
            var _this, _ret;

            _classCallCheck(this, CTPagePopup);

            self = (_this = _possibleConstructorReturn(this, (CTPagePopup.__proto__ || Object.getPrototypeOf(CTPagePopup)).call(this, self)), _this);
            return _ret = self, _possibleConstructorReturn(_this, _ret);
        }

        _createClass(CTPagePopup, [{
            key: 'connectedCallback',
            value: function connectedCallback() {
                //if(!this._rendered)
                this._render();
            }

            // Custom Component Methods (for this component only)

        }, {
            key: '_render',
            value: function _render() {
                //this._rendered = true;
                this.callbackFunction = this.getAttribute('callback');

                var direction = this.getAttribute('direction');

                if (!direction) {
                    direction = 'up';
                }

                var container = document.createElement('div');
                container.className = 'bg ' + direction;

                var topRow = document.createElement('div');
                topRow.className = 'topRow';

                var closeBtn = document.createElement('p');
                closeBtn.onclick = this.hide;
                topRow.appendChild(closeBtn);

                container.appendChild(topRow);

                while (this.childNodes.length !== 0) {
                    container.appendChild(this.childNodes[0]);
                }

                this.appendChild(container);
                this.opened = false;

                // Check if we're on the free version of CTI and
                // correctly offset the position for the banner
                var freeVersion = document.querySelector('.grace-warning');
                if (freeVersion) {
                    this.style.top = '40px';
                }
            }

            /**
             * Shows the page
             */

        }, {
            key: 'show',
            value: function show(e) {
                if (document.querySelector('ct-context-menu').opened) {
                    document.querySelector('.page-container').style.position = 'static';
                }

                this.querySelector('.bg').style.display = 'initial';
            }

            /**
             * Hide the page opened
             */

        }, {
            key: 'hide',
            value: function hide(e) {
                if (e) {
                    e.stopImmediatePropagation(e);
                }

                document.querySelector('.page-container').style.position = 'absolute';
                var popup = this.parentElement.parentElement.parentElement;

                this.parentElement.parentElement.style.display = 'none';

                // Executes any callback function that has been
                // passed into the page popup
                if (popup.callbackFunction) {
                    if (popup.callbackFunction.indexOf('.' > -1)) {
                        var ns = popup.callbackFunction.split('.');
                        var func = ns.pop();
                        var context = window;

                        for (var i = 0; i < ns.length; i++) {
                            context = context[ns[i]];
                        }

                        context[func].apply(context);
                    } else {
                        window[popup.callbackFunction]();
                    }
                }
            }
        }]);

        return CTPagePopup;
    }(HTMLElement);

    // New V1 component definition


    customElements.define('ct-page-popup', CTPagePopup);
})();