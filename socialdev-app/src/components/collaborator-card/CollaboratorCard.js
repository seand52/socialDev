import React from 'react'
import './collabcard.css'
const CollaboratorCard = props => {
    const { collaborator, clickName, userId, ownerId, removeCollaborator } = props

    if (collaborator) {
        return (
            <div className="collab-card col-3">
                <img src={collaborator.profileImage} alt="profile" />
                <p onClick={() => clickName(undefined, collaborator.id)}>{collaborator.name}</p>
                {(userId === ownerId) && <button className="remove-collab-button" onClick={() => removeCollaborator(collaborator.id)}>Remove</button>}
            </div>
        )
    } else return null

}

export default CollaboratorCard