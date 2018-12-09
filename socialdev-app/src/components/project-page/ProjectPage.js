import React, { Component } from 'react'
import logic from '../../logic'
import './projectpage.css'
import { Button } from 'mdbreact'
import Collapsible from '../collapse/Collapse'
import Meetings from '../meetings/Meetings'
import CollaboratorCard from '../collaborator-card/CollaboratorCard'
import { withRouter } from 'react-router-dom'
import SkillsTag from '../skills-tag/SkillsTag'
import MeetingAttendeesModal from '../meet-attendees-modal/MeetingAttendeesModal'
import Error from '../error/Error'
import MDSpinner from "react-md-spinner"

class ProjectPage extends Component {
    state = {
        project: null,
        meetings: null,
        user: null,
        projectImage: null,
        commonInterestToggle: false,
        error: false,
        loading: false
    }
    componentDidMount() {
        try {
            return logic.retrieveProjectInfo(this.props.id)
                .then(res => this.setState({ project: res, error: false }))
                .then(() => logic.listProjectMeetings(this.props.id))
                .then(res => this.setState({ meetings: res, error: false }))
                .then(() => logic.retrieveProjectImage(this.props.userId, this.props.id))
                .then(res => this.setState({ projectImage: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    acceptCollabHandle = (id) => {
        try {

            return logic.handleCollaboration(this.state.project.id, 'accept', id)
                .then(() => logic.retrieveProjectInfo(this.props.id))
                .then(res => this.setState({ project: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    rejectCollabHandle = (id) => {
        try {

            return logic.handleCollaboration(this.state.project.id, 'reject', id)
                .then(() => logic.retrieveProjectInfo(this.props.id))
                .then(res => this.setState({ project: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleDeleteMeeting = (meetingId) => {
        try {

            return logic.deleteMeeting(meetingId)
                .then(() => logic.listProjectMeetings(this.props.id))
                .then(res => this.setState({ meetings: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleAttendMeeting = (meetingId) => {
        try {

            return logic.attendMeeting(meetingId)
                .then(() => logic.listProjectMeetings(this.props.id))
                .then(res => this.setState({ meetings: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }

    }

    handleUnAttendMeeting = (meetingId) => {
        try {
            return logic.unAttendMeeting(meetingId)
                .then(() => logic.listProjectMeetings(this.props.id))
                .then(res => this.setState({ meetings: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleDeleteProject = () => {
        try {

            const { userId, id } = this.props
            return logic.deleteProject(userId, id)
                .then(() => this.props.history.push('/home'))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleLeaveProject = () => {
        const { id } = this.props
        try {

            return logic.leaveProject(id)
                .then(() => logic.retrieveProjectInfo(this.props.id))
                .then(res => this.setState({ project: res, error: false }))
                .then(() => logic.listProjectMeetings(this.props.id))
                .then(res => this.setState({ meetings: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleRequestCollaboration = () => {
        const { id, userId } = this.props
        try {
            return logic.requestCollaboration(id, userId)
                .then(() => logic.retrieveProjectInfo(this.props.id))
                .then(res => this.setState({ project: res, error: false }))
                .catch((err) => this.setState({ error: err.message }))

        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleCancelCollaboration = () => {
        const { id, userId } = this.props
        try {
            return logic.cancelCollaborationRequest(id, userId)
                .then(() => logic.retrieveProjectInfo(this.props.id))
                .then(res => this.setState({ project: res, error: false }))
                .catch((err) => this.setState({ error: err.message }))

        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleSaveProject = () => {
        const { id, userId } = this.props
        try {

            return logic.saveProject(id, userId)
                .then(() => logic.retrieveProjectInfo(id))
                .then(res => this.setState({ project: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleUnFollowProjects = () => {
        const { id, userId } = this.props
        try {

            return logic.removeSavedProject(id, userId)
                .then(() => logic.retrieveProjectInfo(id))
                .then(res => this.setState({ project: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }


    handleSearchTag = (query) => {

        const searchQuery = `q=&f=${query}`
        this.props.history.push(`/explore/${searchQuery}`)
    }

    handleRemoveCollaborator = (collaboratorId) => {
        try {

            return logic.removeCollaborator(collaboratorId, this.props.id)
                .then(() => logic.retrieveProjectInfo(this.props.id))
                .then(res => this.setState({ project: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }


    renderCollabButtons = () => {

        const { state: { project }, props: { userId } } = this
        if (project) {

            if (project.collaborators.some(item => item.id === userId)) {
                return (< div className="project-page-new-meeting">
                    <Button color="red" onClick={this.handleLeaveProject}>Leave project</Button>
                </div>)
            } else if (!project.collaborators.some(item => item.id === userId) && !(project.pendingCollaborators.some(item => item.id === userId))) {
                return (
                    < div className="project-page-new-meeting">
                        <Button color="blue" onClick={this.handleRequestCollaboration}>Collaborate now</Button>
                    </div>
                )
            } else {
                return (
                    <div className="project-page-request-collaborate">
                        <Button color="red" onClick={this.handleCancelCollaboration}>Cancel collaboration request</Button>
                    </div>
                )
            }
        }
    }

    clickProfileName = (event, id) => {

        if (!id) this.props.history.push(`/profile/${this.state.project.owner.id}`)
        else this.props.history.push(`/profile/${id}`)

    }

    calculateCommonInterests = () => {
        const { project } = this.state
        if (project) {
            const res = project.skills.filter(value => -1 !== project.viewerSkills.indexOf(value));
            if (res.length) return `Matches with ${(res.length / project.viewerSkills.length).toFixed(2) * 100}% of your interests`
            else return 'does not match with any of your interests :('

        }
    }

    renderCapacityCircles = () => {
        const { project } = this.state
        if (project) {          
            const arr = []
            for (var i = 0; i < parseInt(project.maxMembers); i++) arr.push(
                <i key={i} className="fa fa-circle-o" aria-hidden="true"></i>
            )
            
            for (var i=0; i< parseInt(project.currentMembers); i++) arr[i] = <i key={i} className="fa fa-circle" aria-hidden="true"></i>

            return arr
          
        }
   

     
    }

    toggleCommonInterests = () => {
        this.setState({ commonInterestToggle: !this.state.commonInterestToggle })
    }

    uploadImage = event => {
        try {
            this.setState({ loading: true })
            return logic.addProjectImage(event.target.files[0], this.props.id)
                .then(() => this.setState({ loading: false }))
                .then(() => {
                    return logic.retrieveProjectInfo(this.props.id)
                        .then(res => this.setState({ project: res, error: false }))
                        .catch(err => this.setState({ error: err.message }))
                })
        } catch (err) {
            this.setState({ error: err.message })
        }

    }

    renderFavouritesButtons = () => {
        const { state: { project }, props: { userId, id } } = this

        if (project) {
            if (project.viewerSavedProjects.includes(id) && !project.collaborators.some(item => item.id === userId)) {
                return (<div className="project-page-new-meeting">
                    <button className="common-interests-display" onClick={this.handleUnFollowProjects}><i className="fa fa-heart" aria-hidden="true"></i></button>
                    <p>Project saved</p>
                </div>)
            } else if (!(project.viewerSavedProjects.includes(id)) && !project.collaborators.some(item => item.id === userId)) {
                return (< div className="project-page-new-meeting">
                    <button className="common-interests-display" onClick={this.handleSaveProject}><i className="fa fa-heart-o" aria-hidden="true"></i></button>
                    <p>Save project</p>
                </div>)
            }
        }
    }

    getImageId = () => {
        if (this.state.project) return this.state.project.projectImage
    }

    handleAddNewEvent = () => {

        this.props.history.push(`/create-event/${this.props.id}`)
    }

    render() {
        const { project, meetings, commonInterestToggle } = this.state

        return <div className="project-page-container">
            {this.state.error && <Error message={this.state.error} />}
            <header className="project-top-section row">
                <div className="project-image-container col-md-3">
                    <h1 className="project-name-mobile">{project && project.name}</h1>
                    <div className="spinner">{this.state.loading ? <MDSpinner /> : ''}</div>
                    <div className="container__image--project">
                        <div className="project__image-box">
                            <img className="project__image" alt="project" src={project ? project.projectImage : null} />
                        </div>
                    </div>
                    {project && ((this.props.userId === project.owner.id)) && <form encType="multipart/form-data" onSubmit={this.uploadImage}>
                        <label className="profileImage-upload">
                            <input className="uploadImage-input" type="file" name="avatar" onChange={this.uploadImage} />
                            Edit image
                            </label>
                    </form>}
                </div>


                <div className="project-page-header-additional-info col-md-4" align="center">
                    <h1 className="project-name">{project && project.name}</h1>
                    <div className="owner-photo-and-extra-info row">
                        <div className="container__image--host-profile">
                            <div className="host-profile__image-box">
                                <img className="host-profile__image" src={project && project.owner.profileImage} alt="profile" />
                            </div>
                        </div>
                        <div className="owner-name-and-email col-md-9">
                            <span>Hosted by</span><p className="project-page-header-additional-info__user-link" onClick={this.clickProfileName}>{project && project.owner.name}</p>
                            <span>Host email:</span>{project && project.owner.email}
                        </div>
                    </div>
                </div>

                <div className="project-page-header-collab-and-favourites col-md-5">
                    {project && (!(this.props.userId === project.owner.id)) && this.renderCollabButtons()}
                    {project && (!(this.props.userId === project.owner.id)) && this.renderFavouritesButtons()}


                    {project && (this.props.userId === project.owner.id) ? < div className="project-page-new-meeting">
                        <Button color="blue" onClick={this.handleAddNewEvent}>Add a new event</Button>
                    </div> : null}

                    {project && (this.props.userId === project.owner.id) ? < div className="project-page-new-meeting">
                        <Button color="red" onClick={this.handleDeleteProject}>Delete project</Button>
                    </div> : null}
                </div>

       

            </header>
            <section className="project-page-main-section-container">
                <div className="row">
                    <div className="col-md-5">
                        <section className="project-page-project-info col-md-12">
                            <h2>Project Details</h2>
                            <h3>Location</h3>
                            <p>{project && project.location}</p>
                            <h3>Description</h3>
                            <p>{project && project.description}</p>
                            <h3>Capacity</h3>
                            <p>{project && (project.maxMembers!=project.currentMembers) && this.renderCapacityCircles()}</p>
                            {project && (project.maxMembers==project.currentMembers) ? <p>Project is full</p> :null}
                            <h3>Tech stack used</h3>
                            {project && project.skills.map((skill, index) => <SkillsTag searchTag={this.handleSearchTag} key={index} skill={skill} viewerSkills={project.viewerSkills} />)}
                            <button onClick={this.toggleCommonInterests} className="common-interests-display"><i className="fa fa-question-circle" aria-hidden="true"></i></button><p>{commonInterestToggle && this.calculateCommonInterests()}</p>
                        </section>
                        <section className="project-page-collaborators col-md-12">
                            <h1>Current Collaborators</h1>
                            <div className="project-page-collaborators-display row">
                                {project && project.collaborators.length ? project.collaborators.map((collaborator, index) => <CollaboratorCard clickName={this.clickProfileName} collaborator={collaborator} key={index} userId={this.props.userId} ownerId={project.owner.id} removeCollaborator={this.handleRemoveCollaborator} />) : <p>This project currently doesn't have any collaborators</p>}
                            </div>
                            {project && (this.props.userId === project.owner.id) ? <section className="project-page-pending-collaborators">
                                <Collapsible clickName={this.clickProfileName} accept={this.acceptCollabHandle} reject={this.rejectCollabHandle} pendingCollabs={project.pendingCollaborators} />
                            </section> : null}
                        </section>
                    </div>


                    <div className="current-and-pending-collaborators col-md-6">
                        <section className="project-page-meetings col-md-12">
                            <h2>Upcoming Meetings</h2>
                            {meetings && meetings.length ? meetings.sort((a, b) => a.realDate - b.realDate).map((meeting, index) => {
                                return (
                                    <div className="individual-meeting-container col-md-10" key={index}>
                                        <Meetings unAttendMeeting={this.handleUnAttendMeeting} attendMeeting={this.handleAttendMeeting} userId={this.props.userId} key={index} meeting={meeting} project={project} />

                                        <MeetingAttendeesModal clickName={this.clickProfileName} meetingId={meeting.id} />
                                        {(project.owner.id === this.props.userId) && <Button onClick={() => this.handleDeleteMeeting(meeting.id)} color="red">Delete</Button>}


                                    </div>)
                            }) : <p>This event doesn't have any upcoming meetings</p>}
                        </section>
                    </div>
                </div>

            </section>

        </div>
    }
}

export default withRouter(ProjectPage)