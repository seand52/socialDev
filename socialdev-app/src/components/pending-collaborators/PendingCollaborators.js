import React from 'react'
import { Button } from 'mdbreact'
import './pending-collaborators.css'


const PendingCollaborators = props => {
    const { pendingCollaborators, clickName } = props

    if (pendingCollaborators) {
        return (
            
            <section className="pending-collaborator-card">

                <img src={pendingCollaborators.profileImage} alt="profile" />

                <p onClick={() => clickName(undefined, pendingCollaborators.id)}>{pendingCollaborators.name}</p>

                <Button type="button" onClick={() => props.accept(pendingCollaborators.id)}>Accept</Button>

                <Button type="button" onClick={() => props.reject(pendingCollaborators.id)}>Reject</Button>

            </section >
        )
    } else return null

}

export default PendingCollaborators