import React, { Component } from 'react';
import { Button, Collapse } from 'mdbreact';
import PendingCollaborators from '../pending-collaborators/PendingCollaborators'

class Collapsible extends Component {

  state = {
    collapse: false,
    pendingCollaborators: null
  }

  toggle = () => {
    this.setState({ collapse: !this.state.collapse });
  }

  componentWillReceiveProps(props) {
    if (props.pendingCollabs) this.setState({pendingCollaborators: props.pendingCollabs})

  }



  render() {
    const { pendingCollaborators } = this.state
    return (
      <div>
        <div>
          <Button color="primary" onClick={this.toggle} style={{ marginBottom: "1rem" }}>Pending Collaboration Requests</Button>
          <Collapse isOpen={this.state.collapse}>
            {pendingCollaborators && (pendingCollaborators.length ? pendingCollaborators.map((collaborator, index) => <PendingCollaborators clickName={this.props.clickName} key={index} pendingCollaborators={collaborator} accept={this.props.accept} reject = {this.props.reject}/>) : <p>No collaborators pending</p>)}
          </Collapse>
        </div>
      </div>
    );
  }
}
export default Collapsible;