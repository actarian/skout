/* jshint esversion: 6 */

import Component from '../component.js';

class BtnIconGhostComponent extends Component {

    static get styleUrl() {
        return 'components/btn-icon-ghost/btn-icon-ghost.component.css';
    }

    static get templateUrl() {
        return 'components/btn-icon-ghost/btn-icon-ghost.component.html';
    }

    static get observedAttributes() {
        return ['icon'];
    }

}

window.customElements.define('btn-icon-ghost-component', BtnIconGhostComponent);