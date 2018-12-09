import React from 'react'
import { Button } from 'mdbreact'
import Moment from 'react-moment'
const Meetings = props => {



    const { meeting, project, userId, attendMeeting, unAttendMeeting } = props
    if (meeting && project) {
        return (
            <div className="meeting-actions row">
                <div className="meeting-details col-8">
                    <p><span>Date</span>: <Moment format="DD/MM/YYYY">{meeting.date}</Moment></p>
                    <p><span>Time</span>: <Moment format="HH:mm">{meeting.date}</Moment></p>

                    <p><span>Description</span>: {meeting.description}</p>

                    <p><span>Location</span>: {meeting.location}</p>
                </div>
                <div className="meeting-buttons col-3">
                    {project && (!(userId === project.owner.id)) && (!meeting.attending.includes(userId)) && (project.collaborators.find(item => item.id === userId) !== undefined) ? <Button color="blue" type="button" onClick={() => attendMeeting(meeting.id)}>Attend</Button> : null}


                    {project && (!(userId === project.owner.id)) && (meeting.attending.includes(userId)) ? (
                        <div>
                            <Button color="red" onClick={() => unAttendMeeting(meeting.id)} type="button">Cancel Attendance</Button>
                        </div>
                    ) : null}

                </div>

            </div>
        )
    }
    else return null
}

export default Meetings