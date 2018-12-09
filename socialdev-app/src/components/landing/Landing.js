import React from 'react'
import './landing.css'
import { Button } from 'mdbreact'

const Landing = props => {
    return (
        <div>
            <div className="top-area-landing">
                <div className="img-container">
                    <div className="title-container">
                        <h1>SocialDev</h1>
                        <div className="buttons-container">
                            <Button color="blue"  onClick={props.onLoginClick} >Login</Button>
                            <Button color="blue" onClick={props.onRegisterClick}>Register</Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="app-info">
                <div className="app-info__detail explore">
                    <i className="fa fa-search" aria-hidden="true"></i>
                    <h2>Find a project that you would like to collaborate in</h2>
                </div>
                <div className="app-info__detail meet">
                    <i className="fa fa-group" aria-hidden="true"></i>
                    <h2>Meet like-minded colleagues </h2>
                </div>
                <div className="app-info__detail develop">
                    <i className="fa fa-code" aria-hidden="true"></i>
                    <h2>Do what you know best and make cool projects!</h2>
                </div>
            </div>
        </div>

    )
}

export default Landing