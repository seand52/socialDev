import React, { Component } from 'react'
import logic from '../../logic'
import './meeting-attendees.css'
import {withRouter, Link} from 'react-router-dom'
import Error from '../error/Error'
class MeetingAttendees extends Component {
    state = {
        meeting: null,
        error: false
    }

    componentWillReceiveProps(props) {
        try {

            logic.retrieveMeetingInfo(props.meetingId)
            .then(res => this.setState({meeting: res, error: false}))
            .catch(err => this.setState({error: err.message}))
        } catch(err) {
            this.setState({error: err.message})
        }
    }

    componentDidMount() {
        try {

            logic.retrieveMeetingInfo(this.props.meetingId)
            .then(res => this.setState({meeting: res, error: false}))
            .catch(err => this.setState({error: err.message}))
        } catch(err) {
            this.setState({error: err.message})
        }
    }

    render() {
        const {meeting} = this.state
        return <div className="attendees-list">
        {meeting && meeting.attending.map((attendee, index) => <Link to={`/profile/${attendee.id}`}> <p onClick={this.props.clickName} key={index}>{attendee.name}</p></Link>)}
        {this.state.error && <Error message={this.state.error} />}
        </div>
    }
}

export default withRouter(MeetingAttendees)