import React, { Component } from 'react'
import { Container, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'mdbreact'
import logic from '../../logic'
import { withRouter, Link } from 'react-router-dom'
import './chatroom.css'
class ChatRooms extends Component {
    state = {
        modal: false,
        conversations: false,
        totalPending: 0,
    }

    toggle = () => {
        this.setState({

            modal: !this.state.modal

        });
    }

    componentDidMount() {

        return logic.listConversations()
            .then(res => {
                let total = 0
                res.forEach(item => total = item[1].pendingMessages + total )
                this.setState({ conversations: res, totalPending: total  })
            })
    }


    render() {

        const { state: { modal, conversations, totalPending }, props: {toggle} } = this

        return (
            <Container>
                <Button color="blue" onClick={toggle}>View Chats ({totalPending}) </Button>
                <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle}>Active chats</ModalHeader>
                    <ModalBody>
                        {conversations && conversations.map((conversation, index) => {
                            return <div key={index} className="conversation-card">
                                <img src={conversation[0].profileImage} />
                                <Link to={`/messages/${conversation[1].conversationId}/${conversation[0].id}`}>{conversation[0].username}</Link>
                                <span className="badge badge-primary">{conversation[1].pendingMessages}</span>
                            </div>
                        })}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggle}>Close</Button>{' '}
                    </ModalFooter>
                </Modal>
            </Container>
        );
    }
}

export default withRouter(ChatRooms)