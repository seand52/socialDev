import React, { Component } from 'react'
import { Container, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'mdbreact'
import './modalpage.css'
import UpdateProfileForm from '../update-profile-form/UpdateProfileForm'



class Modalpage extends Component {
    state = {
        modal: false,



    }

    toggle = () => {

        this.setState({

            modal: !this.state.modal

        });
    }


    render() {

        const { state: { modal }, props: { user, updateProfile }, toggle } = this

        return (
            <Container>
                <div className="edit-button-container">
                    <button className="edit-profile-button" onClick={toggle}><i className="fa fa-edit" aria-hidden="true"></i> Edit profile</button>
                </div>
                <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle}>Edit Profile</ModalHeader>
                    <ModalBody>
                        <UpdateProfileForm toggleModal={this.toggle} user={user} updateProfile={updateProfile} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggle}>Close</Button>{' '}
                    </ModalFooter>
                </Modal>
            </Container>
        );
    }
}

export default Modalpage