import React, { Component } from 'react'
import './home.css'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import logic from '../../logic'
import ProjectCard from '../project-card/ProjectCard'
import CreateProject from '../create-project/CreateProject'
import { withRouter, Link } from 'react-router-dom'
import Error from '../error/Error'

class Home extends Component {
    state = {
        tabIndex: 0,
        collabProjects: null,
        ownProjects: null,
        savedProjects: null,
        user: false,
        error: false

    }

    componentDidMount() {
        try {
            logic.listOwnProjects()
                .then(res => this.setState({ ownProjects: res, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
                .catch(err => this.setState({ error: err.message }))
        }
        try {
            logic.retrieveUserProfile(this.props.userId)
                .then(res =>{
                    this.props.userName(res.name)
                    this.setState({ user: res, error: false })})
        } catch (err) {
            this.setState({ error: err.message })

        }
    }

    sendToMyProjects = () => {
        try {
            return logic.listOwnProjects()
                .then(res => this.setState({ ownProjects: res, tabIndex: 0, error: false }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }

    }

    handleTabChange = tabIndex => {
        try {
            switch (tabIndex) {
                case 0:
                    logic.listOwnProjects()
                        .then(res => this.setState({ ownProjects: res, tabIndex, error: false }))
                        .catch(err => this.setState({ error: err.message }))
                    window.scrollTo(0, 0)
                    break
                case 1:
                    logic.listCollaboratingProjects()
                        .then(res => this.setState({ collabProjects: res, tabIndex, error: false }))
                        .catch(err => this.setState({ error: err.message }))
                    window.scrollTo(0, 0)
                    break
                case 2:
                    logic.listSavedProjects()
                        .then(res => this.setState({ savedProjects: res, tabIndex, error: false }))
                        .catch(err => this.setState({ error: err.message }))
                    window.scrollTo(0, 0)
                    break
                case 3:
                    this.setState({ tabIndex, error: false })
                    window.scrollTo(0, 0)
                    break
                default:

            }
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleSearchTag = (query) => {

        const searchQuery = `q=&f=${query}`
        this.props.history.push(`/explore/${searchQuery}`)
    }


    render() {
        const { collabProjects, ownProjects, savedProjects, user } = this.state
        return <div className="home-page-container">
        {this.state.error && <Error message={this.state.error} />}
            <Tabs selectedIndex={this.state.tabIndex} onSelect={this.handleTabChange}>
        
                <TabList>
                    <Tab>My Projects</Tab>
                    <Tab>My Collaborations </Tab>
                    <Tab>Saved Projects</Tab>
                    <Tab>Create a project</Tab>
                </TabList>

                <TabPanel>
                    <div className="home-myprojects-display">
                        {ownProjects && (ownProjects.length ? ownProjects.map((project, index) => <ProjectCard from={'home'} userId={this.props.userId} searchTag={this.handleSearchTag} key={index} project={project} />) : <p className="no-projects-text">You don't have any projects. Start searching <Link to='/explore'>now</Link></p>)}
                    </div>
                </TabPanel>

                <TabPanel>
                    <div className="home-collaborations-display">
                        {collabProjects && (collabProjects.length ? collabProjects.map((project, index) => <ProjectCard userId={this.props.userId} savedProjects={user.savedProjects} searchTag={this.handleSearchTag} key={index} project={project} />) : <p className="no-projects-text">You don't have any projects. Start searching <Link to='/explore'>now</Link></p>)}
                    </div>
                </TabPanel>

                <TabPanel>
                    <div className="home-savedprojects-display">
                        {savedProjects && (savedProjects.length ? savedProjects.map((project, index) => <ProjectCard userId={this.props.userId} searchTag={this.handleSearchTag} key={index} project={project} />) : <p className="no-projects-text">You don't have any projects. Start searching <Link to='/explore'>now</Link></p>)}
                    </div>
                </TabPanel>

                <TabPanel>
                    <CreateProject backToMyProject={this.sendToMyProjects} />
                </TabPanel>
            </Tabs>
            
        </div>
    }

}

export default withRouter(Home)