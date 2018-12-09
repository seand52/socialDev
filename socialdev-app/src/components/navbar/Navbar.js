import React from "react";
import { Navbar, NavbarBrand, NavbarNav, NavItem, NavbarToggler, Collapse } from "mdbreact";
import { withRouter, Link } from 'react-router-dom'
import logic from '../../logic'
import './navbar.css'

class Navbarpage extends React.Component {
    state = {
        isOpen: false,
        selected: {
            home: false,
            explore: false,
            profile: false,

        },
        pendingNotifications: 0,
        sendToConversation: false,
        name: ''

    };


    onLogoClick = () => this.props.history.push('/home')

    onHomeClick = () => {
        if (this.state.isOpen) this.setState({ isOpen: !this.state.isOpen }, () => this.props.history.push('/home'))
        else this.props.history.push('/home')
    }

    onExploreClick = () => {
        if (this.state.isOpen) this.setState({ isOpen: !this.state.isOpen }, () => this.props.history.push('/explore'))
        else this.props.history.push('/explore')
    }


    onProfileClick = () => {
        if (this.state.isOpen) this.setState({ isOpen: !this.state.isOpen }, () => this.props.history.push(`/profile/${this.props.userId}`))
        else this.props.history.push(`/profile/${this.props.userId}`)

    }

    handleLogout = () => {
        logic.logout()
        this.props.history.push('/')
        this.setState({ name: '' }, () => this.props.history.push('/')
      
        )
        window.location.reload(true)
    }





    renderMessageIcon = () => {
        const { sendToConversation, pendingNotifications } = this.state
        if (sendToConversation) {
            if (sendToConversation.length && pendingNotifications !== 0) {
                return <Link to={`/messages/${sendToConversation[0][1].conversationId}/${sendToConversation[0][0].id}`}><button className='navbar__button'><div className="message-notification-container"><i className="fa fa-envelope" aria-hidden="true"></i><span className="badge badge-danger">{pendingNotifications}</span></div></button></Link>
            }

            else if (sendToConversation.length && pendingNotifications === 0) {
                return <Link to={`/messages/${sendToConversation[0][1].conversationId}/${sendToConversation[0][0].id}`}><button className='navbar__button'><div className="message-notification-container"><i className="fa fa-envelope" aria-hidden="true"></i></div></button></Link>
            }
        }

    }

    componentDidMount() {
        debugger
        logic.listConversations()
            .then(res => {
                let total = 0
                res.forEach(item => total = item[1].pendingMessages + total)
                this.setState({ sendToConversation: res, pendingNotifications: total })
            })


        logic.retrieveUserProfile(this.props.userId)
            .then(res => {
                this.setState({ name: res.name })
            })

    }

    componentWillReceiveProps(props) {

        logic.listConversations()
            .then(res => {
                let total = 0
                res.forEach(item => total = item[1].pendingMessages + total)
                this.setState({ sendToConversation: res, pendingNotifications: total })
            })


        logic.retrieveUserProfile(this.props.userId)
            .then(res => {
                this.setState({ name: res.name })
            })
        if (props.location.pathname.indexOf('home') >= 0) {
            let newSelected = {
                home: true,
                explore: false,
                profile: false
            }
            this.setState({ selected: newSelected })
        }
        else if (props.location.pathname.indexOf('explore') >= 0) {
            let newSelected = {
                home: false,
                explore: true,
                profile: false
            }
            this.setState({ selected: newSelected })
        }
        else if (props.location.pathname.indexOf('profile') >= 0) {
            let newSelected = {
                home: false,
                explore: false,
                profile: true
            }
            this.setState({ selected: newSelected })
        }
        else if (props.location.pathname.indexOf('messages') >= 0) {
            if (props.pendingNotifications !== this.state.pendingNotifications) {


                this.setState({ pendingNotifications: props.pendingNotifications })

            }
            else {
                let newSelected = {
                    home: false,
                    explore: false,
                    profile: false
                }
                this.setState({ selected: newSelected })
            }
        }
    }



    toggleCollapse = () => this.setState({ isOpen: !this.state.isOpen })

    render() {
        const { selected, isOpen } = this.state

        return (

            <Navbar color="indigo" dark expand="md">
                <NavbarBrand>
                    <button className="navbar__button" onClick={this.onLogoClick}><strong className="white-text">SocialDev</strong></button>
                </NavbarBrand>
                <NavbarToggler
                    onClick={this.toggleCollapse}
                />
                <Collapse
                    id="navbarCollapse3"
                    isOpen={isOpen}
                    navbar
                >
                    <NavbarNav>
                        <NavItem>
                            <button onClick={this.onHomeClick} className={selected.home ? 'navbar__button-selected' : 'navbar__button'} type="button">Home</button>
                        </NavItem>
                        <NavItem >
                            <button onClick={this.onExploreClick} className={selected.explore ? 'navbar__button-selected' : 'navbar__button'} type="button">Explore</button>
                        </NavItem>
                        <NavItem >
                            <button onClick={this.onProfileClick} className={selected.profile ? 'navbar__button-selected' : 'navbar__button'} type="button">Profile</button>
                        </NavItem>
                        <NavItem >
                            {this.renderMessageIcon()}
                        </NavItem>
                        <NavItem >
                            <span className="name">Welcome {this.state.name ? this.state.name : null}</span>
                        </NavItem>
                        <NavItem >
                            <button onClick={this.handleLogout} className="navbar__button" type="button">Logout</button>
                        </NavItem>
                    </NavbarNav>

                </Collapse>

            </Navbar>
        );
    }
}

export default withRouter(Navbarpage);