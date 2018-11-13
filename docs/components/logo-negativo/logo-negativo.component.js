/* jshint esversion: 6 */

import Component from '../component.js';

class LogoNegativoComponent extends Component {

    static get styleUrl() {
        return 'components/logo-negativo/logo-negativo.component.css';
    }

    static get templateUrl() {
        return 'components/logo-negativo/logo-negativo.component.html';
    }

    static get observedAttributes() {
        return [];
    }

}

window.customElements.define('logo-negativo-component', LogoNegativoComponent);