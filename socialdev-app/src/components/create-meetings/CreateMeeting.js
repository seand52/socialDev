import React, { Component } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Input } from 'mdbreact'
import logic from '../../logic'
import { withRouter } from 'react-router-dom'
import './create-meeting.css'
import Error from '../error/Error'
class CreateMeeting extends Component {

    state = {
        startDate: new Date(),
        description: '',
        location: '',
        error: null,

    };

    handleSubmit = event => {
        event.preventDefault()
        const { startDate, description, location } = this.state
        try {
            return logic.addMeeting(this.props.userId, this.props.id, startDate, location, description)
                .then(() => this.props.history.push(`/project/${this.props.id}`))
                .catch(err => this.setState({error: err.message}))
        } catch (err) {
            this.setState({error: err.message})
        }
    }

    handleChange = date => {
        this.setState({
            startDate: date
        });
    }

    onDescriptionChange = event => {
        event.preventDefault()
        const description = event.target.value
        this.setState({ description })
    }

    onLocationChange = event => {
        event.preventDefault()
        const location = event.target.value
        this.setState({ location })
    }

    render() {
        return <div className="create-meeting-container col-sm-11 col-md-7">
              {this.state.error && <Error message={this.state.error} />}
            <form onSubmit={this.handleSubmit}>
                <label>What is the main goal of this meeting?</label>

                <Input type="textarea" onChange={this.onDescriptionChange} id="exampleForm2" className="form-control" rows="3" />

                <label>Location</label>

                <Input onChange={this.onLocationChange} type="text" cid="exampleForm2" className="form-control" />

                <label>Pick a date for your meeting</label> <br />
                <DatePicker
                    selected={this.state.startDate}
                    onChange={this.handleChange}
                    showTimeSelect
                    dateFormat="Pp"
                /> <br />
                <Button type="submit">Create Meeting</Button>
            </form>
      
        </div >
    }
}

export default withRouter(CreateMeeting)