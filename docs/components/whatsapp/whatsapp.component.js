/* jshint esversion: 6 */

import Component from '../component.js';

class WhatsappComponent extends Component {

    static get styleUrl() {
        return 'components/whatsapp/whatsapp.component.css';
    }

    static get templateUrl() {
        return 'components/whatsapp/whatsapp.component.html';
    }

    static get observedAttributes() {
        return [];
    }

}

window.customElements.define('whatsapp-component', WhatsappComponent);