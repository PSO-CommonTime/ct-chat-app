'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
*   --------------------------------------------------
*   CT Toast Menu Web Component V1
*   --------------------------------------------------
*
*   This will display a toast menu that is designed
*   to be a small menu for holding action buttons.
*
*   --------------------------------------------------
*/

(function () {

    /**
     * CTToastMenu
     * @container
     */
    var CTToastMenu = function (_HTMLElement) {
        _inherits(CTToastMenu, _HTMLElement);

        // Default Component methods

        function CTToastMenu(self) {
            var _this, _ret;

            _classCallCheck(this, CTToastMenu);

            self = (_this = _possibleConstructorReturn(this, (CTToastMenu.__proto__ || Object.getPrototypeOf(CTToastMenu)).call(this, self)), _this);
            //self._rendered = false;
            return _ret = self, _possibleConstructorReturn(_this, _ret);
        }

        _createClass(CTToastMenu, [{
            key: 'connectedCallback',
            value: function connectedCallback() {
                //if(!this._rendered)
                this._render();

                //this._rendered = true;
            }

            // Custom Component Methods (for this component only)

        }, {
            key: '_render',
            value: function _render() {
                //this.direction = this.getAttribute('direction');
                this.opened = false;

                var container = document.createElement('div');
                container.className = 'toastMenuBG';
                container.style.display = 'none';

                var menu = document.createElement('div');
                menu.className = 'toastMenu';

                while (this.childNodes.length !== 0) {
                    menu.appendChild(this.childNodes[0]);
                }

                container.appendChild(menu);
                this.appendChild(container);
            }

            /**
             * Toggles the page opened and closed based on the value
             * of the this.opened property (initially set to false)
             */

        }, {
            key: 'toggle',
            value: function toggle() {
                var toastMenu = document.getElementsByTagName('ct-toast-menu')[0];

                if (toastMenu.opened) {
                    toastMenu.opened = false;
                    toastMenu.firstChild.removeEventListener('click', toastMenu.toggle);
                    toastMenu.firstChild.style.display = 'none';
                } else {
                    toastMenu.opened = true;
                    toastMenu.firstChild.addEventListener('click', toastMenu.toggle);
                    toastMenu.firstChild.style.display = 'flex';
                }
            }
        }]);

        return CTToastMenu;
    }(HTMLElement);

    // New V1 component definition


    customElements.define('ct-toast-menu', CTToastMenu);
})();