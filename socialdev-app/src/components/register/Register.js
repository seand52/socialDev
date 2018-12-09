import React, { Component } from 'react'
import './register.css'
import { Button } from 'mdbreact'

class Register extends Component {
    state = {
        name: '',
        email: '',
        username: '',
        password: ''
    }

    handleSubmit = event => {

        event.preventDefault()

        const { name, email, username, password } = this.state

        this.props.onRegister(name, email, username, password)
    }

    handleNameChange = (event) => {

        const name = event.target.value

        this.setState({ name })
    }

    handleEmailChange = (event) => {

        const email = event.target.value

        this.setState({ email })
    }

    handleUsernameChange = (event) => {

        const username = event.target.value

        this.setState({ username })
    }

    handlePasswordChange = (event) => {

        const password = event.target.value

        this.setState({ password })
    }

    render() {
        return <div className="background-container">
            <section className="form-container">
                <form className="form" onSubmit={this.handleSubmit}>
                    <input className="input-group-text form__input" placeholder="name" type="text" onChange={this.handleNameChange} />
                    <input className="input-group-text form__input" placeholder="email" type="text" onChange={this.handleEmailChange} />
                    <input className="input-group-text form__input" placeholder="username" type="text" onChange={this.handleUsernameChange} />
                    <input className="input-group-text form__input" placeholder="password" type="password" onChange={this.handlePasswordChange} />
                    <Button color="blue" type="submit">Register</Button>
                </form>
                <p className="go-back">Already have an account? <button onClick={this.props.onSkipToLogin} className="go-back__button" type="button">Log in</button></p>
            </section>
        </div>
    }
}

export default Register
