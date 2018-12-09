import React, { Component } from 'react'
import Checkbox from '../checkbox/Checkbox'
import './explore.css'
import logic from '../../logic'
import { withRouter, Link } from 'react-router-dom'
import ProjectCard from '../project-card/ProjectCard'
import FiltersCollapsible from '../filters-collapsible/FiltersCollapsible'
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

class Explore extends Component {
    state = {
        searchResults: false,
        searchQuery: '',
        cityQuery: '',
        recommended: '',
        error: false,
    }
    componentWillMount = () => {

        this.selectedCheckboxes = new Set();

    }

    componentDidMount() {
        try {
            if (this.props.query !== undefined) {
                logic.filterProjects(this.props.query)
                    .then(res => this.setState({ searchResults: res, error: false }))
                    .catch(err => this.setState({ error: err.message }))
            }
            else {
                logic.retrieveUserProfile(this.props.userId)
                    .then(res => {
                        const skill = res.skills
                        if (skill.length) {
                            const query = `q=&f=${skill[Math.floor(Math.random() * skill.length)]}&c=`
                            this.setState({ recommended: query, error: false })
                        }

                        else {
                            const query = `q=&f=&c=`
                            this.setState({ recommended: query, error: false })
                        }
                    })
                    .catch(err => this.setState({ error: err.message }))
            }
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    queryListen = (query) => {
        this.setState({ searchQuery: query, error: false })
    }

    componentWillReceiveProps(props) {
        try {

            if (props.query !== undefined) {
                logic.filterProjects(props.query)
                    .then(res => {
                        this.setState({ searchResults: res, error: false })

                    })
                    .catch(err => this.setState({ error: err.message }))
            }
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    toggleCheckbox = label => {

        if (this.selectedCheckboxes.has(label)) {

            this.selectedCheckboxes.delete(label);

        } else {

            this.selectedCheckboxes.add(label);
        }
    }

    onCityFilterChange = event => {
        const city = event.target.value

        this.setState({ cityQuery: city })

    }

    onSearchNameQueryChange = event => {
        const searchQuery = event.target.value
        this.setState({ searchQuery })
    }

    handleAddToFavourites = (id, action) => {
        try {

            if (action === 'add') {
                return logic.saveProject(id, this.props.userId)
                    .then(() => logic.filterProjects(this.props.query))
                    .then(res => this.setState({ searchResults: res, error: false }))
                    .catch(err => this.setState({error: err.message}))
            }
            else if (action === 'remove') {
                return logic.removeSavedProject(id, this.props.userId)
                    .then(() => logic.filterProjects(this.props.query))
                    .then(res => this.setState({ searchResults: res, error: false }))
                    .catch(err => this.setState({error: err.message}))
            }
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    renderSearchArea = () => {
        const { searchResults } = this.state
        if (searchResults) {
            if (!searchResults.length) return <p>No results found for this query :(</p>
            else if (searchResults.length) {
                return searchResults && searchResults.map((project, index) => <ProjectCard addToFavourites={this.handleAddToFavourites} userId={this.props.userId} searchTag={this.handleSearchTag} key={index} project={project} />)
            }
        } else {
            return <p>Not sure what to look for? <Link to={`/explore/${this.state.recommended}`}>Try some of our suggestions</Link></p>
        }

    }

    handleSubmit = event => {

        event.preventDefault()

        const { searchQuery, cityQuery } = this.state
        let skillsArray = []

        for (const checkbox of this.selectedCheckboxes) {

            skillsArray.push(checkbox)
        }

        let query = `q=${searchQuery}&f=${skillsArray.join('+')}&c=${cityQuery}`


        this.props.history.push(`/explore/${query}`)

    }


    handleSearchTag = (query) => {
        const searchQuery = `q=&f=${query}`
        this.props.history.push(`/explore/${searchQuery}`)
    }
    render() {
        return <div className="explore-container">
           {this.state.error && <Error message={this.state.error} />}
            <header className="explore-header col-12">
                <div className="searchbar-container col-md-6 col-xs-12">
                    <div className="explore-search-form">
                        <form onSubmit={this.handleSubmit}>
                            <label className="explore-search-form__label">
                                <input onChange={this.onSearchNameQueryChange} className="input-group-text explore-searchbar" type="text" placeholder="Search by project name" aria-label="Search" />
                                <button type="submit" className="explore-search-button">Search</button>
                            </label>
                        </form>
                    </div>
                </div>
            </header>
            <div className="filter-skills-mobile">
                <FiltersCollapsible skills={skills} handleCheckboxChange={this.toggleCheckbox} selected={this.selectedCheckboxes} onChange={this.onCityFilterChange} />
            </div>
            <div className="main-explore-area row">
                <div className="filters col-lg-3 col-s-12">

                    <h1>What are you looking to learn?</h1>

                    <div className='filter-skills'>
                        {skills.map((skill, index) => <Checkbox label={skill} handleCheckboxChange={this.toggleCheckbox} key={index} selected={this.selectedCheckboxes} />)}
                        <h1>Filter by city</h1>
                        <input className="input-group-text search-city-input" placeholder="Add a city" onChange={this.onCityFilterChange} type="text" />
                    </div>


                </div>
                <div className="search-area-container col-lg-8 col-s-12 ">
                    <div className="search-area  ">
                        {this.renderSearchArea()}
                    </div>
                </div>
            </div>
         
        </div>

    }
}

export default withRouter(Explore)