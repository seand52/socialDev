import React, { Component } from 'react'
import { Button } from 'mdbreact'
import './login.css'


class Login extends Component {

    state = {
        username: '',
        password: ''
    }

    handleSubmit = (event) => {

        event.preventDefault()

        const { username, password } = this.state

        this.props.onLogin(username, password)
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
                    <input className="input-group-text form__input" placeholder="username" type="text" onChange={this.handleUsernameChange} />
                    <input className="input-group-text form__input" placeholder="password" type="password" onChange={this.handlePasswordChange} />
                    <Button color="blue" type="submit">Log in</Button>
                </form>
                <p className="go-back">Don't have an account? <button onClick={this.props.onSkipToRegister} className="go-back__button"  type="button">Sign up</button></p>
            </section>
        </div>
    }

}

export default Login