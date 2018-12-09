import React from 'react'
import './skillstag.css'
const SkillsTag = props => {
    const { skill, searchTag, viewerSkills } = props

    if (viewerSkills && skill) {
        return (
            <button onClick={() => searchTag(skill)} className={(viewerSkills.includes(skill) ? "skills-tag-match" : "skills-tag")} type="button">{skill}</button>
        )
    }
    if (skill) {
        return (
            <button onClick={() => searchTag(skill)} className="skills-tag" type="button">{skill}</button>
        )
    } else return null


}

export default SkillsTag