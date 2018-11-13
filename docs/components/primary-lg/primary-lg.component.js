/* jshint esversion: 6 */

import Component from '../component.js';

class PrimaryLgComponent extends Component {

    static get styleUrl() {
        return 'components/primary-lg/primary-lg.component.css';
    }

    static get templateUrl() {
        return 'components/primary-lg/primary-lg.component.html';
    }

    static get observedAttributes() {
        return ['label'];
    }

}

window.customElements.define('primary-lg-component', PrimaryLgComponent);