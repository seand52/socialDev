import React, { Component } from 'react'
import './profile.css'
import logic from '../../logic'
import ProfileCard from '../profile-card/ProfileCard'
import ProjectCard from '../project-card/ProjectCard'
import Modalpage from '../modal/Modalpage'
import SkillsTag from '../skills-tag/SkillsTag'
import { withRouter, Link } from 'react-router-dom'
import Moment from 'react-moment'
import Error from '../error/Error'
import MDSpinner from "react-md-spinner"
import { Button } from 'mdbreact'



class Profile extends Component {

    state = {
        user: null,
        ownProjects: false,
        collabProjects: false,
        upComingMeetings: false,
        showProjects: 'my projects',
        image: false,
        error: false,
        loading: false,
        chatPopup: false,
        chatMessage: '',
        conversations: false,
        totalPending: 0
    }

    componentDidMount() {
        const { id } = this.props
        try {

            Promise.all([logic.retrieveUserProfile(id), logic.retrievePendingCollaboratorProjects(id), logic.listOwnProjects(id), logic.retrieveProfileImage(id), logic.userUpcomingMeetings(id), logic.listConversations()])
                .then(res => {
                    let total = 0
                    res[5].forEach(item => total = item[1].pendingMessages + total)
                    this.setState({ user: res[0], collabProjects: res[1], ownProjects: res[2], image: res[3], upComingMeetings: res[4], conversations: res[5], totalPending: total, error: false })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    componentWillReceiveProps(props) {

        const { id } = props
        try {

            Promise.all([logic.retrieveUserProfile(id), logic.retrievePendingCollaboratorProjects(id), logic.listOwnProjects(id), logic.retrieveProfileImage(id), logic.userUpcomingMeetings(id), logic.listConversations()])
                .then(res => {
                    let total = 0
                    res[5].forEach(item => total = item[1].pendingMessages + total)
                    this.setState({ user: res[0], collabProjects: res[1], ownProjects: res[2], image: res[3], upComingMeetings: res[4], conversations: res[5], totalPending: total, error: false, chatPopup: false })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    sendProfileUpdate = (city, github, bio, skills) => {
        const { id } = this.props

        try {

            return logic.updateProfile(id, city, github, bio, skills)
                .then(() => logic.retrieveUserProfile(id))
                .then(res => {
                    this.setState({ user: res, error: false })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleShowCollabProjects = () => {
        const { id } = this.props
        try {
            return logic.retrievePendingCollaboratorProjects(id)
                .then(res => this.setState({ collabProjects: res, showProjects: 'collab projects', error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleshowOwnProjects = () => {
        const { id } = this.props
        try {
            return logic.listOwnProjects(id)
                .then(res => this.setState({ ownProjects: res, showProjects: 'my projects', error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleUpComingMeetings = (id) => {
        try {

            return logic.userUpcomingMeetings(id)
                .then(result => this.setState({ upComingMeetings: result, showProjects: 'meetings', error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleShowChats = () => {
        this.setState({ showProjects: 'chats' })
    }

    renderTitle = () => {

        const { user, showProjects } = this.state

        if (user) {
            if (showProjects === 'my projects') {
                return <h1>{user.name}'s projects</h1>
            }
            else if (showProjects === 'collab projects') {
                return <h1>Projects with pending collaborators</h1>
            }
            else if (showProjects === 'meetings') {
                return <h1>Upcoming Meetings</h1>
            } else {
                return <h1>Chats</h1>
            }
        }
    }

    goToMeetingProject = () => {

    }

    handleSearchTag = (query) => {

        const searchQuery = `q=&f=${query}`
        this.props.history.push(`/explore/${searchQuery}`)
    }

    handleChatStart = () => {
        logic.findConversation(this.props.id)
            .then(res => {

                if (!res) this.setState({ chatPopup: true })
                else this.props.history.push(`/messages/${res.id}/${this.props.id}`)
            })
    }

    onChatMessageChange = (event) => {
        const message = event.target.value
        this.setState({ chatMessage: message })
    }

    handleChatSubmit = (event) => {
        event.preventDefault()

        const { state: { chatMessage }, props: { userId, id } } = this

        return logic.sendMessage(userId, id, chatMessage)
            .then(() => logic.findConversation(this.props.id))
            .then(res => this.props.history.push(`/messages/${res.id}/${this.props.id}`))
    }

    handleUpload = event => {
        try {
            this.setState({ loading: true })
            return logic.addProfileImage(event.target.files[0])
                .then(() => this.setState({ loading: false }))
                .then(() => {
                    return logic.retrieveUserProfile(this.props.id)
                        .then(res => {
                            this.setState({ user: res, error: false })
                        })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    render() {
        const { state: { user, ownProjects, collabProjects, showProjects, image, upComingMeetings, conversations, totalPending }, props: { id, userId } } = this


        return <div className="profile-page-container">
            {this.state.error && <Error message={this.state.error} />}
            <div className="row">

                <section className="profile-top-area col-md-12  col-lg-4">
                    <div className="spinner">{this.state.loading ? <MDSpinner /> : ''}</div>
                    <ProfileCard uploadImage={this.handleUpload} showCollabProjects={this.handleShowCollabProjects} user={user} myProjects={ownProjects} projectsStarted={this.handleshowOwnProjects} collabProjects={collabProjects} userId={userId} profileImage={image} meetings={this.handleUpComingMeetings} numberOfMeetings={upComingMeetings && upComingMeetings.length} chats={this.handleShowChats} totalPending={totalPending} />

                    <section className="bio col-12">
                        <div className="bio__extra-info col-12">
                            {user && (user.id === userId) && <Modalpage className="testt" user={user} updateProfile={this.sendProfileUpdate} />}

                            <p className="bio-paragraph"><span>Bio</span>:{user && user.bio}</p>
                            <p><span>Github:</span> <a href="https://github.com">{user && user.githubProfile}</a></p>
                            <div className="bio__interests">
                                <h2>Interests</h2>
                                <div className="skills-tag-container">
                                    {user && user.skills.map((skill, index) => <SkillsTag searchTag={this.handleSearchTag} skill={skill} key={index} />)}
                                </div>
                            </div>

                        </div>
                    </section>
                    {(id !== userId) ? <Button color="primary" onClick={this.handleChatStart}> Chat with {user && user.name}</Button> : null}
                    {this.state.chatPopup && <div>
                        <p>This is your first message with {user && user.name}, make it count!</p>
                        <form onSubmit={this.handleChatSubmit}>
                            <textarea onChange={this.onChatMessageChange} className="form-control" rows="5" id="comment"></textarea>
                            <button className="chat-send-button-profile" type="submit">Send</button>
                        </form>

                    </div>}
                </section>

                <section className="main-area col-md-12 col-lg-7">
                    <div className="main-area__title">
                        {this.renderTitle()}

                    </div>
                    <div className="main-area__projects">
                        {user && (user.id === userId) && ownProjects && (showProjects === 'my projects') && (ownProjects.length ? ownProjects.map((project, index) => <ProjectCard from={'profile'} searchTag={this.handleSearchTag} key={index} project={project} />) : <p className="no-projects-text">You don't have any projects, start one <Link to='/home'>now</Link></p>)}

                        {user && (user.id !== userId) && ownProjects && (showProjects === 'my projects') && (ownProjects.length ? ownProjects.map((project, index) => <ProjectCard from={'profile'} searchTag={this.handleSearchTag} key={index} project={project} />) : <p className="no-projects-text">This user has not started any projects</p>)}

                        {collabProjects && (showProjects === 'collab projects') && (collabProjects.length ? collabProjects.map((project, index) => <ProjectCard from={'profile'} searchTag={this.handleSearchTag} key={index} project={project} />) : <p className="no-projects-text">No pending collaborators</p>)}

                        {upComingMeetings && (showProjects === 'meetings') && (upComingMeetings.length ? upComingMeetings.map((meeting, index) => {
                            return (<div className="profile-meetup-card col-md-8" key={index}>
                                <p><b>Description</b>: {meeting.description}</p>
                                <p><b>Project: </b><Link to={`/project/${meeting.project.id}`}>{meeting.project.name}</Link></p>
                                <p><b>Location</b>: {meeting.location}</p>
                                <p><b>Date</b>: <Moment format="DD/MM/YYYY HH:mm">{meeting.date}</Moment></p>
                                <p>Attending: {meeting.attending.length}</p>

                            </div>)
                        }) : <p className="no-projects-text">No upcoming meetings</p>)}

                        {conversations && (showProjects === 'chats') && (conversations.length ? conversations.map((conversation, index) => {
                            return <div key={index} className="conversation-card">
                                <div className="conversation-img-container">
                                    <div className="conversation-img-box">
                                        <img className="conversation-img" alt="profile" src={conversation[0].profileImage} />
                                    </div>
                                </div>

                                <Link to={`/messages/${conversation[1].conversationId}/${conversation[0].id}`}>{conversation[0].username}</Link>
                                <div><span className="badge light-blue badge-light-blue badge-pill">{conversation[1].pendingMessages}</span></div>

                            </div>
                        }) : <p className="no-projects-text">You don't have any active chats</p>)}

                    </div>
                </section>
            </div>

        </div>
    }

}

export default withRouter(Profile)