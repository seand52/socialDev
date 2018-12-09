import React, { Component } from 'react'
import Checkbox from '../checkbox/Checkbox'
import { Button } from 'mdbreact'
import './updateprofileform.css'

const skills = [
    'Angular',
    'C-Sharp',
    'Java',
    'Javascript',
    'Mongoose',
    'PHP',
    'Python',
    'React',
    'Ruby',
    'SQL',
    'Swift',
    'Vue',
]
class UpdateProfileForm extends Component {

    state = {
        city: this.props.user ? this.props.user.city : '',
        githubProfile: this.props.user ? this.props.user.githubProfile : '',
        bio: this.props.user ? this.props.user.bio : '',
        skills: []
    }


    componentWillReceiveProps(props) {

        if (props.user && !props.toggleModal) {
            const { city, githubProfile, bio } = props.user

            this.setState({ city, githubProfile, bio })
        }

    }

    componentWillMount = () => {
        const { user } = this.props
        this.selectedCheckboxes = new Set();
        if (user) {
            user.skills.forEach(item => this.selectedCheckboxes.add(item) )
        }


    }

    handleSubmit = async event => {

        event.preventDefault()

        let skillsArray = []

        for (const checkbox of this.selectedCheckboxes) {

            skillsArray.push(checkbox)
        }

        await this.props.updateProfile(this.state.city, this.state.githubProfile, this.state.bio, skillsArray)
        
        this.props.toggleModal()




    }

    onCityChange = event => {
        const city = event.target.value

        this.setState({ city })

    }

    onGithubChange = event => {
        const githubProfile = event.target.value

        this.setState({ githubProfile })
    }

    onBioChange = event => {
        const bio = event.target.value

        this.setState({ bio })
    }

    toggleCheckbox = label => {

        if (this.selectedCheckboxes.has(label)) {

            this.selectedCheckboxes.delete(label);

        } else {

            this.selectedCheckboxes.add(label);
        }
    }

    render() {
        const { state: { city, githubProfile, bio } } = this
        return <div>
            <form onSubmit={this.handleSubmit}>
                <label>City</label>

                <input onChange={this.onCityChange} defaultValue={city} type="text" id="exampleForm2" className="form-control" />

                <label>Github Profile</label>

                <input onChange={this.onGithubChange} defaultValue={githubProfile} type="text" id="exampleForm2" className="form-control" />

                <label>Bio</label>

                <textarea onChange={this.onBioChange} defaultValue={bio} className="form-control rounded-0" id="exampleFormControlTextarea2" rows="3"></textarea>
                <div className="update-profile-checkboxes-display">
                {skills.map(skill => <Checkbox label={skill} handleCheckboxChange={this.toggleCheckbox} key={skill} selected={this.selectedCheckboxes} />)}
                </div>

                <Button type="submit" color="primary">Save changes</Button>
            </form>
        </div>
    }

}

export default UpdateProfileForm