import React from 'react'
import { Button, Card, CardBody, CardImage, CardTitle } from 'mdbreact';
import { withRouter, Link } from 'react-router-dom'
import SkillsTag from '../skills-tag/SkillsTag'
import './projectcard.css'

const ProjectCard = props => {
    const { project, searchTag, addToFavourites, userId, from } = props

    if (project) {
        return (
            <Card style={{ width: (from === 'profile' || from === 'home') ? "19rem" : "16rem", margin: "20px" }}>
                <CardImage
                    className="img-fluid"
                    src={project.projectImage}
                    style={{ height: "180px", width: "100%" }}
                    waves
                
                />
                <CardBody>
                    <CardTitle>{project.name}</CardTitle>

                    <p>Location: {project.location}</p>
                    {project.skills.map((skill, index) => <SkillsTag searchTag={searchTag} key={index} skill={skill} pill />)}
                    <div className="card-bottom-area">
                        <Link to={`/project/${project.id}`}><Button color="primary" type="button" >View Project</Button></Link>
                        {(project.owner !== userId) && (!project.collaborators.some(item => item.id !== userId)) && project.userSavedProjects && <button className="project-card-save-button" onClick={() => addToFavourites(project.id, project.userSavedProjects.includes(project.id) ? 'remove' : 'add')}><i className={project.userSavedProjects.includes(project.id) ? "fa fa-heart" : "fa fa-heart-o"} aria-hidden="true"></i></button>}
                    </div>

                </CardBody>
            </Card>

        )
    } else return null



}

export default withRouter(ProjectCard)