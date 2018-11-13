/* jshint esversion: 6 */

import Component from '../component.js';

class CrosshairComponent extends Component {

    static get styleUrl() {
        return 'components/crosshair/crosshair.component.css';
    }

    static get templateUrl() {
        return 'components/crosshair/crosshair.component.html';
    }

    static get observedAttributes() {
        return [];
    }

}

window.customElements.define('crosshair-component', CrosshairComponent);