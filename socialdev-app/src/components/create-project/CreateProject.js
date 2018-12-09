import React, { Component } from 'react'
import { Button } from 'mdbreact'
import Checkbox from '../checkbox/Checkbox'
import logic from '../../logic'
import './create-project.css'
import Error from '../error/Error'
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

class CreateProject extends Component {

    state = {
        name: '',
        description: '',
        maxMembers: '1',
        error: false,
        toggleSuccess: false,
        location: '',
   

    }


    handleSubmit = (event) => {
        event.preventDefault()

        let skillsArray = []

        for (const checkbox of this.selectedCheckboxes) {

            skillsArray.push(checkbox)

        }

        const { name, description, maxMembers, location } = this.state

        try {
            return logic.addNewProject(name, description, skillsArray, maxMembers, location)
                .then(() => this.setState({ error: false, toggleSuccess: !this.state.toggleSuccess }))
                .then(() => this.props.backToMyProject())
                .catch(err => this.setState({error: err.message}))
        } catch (err) {
            this.setState({ error: err.message })
        }

    }

    componentWillMount = () => {

        this.selectedCheckboxes = new Set();

    }

    toggleCheckbox = label => {

        if (this.selectedCheckboxes.has(label)) {

            this.selectedCheckboxes.delete(label);

        } else {

            this.selectedCheckboxes.add(label);
        }
    }

    onProjectNameChange = event => {
        const name = event.target.value

        this.setState({ name, error: false })
    }

    onProjectDescriptionChange = event => {
        const description = event.target.value

        this.setState({ description, error: false })
    }

    onMaxMembersChange = event => {
        const maxMembers = event.target.value

        this.setState({ maxMembers, error: false })
    }

    onLocationChange = event => {

        const location = event.target.value
        this.setState({ location, error: false })
    }

    renderDropDown = () => {
        var members = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

        return members.map((item, index) => <option key={index} disabled={(index===0) ? 'disabled' : false} value={item}>{item}</option>)
    }



    render() {
        return <div className="newproject-container">
          {this.state.error && <Error message={this.state.error} />}
            <div className="row">
                <section className="create-project-form-section col-8 form-group">
                    <form className="create-project-form" onSubmit={this.handleSubmit}>
                        <label className="create-project__name-label">What will your project's name be?</label>

                        <input onChange={this.onProjectNameChange} type="text" id="exampleForm2" className="form-control" /><br />

                        <label className="create-project__description-label" >Describe who should join, and what you aim to achieve</label>

                        <textarea onChange={this.onProjectDescriptionChange} className="form-control" rows="5" id="comment"></textarea>

                        <label className="create-project__select-label">In what city will your meetings be hosted?</label><br />

                        <input onChange={this.onLocationChange} type="text" id="exampleForm2" className="form-control" /><br />


                        <label className="create-project__select-label">What is the maximum amount of members you would like to allow?</label><br />

                        <select className="create-project__select form-control" onChange={this.onMaxMembersChange} value={this.state.maxMembers} name="agent" id="agent">
                            {this.renderDropDown()}
      
                        </select> <br />

                        <label className="create-project__technologies-label">What technologies will your project include?</label>
                        <div className="create-project__skills-checkboxes">
                            {skills.map(skill => <Checkbox label={skill} handleCheckboxChange={this.toggleCheckbox} key={skill} selected={this.selectedCheckboxes} />)}
                        </div>
                        <Button type="submit" color="primary">Save changes</Button>
                    </form>


                    {this.state.error ? <p>You must complete all the fields</p> : null}

                    {this.state.toggleSuccess ? <p>Project added</p> : null}

                </section>
            </div>
          
        </div>

    }

}

export default CreateProject