import React from 'react'
import './error.css'

const Error = props => {

  return <div className="alert alert-danger">
    <strong>{props.message}!</strong>
  </div>

}

export default Error