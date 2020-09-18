import React from 'react';
import { Toast } from 'react-bootstrap';

function ToastWithMessage({ show, setShow, message }) {
    return (
        <Toast onClose={() => setShow(false)} show={show} delay={2000} autohide
            style={{ maxWidth: 'none' }}>
            <Toast.Header className="bg-danger text-light border-bottom-0">
                <span className="mr-auto">{message}</span>
            </Toast.Header>
        </Toast>
    );
}

export default ToastWithMessage;