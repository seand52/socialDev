import React, { Component } from 'react'
import * as ReactDOM from 'react-dom';
import './chatpage.css'
import logic from '../../logic'
import { withRouter, Link } from 'react-router-dom'
import Moment from 'react-moment'
import Error from '../error/Error'
class ChatPage extends Component {

    state = {
        message: '',
        receiverName: '',
        messages: false,
        conversations: false,
        totalPendingMessages: 0,
        receiverImage: '',
        error: null

    }

    componentDidMount() {

        try {
            if (this.props.id && this.props.receiverId) {
                logic.findConversation(this.props.receiverId)
                    .then(res => {
                        const receiver = res.members.find(item => item.id !== this.props.userId)
                        this.setState({ receiverName: receiver.username, receiverImage: receiver.profileImage, error: null })
                    })
                    .then(() => logic.listConversations())
                    .then(res => {
                        let total = 0
                        res.forEach(item => total = item[1].pendingMessages + total)

                        this.props.pendingNotifications(total)


                        this.setState({ conversations: res, error: null })
                    })
                    .then(() => logic.listMessages(this.props.receiverId))
                    .then(res => {
                        this.setState({ messages: [...res.messages], error: null }, () => {
                            // this.interval = setInterval(() => this.refresh(), 2000)
                            this.scrollToBottom()
                        })
                    })

                    .catch(err => this.setState({ error: err.message }))
            }
        } catch (err) {
            this.setState({ error: err.message })
        }



    }

    // refresh() {
    //     clearInterval(this.interval)
    //     try {

    //         if (this.props.id && this.props.receiverId) {
    //             logic.listMessages(this.props.receiverId)
    //                 .then(res => {
    //                     if (this.state.messages.length !== res.messages.length) this.setState({ messages: [...res.messages], erorr: null }, () => this.scrollToBottom())
    //                 })
    //                 .then(() => this.interval = setInterval(() => this.refresh(), 2000))
    //                 .catch(err => { this.setState({ error: err.message }) })
    //         }

    //     } catch (err) {
    //         this.setState({ error: err.message })
    //     }

    // }


    componentWillReceiveProps(nextProps) {
        try {
            if (nextProps.receiverId !== this.props.receiverId) {
                if (nextProps.id && nextProps.receiverId) {

                    logic.findConversation(nextProps.receiverId)
                        .then(res => {
                            const receiver = res.members.find(item => item.id !== nextProps.userId)
                            this.setState({ receiverName: receiver.username, receiverImage: receiver.profileImage, error: null })
                        })
                        .then(() => logic.listMessages(nextProps.receiverId))
                        .then(res => {
                            this.setState({ messages: [...res.messages], error: null }, () => this.scrollToBottom())
                        })
                        .then(() => logic.listConversations())
                        .then(res => {
                            let total = 0
                            res.forEach(item => total = item[1].pendingMessages + total)
                            this.props.pendingNotifications(total)
                            this.setState({ conversations: res, totalPendingMessages: total, error: null })
                        })
                        .catch(err => this.setState({ error: err.message }))


                }
            }
        } catch (err) {
            this.setState({ error: err.message })
        }

    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    handleSendMessage = (event) => {
        event.preventDefault()
        this.props.pendingNotifications(this.state.totalPendingMessages)
        try {
            return logic.sendMessage(this.props.userId, this.props.receiverId, this.state.message)
                .then(() => logic.listMessages(this.props.receiverId))
                .then(res => this.setState({ messages: res.messages, message: '', error: null }))
                .then(() => logic.listConversations())
                .then(res => {
                    let total = 0
                    res.forEach(item => total = item[1].pendingMessages + total)
                    this.props.pendingNotifications(total)
                    this.setState({ conversations: res, totalPendingMessages: total, error: null })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }


    scrollToBottom = () => {
        const { messageList } = this.refs;
        const scrollHeight = messageList.scrollHeight;
        const height = messageList.clientHeight;
        const maxScrollTop = scrollHeight - height;
        ReactDOM.findDOMNode(messageList).scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }

    onMessageChange = (event) => {
        const message = event.target.value

        this.setState({ message })
    }

    renderMessageTicks = (message) => {
        if (message.status === 'read') return <div><i className="fa fa-check" aria-hidden="true"></i><i className="fa fa-check" aria-hidden="true"></i></div>
        else return <i className="fa fa-check" aria-hidden="true"></i>
    }

    render() {

        const { messages, conversations, receiverImage, error } = this.state
        return <section className="chat">
            {error && <Error message={error} />}
            <div className="conversation-page-container row">

                <div className="conversations-list col-lg-4 col-xs-12">
                    <h2>Chats</h2>
                    {conversations && conversations.sort((a, b) => b[1].lastMessage - a[1].lastMessage).map((conversation, index) => {
                        return <div key={index} className={(this.state.receiverName === conversation[0].username) ? "conversation-card-chatroom-selected" : "conversation-card-chatroom"}>
                            <img src={conversation[0].profileImage} alt="profile" />
                            <Link to={`/messages/${conversation[1].conversationId}/${conversation[0].id}`}>{conversation[0].username}</Link>
                            <span className="badge light-blue badge-light-blue badge-pill">{conversation[1].pendingMessages}</span>
                        </div>
                    })}
                </div>
                <div className="container-chat-and-input col-lg-6 col-xs-12">
                    <div className="container-chat">
                        <div className="title">
                            <h2><img className="profile-image-chat" alt="profile" src={receiverImage} /> <Link to={`/profile/${this.props.receiverId}`}>{this.state.receiverName}</Link></h2>
                        </div>
                        <div id="messages" ref="messageList">
                            {messages && messages.map((message, index) => {

                                if (message.sender != this.props.userId) {
                                    return <div key={index} className="msg-left">
                                        <div className="message-body "> {message.text}</div>
                                        <div className="message-date">  <Moment format="DD/MM/YYYY HH:mm">{message.sent}</Moment>

                                        </div>

                                    </div>
                                } else {
                                    return <div key={index} className="msg-right">
                                        <div className="message-body"> {message.text}</div>
                                        <div className="message-date-right">  <Moment format="DD/MM/YYYY HH:mm">{message.sent}</Moment></div>
                                        {this.renderMessageTicks(message)}
                                    </div>
                                }
                            }
                            )}
                        </div>

                    </div>
                    <div className="chatbox col-12">
                        <form className="chat-input-form" onSubmit={this.handleSendMessage}>
                            <div className="chat-bottom-area row">
                                <div className="col-9">
                                    <input className="chat-input" onChange={this.onMessageChange} value={this.state.message} placeholder="Type your message and hit enter!" id="chat-input" />
                                </div>
                                <div className="col-3">
                                    <button className="chat-send-button" type="submit">Send</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            </div>

        </section>
    }

}

export default withRouter(ChatPage)

