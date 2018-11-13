/* jshint esversion: 6 */

import Component from '../component.js';

class PrimaryMdComponent extends Component {

    static get styleUrl() {
        return 'components/primary-md/primary-md.component.css';
    }

    static get templateUrl() {
        return 'components/primary-md/primary-md.component.html';
    }

    static get observedAttributes() {
        return ['label'];
    }

}

window.customElements.define('primary-md-component', PrimaryMdComponent);