import React, { Component } from 'react';
import { Button, Collapse } from 'mdbreact';
import Checkbox from '../checkbox/Checkbox'
class FiltersCollapsible extends Component {

    state = {
        collapse: false,
        pendingCollaborators: null
    }

    toggle = () => {
        this.setState({ collapse: !this.state.collapse });
    }

    render() {

        return (
            <div>
                <div>
                    <Button color="primary" onClick={this.toggle} style={{ marginBottom: "1rem" }}>Filters</Button>
                    <Collapse isOpen={this.state.collapse}>
                        {this.props.skills.map((skill, index) => <Checkbox label={skill} handleCheckboxChange={this.props.handleCheckboxChange} key={index} selected={this.props.selected} />)}
                        <h1>Filter by city</h1>
                        <input className="input-group-text search-city-input" placeholder="Add a city"  type="text" onChange={this.props.onChange} />
                    </Collapse>
                </div>
            </div>
        );
    }
}
export default FiltersCollapsible;