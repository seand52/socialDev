import React, { Component } from 'react'
import { Container, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'mdbreact'
import MeetingAttendees from '../meetingAttendees/MeetingAttendees'


class MeetingAttendeesModal extends Component {
    state = {
        modal: false,
    }

    toggle = () => {
        this.setState({

            modal: !this.state.modal

        });
    }


    render() {

        const { state: { modal }, props: { meetingId }, toggle } = this

        return (
            <Container>
                <Button color="blue" onClick={toggle}>View Attendees</Button>
                <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle}>View Attendees</ModalHeader>
                    <ModalBody>
                        <MeetingAttendees clickName={this.clickProfileName} meetingId={meetingId} toggle={toggle}/>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggle}>Close</Button>{' '}
                    </ModalFooter>
                </Modal>
            </Container>
        );
    }
}

export default MeetingAttendeesModal