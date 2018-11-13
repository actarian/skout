/* jshint esversion: 6 */

import Component from '../component.js';

class PrimaryIconLgComponent extends Component {

    static get styleUrl() {
        return 'components/primary-icon-lg/primary-icon-lg.component.css';
    }

    static get templateUrl() {
        return 'components/primary-icon-lg/primary-icon-lg.component.html';
    }

    static get observedAttributes() {
        return ['label-icon-left'];
    }

}

window.customElements.define('primary-icon-lg-component', PrimaryIconLgComponent);