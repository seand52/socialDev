import React from 'react'
import './profile-card.css'
import { Badge } from 'mdbreact'
import Moment from 'react-moment'

const ProfileCard = props => {
    const { user, myProjects, collabProjects, showCollabProjects, projectsStarted, uploadImage, userId, meetings, numberOfMeetings, chats, totalPending } = props

    if (user) {
        const { name, joinDate, city} = user

        return (
            <div className="col-12 profile-card-container">
                <div className="general-info-container">
                    <div className='top-area'>
                        <div className='top-area-left-section'>
                            <div className='basic-info'>
                                <p><span>Name</span>: {name}</p>
                                <p><span>Joined</span>: <Moment format="DD/MM/YYYY">{joinDate}</Moment></p>
                                <p><span>Location</span>: {city}</p>
                            </div>
                            {(userId === user.id) && <form encType="multipart/form-data" onSubmit={uploadImage}>
                                <label className="profileImage-upload">
                                    <input type="file" className="uploadImage-input" name="avatar" onChange={uploadImage} />
                                    Upload image
                        </label>
                            </form>}
                        </div>
                        <div className="profile-img-container">
                            <div className="profile-img-box">
                            <img className="profile-img" src={user.profileImage} />
                            </div>
                    </div>
                </div>

            </div>
            <div className='bottom-area'>
                <button onClick={projectsStarted} type="button" className="profile-card-button" id="first-button" >
                    Projects started <br /> <Badge color="light-blue" pill >{myProjects ? myProjects.length : 0}</Badge>
                </button>
                {(userId === user.id) && <button onClick={showCollabProjects} type="button" className="profile-card-button" >
                    Projects with pending Collaborators <br /> <Badge color="light-blue" pill >{collabProjects ? collabProjects.length : 0}</Badge>
                </button>}
                <button onClick={() => meetings(user.id)} type="button" className="profile-card-button"  >
                    Upcoming Meetings <br /> <Badge color="light-blue" pill >{numberOfMeetings ? numberOfMeetings : 0}</Badge>
                </button>
                {(userId === user.id) && <button onClick={chats} type="button" className="profile-card-button" id="last-button" >
                    Chats <br /> New messages: <Badge color="light-blue" pill >{totalPending ? totalPending : 0}</Badge>
                </button>}

            </div>
            </div >
        )
    } else return null


}



export default ProfileCard