/* jshint esversion: 6 */

import Component from '../component.js';

class ClaimWhatsappComponent extends Component {

    static get styleUrl() {
        return 'components/claim-whatsapp/claim-whatsapp.component.css';
    }

    static get templateUrl() {
        return 'components/claim-whatsapp/claim-whatsapp.component.html';
    }

    static get observedAttributes() {
        return ['primary-icon-lg', 'rimani-sempre-in-con'];
    }

}

window.customElements.define('claim-whatsapp-component', ClaimWhatsappComponent);